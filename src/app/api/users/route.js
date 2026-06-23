import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function GET(request) {
  const user = await currentUser();
  if (!user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const ids = String(url.searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return Response.json({ users: [] });
  }

  const users = [];
  for (const id of ids) {
    try {
      const profile = await clerkClient.users.getUser(id);
      users.push({
        id: profile.id,
        username:
          profile.username ||
          profile.firstName ||
          profile.primaryEmailAddress?.emailAddress ||
          "Unknown User",
      });
    } catch {
      // ignore missing user records
    }
  }

  return Response.json({ users });
}
