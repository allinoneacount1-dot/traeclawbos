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

    const knowledgeSources = await prisma.knowledgeSource.findMany({
      where: { organizationId },
      include: { organization: true },
    })
    return NextResponse.json(knowledgeSources)
  } catch (error) {
    console.error("Failed to fetch knowledge sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch knowledge sources" },
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
    const { name, type, url, content, organizationId } = body

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Type is required" },
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

    const knowledgeSource = await prisma.knowledgeSource.create({
      data: {
        name: name.trim(),
        type,
        url,
        content,
        organizationId,
      },
      include: { organization: true },
    })

    await logAuditEvent({
      userId: user.id,
      organizationId,
      action: "create_knowledge_source",
      entityType: "KnowledgeSource",
      entityId: knowledgeSource.id,
      metadata: { name: knowledgeSource.name, type: knowledgeSource.type },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(knowledgeSource)
  } catch (error) {
    console.error("Failed to create knowledge source:", error)
    return NextResponse.json(
      { error: "Failed to create knowledge source" },
      { status: 500 }
    )
  }
}
