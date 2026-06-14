import { clerkClient, currentUser } from "@clerk/nextjs/server";

async function getDiscordToken(userId) {
  const tokenResponse = await clerkClient.users.getUserOauthAccessToken(
    userId,
    "oauth_discord"
  );

  const tokenPayload =
    Array.isArray(tokenResponse) && tokenResponse.length > 0
      ? tokenResponse[0]
      : tokenResponse?.data?.[0] ?? tokenResponse;

  const token =
    tokenPayload?.access_token ??
    tokenPayload?.token ??
    tokenPayload?.oauth_access_token ??
    null;

  return token;
}

export async function GET() {
  const user = await currentUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getDiscordToken(user.id);
  if (!token) {
    return Response.json(
      {
        error:
          "Discord account token not found. Reconnect Discord with the 'guilds' scope in Clerk.",
      },
      { status: 400 }
    );
  }

  const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!guildsResponse.ok) {
    const errorText = await guildsResponse.text();
    return Response.json(
      { error: "Failed to fetch Discord servers", details: errorText },
      { status: guildsResponse.status }
    );
  }

  const guilds = await guildsResponse.json();
  const normalizedGuilds = Array.isArray(guilds)
    ? guilds.map((guild) => ({
        id: String(guild.id),
        name: String(guild.name || "Unknown Server"),
        icon: guild.icon || null,
        owner: Boolean(guild.owner),
        permissions: String(guild.permissions || "0"),
      }))
    : [];

  return Response.json({ guilds: normalizedGuilds });
}
