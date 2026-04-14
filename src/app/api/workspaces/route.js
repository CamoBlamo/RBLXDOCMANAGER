import { currentUser } from "@clerk/nextjs/server";
import { getDb } from "../../../lib/mongodb";
import {
  buildWorkspaceDocument,
  serializeWorkspace,
} from "../../../lib/workspaces";

export async function GET() {
  const user = await currentUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const collection = db.collection("workspaces");

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

  const owned = workspaces.filter((workspace) => workspace.ownerClerkUserId === user.id);
  const shared = workspaces.filter((workspace) => workspace.ownerClerkUserId !== user.id);

  return Response.json({ owned, shared, all: workspaces });
}

export async function POST(request) {
  const user = await currentUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  if (!String(payload?.guildId || "").trim()) {
    return Response.json(
      { error: "Discord server is required to create a workspace" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const collection = db.collection("workspaces");

  const ownedCount = await collection.countDocuments({
    ownerClerkUserId: user.id,
  });

  if (ownedCount >= 25) {
    return Response.json(
      { error: "Workspace limit reached (25 per account)" },
      { status: 400 }
    );
  }

  const doc = buildWorkspaceDocument(payload, user.id);
  const result = await collection.insertOne(doc);

  const workspace = serializeWorkspace({ _id: result.insertedId, ...doc });

  return Response.json({ workspace }, { status: 201 });
}
