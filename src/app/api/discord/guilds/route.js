import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function getDiscordToken(userId) {
  const tokenResponse = await clerkClient.users.getUserOauthAccessToken(
    userId,
    "oauth_discord"
  );

  const tokenPayload =
    Array.isArray(tokenResponse) && tokenResponse.length > 0
      ? tokenResponse[0]
      : tokenResponse?.data?.[0] ?? tokenResponse;

  return (
    tokenPayload?.access_token ??
    tokenPayload?.accessToken ??
    tokenPayload?.token ??
    tokenPayload?.oauth_access_token ??
    tokenPayload?.oauth_token ??
    null
  );
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getDiscordToken(user.id);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Discord account token not found. Reconnect Discord with the 'guilds' scope in Clerk.",
        },
        { status: 400 }
      );
    }

    const guildsResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const guildsText = await guildsResponse.text();

    if (!guildsResponse.ok) {
      const details =
        guildsText ||
        guildsResponse.statusText ||
        `Discord returned ${guildsResponse.status}`;
      return NextResponse.json(
        { error: "Failed to fetch Discord servers", details },
        { status: guildsResponse.status }
      );
    }

    const guilds = guildsText ? JSON.parse(guildsText) : [];

    const normalizedGuilds = Array.isArray(guilds)
      ? guilds.map((guild) => ({
          id: String(guild.id),
          name: String(guild.name ?? "Unknown Server"),
          icon: guild.icon ?? null,
          owner: Boolean(guild.owner),
          permissions: String(guild.permissions ?? "0"),
        }))
      : [];

    return NextResponse.json({ guilds: normalizedGuilds });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
