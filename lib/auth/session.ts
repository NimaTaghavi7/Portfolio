import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/authOptions";
import { ADMIN_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

/**
 * Authoritative admin session check.
 *
 * Middleware is only the first gate (it cannot query Prisma on the edge).
 * Every admin layout/page/action re-checks the database here so role changes
 * and session invalidation take effect immediately. If the database is
 * unavailable this fails closed.
 */
export const getAdminSession = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  let user: { role: string; sessionVersion: number } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, sessionVersion: true },
    });
  } catch (error) {
    console.error("Failed to verify admin session", error);
    return null;
  }

  if (!user) return null;
  if (!ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) return null;
  if (user.sessionVersion !== session.user.sessionVersion) return null;

  session.user.role = user.role;
  session.user.sessionVersion = user.sessionVersion;
  return session;
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
