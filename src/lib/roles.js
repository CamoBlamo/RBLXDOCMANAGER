import { clerkClient } from "@clerk/nextjs/server";

export const EMPLOYEE_PLUS_ROLES = [
  "employee",
  "supervisor",
  "manager",
  "admin",
  "owner",
];

export const OWNER_ROLES = ["owner", "admin"];

export function normalizeRole(roleValue) {
  return String(roleValue || "").trim().toLowerCase();
}

export async function ensureUserRole(user) {
  if (!user?.id) {
    return "user";
  }

  const currentRole = normalizeRole(user?.publicMetadata?.role);
  if (currentRole) {
    return currentRole;
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      role: "user",
    },
  });

  return "user";
}
