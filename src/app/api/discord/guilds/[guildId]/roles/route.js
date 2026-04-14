// Discord role listing requires a bot token and is not currently supported.
// Role-based access is handled via Discord user IDs instead.
export async function GET() {
  return Response.json(
    {
      error:
        "Discord role listing is not available. Use Discord user IDs for access control instead.",
      roles: [],
    },
    { status: 501 }
  );
}
