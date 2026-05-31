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
    const agentId = searchParams.get("agentId")

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "viewer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const where: any = { agent: { organizationId } }
    if (agentId) where.agentId = agentId

    const memories = await prisma.agentMemory.findMany({
      where,
      include: { agent: true },
    })
    return NextResponse.json(memories)
  } catch (error) {
    console.error("Failed to fetch memories:", error)
    return NextResponse.json(
      { error: "Failed to fetch memories" },
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
    const { content, type, agentId } = body

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      )
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Type is required and must be a string" },
        { status: 400 }
      )
    }

    if (!agentId || typeof agentId !== "string") {
      return NextResponse.json(
        { error: "AgentId is required" },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, organization: { members: { some: { userId: user.id } } } },
      include: { organization: true }
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found or not authorized" },
        { status: 403 }
      )
    }

    const member = await getUserOrganizationMember(user.id, agent.organizationId)
    if (!member || !hasPermission(member.role, "member")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const memory = await prisma.agentMemory.create({
      data: {
        content: content.trim(),
        type,
        agentId,
      },
      include: { agent: true },
    })

    await logAuditEvent({
      userId: user.id,
      organizationId: agent.organizationId,
      action: "create_agent_memory",
      entityType: "AgentMemory",
      entityId: memory.id,
      metadata: { type: memory.type, agentId: memory.agentId },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(memory)
  } catch (error) {
    console.error("Failed to create memory:", error)
    return NextResponse.json(
      { error: "Failed to create memory" },
      { status: 500 }
    )
  }
}
