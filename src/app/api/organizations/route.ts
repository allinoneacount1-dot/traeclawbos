import { prisma } from "@/lib/prisma"
import { authenticate, logAuditEvent, getClientIp } from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: { agents: true, members: true },
    })
    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Failed to fetch organizations:", error)
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
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
    const { name, tokenAddress } = body

    // Input validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        tokenAddress,
        userId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner"
          }
        }
      },
      include: { members: true }
    })

    await logAuditEvent({
      userId: user.id,
      organizationId: organization.id,
      action: "create_organization",
      entityType: "Organization",
      entityId: organization.id,
      metadata: { name: organization.name },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Failed to create organization:", error)
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    )
  }
}
