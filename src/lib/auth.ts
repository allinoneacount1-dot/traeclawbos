import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}

export async function getUserOrganizationMember(userId: string, organizationId: string) {
  return await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId }
    },
    include: { organization: true }
  });
}

export function hasPermission(memberRole: string, requiredRole: string) {
  const roles = ["viewer", "member", "admin", "owner"];
  const memberIndex = roles.indexOf(memberRole);
  const requiredIndex = roles.indexOf(requiredRole);
  return memberIndex >= requiredIndex;
}

export async function logAuditEvent({
  userId,
  organizationId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent
}: {
  userId?: string;
  organizationId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return await prisma.auditLog.create({
    data: {
      userId,
      organizationId,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress,
      userAgent,
    },
  });
}

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
