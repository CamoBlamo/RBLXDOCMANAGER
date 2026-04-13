import { auth, clerkClient } from "@clerk/nextjs/server";
import { EMPLOYEE_PLUS_ROLES, OWNER_ROLES, normalizeRole } from "../../../../lib/roles";

const ALLOWED_TARGET_ROLES = ["user", ...EMPLOYEE_PLUS_ROLES];

async function requireOwnerOrAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }

  const client = await clerkClient();
  const current = await client.users.getUser(userId);
  const currentRole = normalizeRole(current?.publicMetadata?.role);

  if (!OWNER_ROLES.includes(currentRole)) {
    return { error: new Response("Forbidden", { status: 403 }) };
  }

  return { client, currentUserId: userId };
}

export async function GET() {
  const authResult = await requireOwnerOrAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { client } = authResult;
    const result = await client.users.getUserList({ limit: 100 });
    const users = (result?.data || []).map((u) => ({
      id: u.id,
      fullName:
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        u.primaryEmailAddress?.emailAddress ||
        "Unknown User",
      email: u.primaryEmailAddress?.emailAddress || "No email",
      role: normalizeRole(u.publicMetadata?.role) || "user",
    }));

    return Response.json({ users });
  } catch (error) {
    return new Response("Failed to fetch users", { status: 500 });
  }
}

export async function PATCH(req) {
  const authResult = await requireOwnerOrAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { client, currentUserId } = authResult;
    const body = await req.json();

    const targetUserId = String(body?.userId || "").trim();
    const nextRole = normalizeRole(body?.role);

    if (!targetUserId || !nextRole) {
      return new Response("Missing userId or role", { status: 400 });
    }

    if (!ALLOWED_TARGET_ROLES.includes(nextRole)) {
      return new Response("Invalid role", { status: 400 });
    }

    if (targetUserId === currentUserId && nextRole !== "owner") {
      return new Response("Owner cannot remove their own owner role", {
        status: 400,
      });
    }

    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: nextRole,
      },
    });

    return Response.json({ ok: true, userId: targetUserId, role: nextRole });
  } catch (error) {
    return new Response("Failed to update role", { status: 500 });
  }
}
