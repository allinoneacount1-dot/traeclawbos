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

    const [
      organizationsCount,
      agentsCount,
      knowledgeSourcesCount,
      memoriesCount,
      agentTypes
    ] = await Promise.all([
      prisma.organization.count({ where: { id: organizationId } }),
      prisma.agent.count({ where: { organizationId } }),
      prisma.knowledgeSource.count({ where: { organizationId } }),
      prisma.agentMemory.count({ where: { agent: { organizationId } } }),
      prisma.agent.groupBy({
        by: ["type"],
        where: { organizationId },
        _count: true
      })
    ])

    return NextResponse.json({
      organizations: organizationsCount,
      agents: agentsCount,
      knowledgeSources: knowledgeSourcesCount,
      memories: memoriesCount,
      agentTypes
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
