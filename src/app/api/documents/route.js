import { ObjectId } from "mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { getDb } from "../../../lib/mongodb";
import { normalizeRole } from "../../../lib/roles";
import { userCanAccessWorkspace } from "../../../lib/workspaces";

function parseObjectId(id) {
  try {
    return new ObjectId(String(id));
  } catch {
    return null;
  }
}

function serializeDocument(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: String(_id),
    ...rest,
  };
}

function getDiscordUserId(user) {
  const discord = (user?.externalAccounts || []).find(
    (account) => account.provider === "oauth_discord"
  );
  return String(discord?.providerUserId || "");
}

async function getWorkspaceAndAccess(workspaceId, user) {
  const db = await getDb();
  const workspaceObjectId = parseObjectId(workspaceId);
  if (!workspaceObjectId) {
    return { error: "Invalid workspaceId", status: 400 };
  }

  const workspace = await db.collection("workspaces").findOne({
    _id: workspaceObjectId,
  });

  if (!workspace) {
    return { error: "Workspace not found", status: 404 };
  }

  const canAccess = userCanAccessWorkspace(workspace, {
    clerkUserId: user.id,
    appRole: normalizeRole(user?.publicMetadata?.role),
    discordUserId: getDiscordUserId(user),
  });

  if (!canAccess) {
    return { error: "Forbidden", status: 403 };
  }

  return { db, workspace, workspaceObjectId };
}

export async function GET(request) {
  const user = await currentUser();
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId");

  if (!workspaceId) {
    return Response.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const access = await getWorkspaceAndAccess(workspaceId, user);
  if (access.error) {
    return Response.json({ error: access.error }, { status: access.status });
  }

  const docs = await access.db
    .collection("documents")
    .find({ workspaceId: String(access.workspaceObjectId) })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray();

  return Response.json({ documents: docs.map(serializeDocument) });
}

export async function POST(request) {
  const user = await currentUser();
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const workspaceId = String(payload?.workspaceId || "").trim();

  if (!workspaceId) {
    return Response.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const access = await getWorkspaceAndAccess(workspaceId, user);
  if (access.error) {
    return Response.json({ error: access.error }, { status: access.status });
  }

  const now = new Date().toISOString();
  const doc = {
    workspaceId: String(access.workspaceObjectId),
    title: String(payload?.title || "").trim() || "Untitled Document",
    summary: String(payload?.summary || "").trim() || "",
    content: String(payload?.content || ""),
    visibility: String(payload?.visibility || "workspace"),
    minimumRole: String(payload?.minimumRole || "member"),
    allowComments: Boolean(payload?.allowComments ?? true),
    allowDownload: Boolean(payload?.allowDownload ?? false),
    collaborators: Array.isArray(payload?.collaborators) ? payload.collaborators : [],
    createdByClerkUserId: user.id,
    updatedByClerkUserId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const result = await access.db.collection("documents").insertOne(doc);
  return Response.json(
    { document: serializeDocument({ _id: result.insertedId, ...doc }) },
    { status: 201 }
  );
}

export async function PATCH(request) {
  const user = await currentUser();
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const documentId = String(payload?.documentId || "").trim();

  if (!documentId) {
    return Response.json({ error: "documentId is required" }, { status: 400 });
  }

  const documentObjectId = parseObjectId(documentId);
  if (!documentObjectId) {
    return Response.json({ error: "Invalid documentId" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("documents").findOne({
    _id: documentObjectId,
  });

  if (!existing) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  const access = await getWorkspaceAndAccess(existing.workspaceId, user);
  if (access.error) {
    return Response.json({ error: access.error }, { status: access.status });
  }

  const update = {
    title: String(payload?.title || existing.title || "Untitled Document"),
    summary: String(payload?.summary || ""),
    content: String(payload?.content || ""),
    visibility: String(payload?.visibility || existing.visibility || "workspace"),
    minimumRole: String(payload?.minimumRole || existing.minimumRole || "member"),
    allowComments: Boolean(payload?.allowComments ?? existing.allowComments),
    allowDownload: Boolean(payload?.allowDownload ?? existing.allowDownload),
    collaborators: Array.isArray(payload?.collaborators)
      ? payload.collaborators
      : existing.collaborators || [],
    updatedByClerkUserId: user.id,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("documents").updateOne(
    { _id: documentObjectId },
    {
      $set: update,
    }
  );

  return Response.json({
    document: serializeDocument({ _id: documentObjectId, ...existing, ...update }),
  });
}
