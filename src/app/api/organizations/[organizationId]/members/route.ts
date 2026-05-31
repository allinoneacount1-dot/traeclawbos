import { prisma } from "@/lib/prisma"
import { authenticate, getUserOrganizationMember, hasPermission, logAuditEvent, getClientIp } from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"

interface RouteParams {
  params: Promise<{ organizationId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = await params
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "viewer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch organization members:", error)
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = await params
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { walletAddress, role = "member" } = body

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const validRoles = ["owner", "admin", "member", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    let targetUser = await prisma.user.findFirst({
      where: { wallets: { some: { address: walletAddress } } },
      include: { wallets: true }
    })

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: { wallets: { create: { address: walletAddress } } },
        include: { wallets: true }
      })
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: targetUser.id } }
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 })
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: targetUser.id,
        role
      },
      include: { user: true }
    })

    await logAuditEvent({
      userId: user.id,
      organizationId,
      action: "invite_member",
      entityType: "OrganizationMember",
      entityId: newMember.id,
      metadata: { targetUserId: targetUser.id, role },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Failed to invite organization member:", error)
    return NextResponse.json(
      { error: "Failed to invite organization member" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = await params
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const validRoles = ["owner", "admin", "member", "viewer"]
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Valid role is required" }, { status: 400 })
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } }
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (existingMember.role === "owner" && member.role !== "owner") {
      return NextResponse.json({ error: "Cannot modify owner" }, { status: 403 })
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { role },
      include: { user: true }
    })

    await logAuditEvent({
      userId: user.id,
      organizationId,
      action: "update_member_role",
      entityType: "OrganizationMember",
      entityId: updatedMember.id,
      metadata: { targetUserId: userId, oldRole: existingMember.role, newRole: role },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Failed to update member role:", error)
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = await params
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await getUserOrganizationMember(user.id, organizationId)
    if (!member || !hasPermission(member.role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } }
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (existingMember.role === "owner") {
      return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 })
    }

    await prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId, userId } }
    })

    await logAuditEvent({
      userId: user.id,
      organizationId,
      action: "remove_member",
      entityType: "OrganizationMember",
      entityId: existingMember.id,
      metadata: { targetUserId: userId },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove organization member:", error)
    return NextResponse.json(
      { error: "Failed to remove organization member" },
      { status: 500 }
    )
  }
}
