import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

let mockUserForTest: SessionUser | null = null;

export function setMockUserForTest(user: SessionUser | null) {
  mockUserForTest = user;
}

/**
 * Retrieves the currently authenticated session user.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === "test" && mockUserForTest) {
    return mockUserForTest;
  }

  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return null;
    }
    return {
      id: session.user.id,
      name: session.user.name || "StockSense User",
      email: session.user.email || "",
      role: session.user.role || UserRole.WAREHOUSE_STAFF,
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error retrieving current user:", error);
    return null;
  }
}

/**
 * Enforces that a user is authenticated. Throws or redirects if unauthenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Enforces role-based authorization for server operations.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Role '${user.role}' does not have sufficient permission for this operation.`);
  }
  return user;
}

/**
 * Checks if user has specific permission.
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
