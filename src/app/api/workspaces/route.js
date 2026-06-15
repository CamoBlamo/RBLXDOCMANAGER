import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { buildWorkspaceDocument, serializeWorkspace } from "../../../lib/workspaces";

const DB_ERROR = (msg, status = 500) =>
  NextResponse.json({ error: msg }, { status });

async function getWorkspacesCollection() {
  const db = await getDb();
  return db.collection("workspaces");
}

export async function GET() {
  const user = await currentUser();
  if (!user?.id) return DB_ERROR("Unauthorized", 401);

  try {
    const collection = await getWorkspacesCollection();

    const docs = await collection
      .find({
        $or: [
          { ownerClerkUserId: user.id },
          { adminClerkUserIds: user.id },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const workspaces = docs.map(serializeWorkspace);
    const owned = workspaces.filter((w) => w.ownerClerkUserId === user.id);
    const shared = workspaces.filter((w) => w.ownerClerkUserId !== user.id);

    return NextResponse.json({ owned, shared, all: workspaces });
  } catch (err) {
    console.error("[GET /workspaces]", err.message);
    return DB_ERROR("Failed to fetch workspaces.");
  }
}

export async function POST(request) {
  const user = await currentUser();
  if (!user?.id) return DB_ERROR("Unauthorized", 401);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return DB_ERROR("Invalid request body.", 400);
  }

  if (!String(payload?.guildId || "").trim()) {
    return DB_ERROR("Discord server is required to create a workspace.", 400);
  }

  try {
    const collection = await getWorkspacesCollection();

    const ownedCount = await collection.countDocuments({
      ownerClerkUserId: user.id,
    });

    if (ownedCount >= 25) {
      return DB_ERROR("Workspace limit reached (25 per account).", 400);
    }

    const doc = buildWorkspaceDocument(payload, user.id);
    const result = await collection.insertOne(doc);
    const workspace = serializeWorkspace({ _id: result.insertedId, ...doc });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (err) {
    console.error("[POST /workspaces]", err.message);
    return DB_ERROR("Failed to create workspace.");
  }
}