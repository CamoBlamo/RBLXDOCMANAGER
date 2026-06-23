import { ObjectId } from "mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { buildWorkspaceDocument, serializeWorkspace } from "../../../lib/workspaces";

const DB_ERROR = (msg, status = 500) =>
  NextResponse.json({ error: msg }, { status });

function parseObjectId(id) {
  try {
    return new ObjectId(String(id));
  } catch {
    return null;
  }
}

function workspaceAdmin(workspace, userId) {
  if (!workspace || !userId) return false;
  if (workspace.ownerClerkUserId === userId) return true;
  return Array.isArray(workspace.adminClerkUserIds)
    ? workspace.adminClerkUserIds.includes(userId)
    : false;
}

async function getWorkspacesCollection() {
  const db = await getDb();
  return db.collection("workspaces");
}

export async function GET(request) {
  const user = await currentUser();
  if (!user?.id) return DB_ERROR("Unauthorized", 401);

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId");

  try {
    const collection = await getWorkspacesCollection();

    if (workspaceId) {
      const workspaceObjectId = parseObjectId(workspaceId);
      if (!workspaceObjectId) {
        return DB_ERROR("Invalid workspaceId", 400);
      }

      const doc = await collection.findOne({ _id: workspaceObjectId });
      if (!doc) {
        return DB_ERROR("Workspace not found", 404);
      }

      if (!workspaceAdmin(doc, user.id)) {
        return DB_ERROR("Forbidden", 403);
      }

      return NextResponse.json({ workspace: serializeWorkspace(doc) });
    }

    const docs = await collection
      .find({
        $or: [
          { ownerClerkUserId: user.id },
          { adminClerkUserIds: user.id },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const workspaces = docs.map((doc) => {
      const workspace = serializeWorkspace(doc);
      return {
        ...workspace,
        access: {
          ownerClerkUserId: workspace.ownerClerkUserId,
          adminClerkUserIds: workspace.adminClerkUserIds,
          adminDiscordUserIds: workspace.adminDiscordUserIds,
          allowedAppRoles: workspace.allowedAppRoles,
          allowedDiscordUserIds: workspace.allowedDiscordUserIds,
          visibility: workspace.visibility,
        },
      };
    });
    const owned = workspaces.filter((workspace) => workspace.ownerClerkUserId === user.id);
    const shared = workspaces.filter((workspace) => workspace.ownerClerkUserId !== user.id);

    return NextResponse.json({ owned, shared, all: workspaces });
  } catch (err) {
    console.error("[GET /workspaces]", err.message);
    return DB_ERROR("Failed to fetch workspaces.");
  }
}
export async function PATCH(request) {
  const user = await currentUser();
  if (!user?.id) return DB_ERROR("Unauthorized", 401);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return DB_ERROR("Invalid request body.", 400);
  }

  const workspaceId = String(payload?.workspaceId || "").trim();
  if (!workspaceId) {
    return DB_ERROR("workspaceId is required", 400);
  }

  const workspaceObjectId = parseObjectId(workspaceId);
  if (!workspaceObjectId) {
    return DB_ERROR("Invalid workspaceId", 400);
  }

  try {
    const collection = await getDb().then((db) => db.collection("workspaces"));
    const existing = await collection.findOne({ _id: workspaceObjectId });
    if (!existing) {
      return DB_ERROR("Workspace not found", 404);
    }
    if (!workspaceAdmin(existing, user.id)) {
      return DB_ERROR("Forbidden", 403);
    }

    const update = {
      name: String(payload?.name || existing.name || "Untitled Workspace").trim(),
      description: String(payload?.description || existing.description || ""),
      guildName: String(payload?.guildName || existing.guildName || "Unknown Server").trim(),
      visibility: String(payload?.visibility || existing.visibility || "private"),
      updatedAt: new Date().toISOString(),
    };

    await collection.updateOne({ _id: workspaceObjectId }, { $set: update });
    const updated = await collection.findOne({ _id: workspaceObjectId });

    return NextResponse.json({
      workspace: serializeWorkspace(updated),
    });
  } catch (err) {
    console.error("[PATCH /workspaces]", err.message);
    return DB_ERROR("Failed to update workspace.");
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