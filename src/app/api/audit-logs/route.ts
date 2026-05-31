import { prisma } from "@/lib/prisma"
import { authenticate, getUserOrganizationMember, hasPermission } from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "viewer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
    const offset = Number(searchParams.get("offset")) || 0

    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })

    const formattedLogs = auditLogs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("Failed to fetch audit logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}
