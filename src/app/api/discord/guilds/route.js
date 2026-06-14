import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function getDiscordToken(userId) {
  try {
    const response = await clerkClient.users.getUserOauthAccessToken(userId, "oauth_discord");
    const tokens = response?.data ?? (Array.isArray(response) ? response : []);
    const token = tokens[0];
    return token?.token ?? token?.accessToken ?? token?.access_token ?? null;
  } catch (err) {
    console.error("Clerk token fetch failed:", err);
    throw err;
  }
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
          error: "Discord account token not found. Reconnect Discord with the 'guilds' scope in Clerk.",
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
      console.error("Discord API error:", guildsResponse.status, details);
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
    console.error("Discord guilds route error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}