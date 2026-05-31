import { prisma } from "@/lib/prisma"
import { authenticate, getUserOrganizationMember, hasPermission, logAuditEvent, getClientIp } from "@/lib/auth"
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

    const agents = await prisma.agent.findMany({
      where: { organizationId },
      include: {
        organization: true,
      },
    })
    return NextResponse.json(agents)
  } catch (error) {
    console.error("Failed to fetch agents:", error)
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, goal, organizationId } = body

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      )
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Type is required and must be a string" },
        { status: 400 }
      )
    }

    if (!organizationId || typeof organizationId !== "string") {
      return NextResponse.json(
        { error: "OrganizationId is required" },
        { status: 400 }
      )
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "member")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        type,
        goal,
        organizationId,
      },
      include: {
        organization: true,
      },
    })

    await logAuditEvent({
      userId: user.id,
      organizationId,
      action: "create_agent",
      entityType: "Agent",
      entityId: agent.id,
      metadata: { name: agent.name, type: agent.type },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error("Failed to create agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}
