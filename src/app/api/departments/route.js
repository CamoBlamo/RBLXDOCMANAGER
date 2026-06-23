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

  const discord = (user?.externalAccounts || []).find(
    (account) => account.provider === "oauth_discord"
  );
  const discordUserId = String(discord?.providerUserId || "");
  const canAccess = userCanAccessWorkspace(workspace, {
    clerkUserId: user.id,
    appRole: normalizeRole(user?.publicMetadata?.role),
    discordUserId,
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

  const departments = await access.db
    .collection("departments")
    .find({ workspaceId: String(access.workspaceObjectId) })
    .sort({ name: 1 })
    .toArray();

  return Response.json({ departments: departments.map((department) => ({
    id: String(department._id),
    name: String(department.name || ""),
    description: String(department.description || ""),
    createdAt: department.createdAt,
    createdByClerkUserId: department.createdByClerkUserId,
  })) });
}

export async function POST(request) {
  const user = await currentUser();
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const workspaceId = String(payload?.workspaceId || "").trim();
  const name = String(payload?.name || "").trim();
  const description = String(payload?.description || "").trim();

  if (!workspaceId) {
    return Response.json({ error: "workspaceId is required" }, { status: 400 });
  }

  if (!name) {
    return Response.json({ error: "Department name is required" }, { status: 400 });
  }

  const access = await getWorkspaceAndAccess(workspaceId, user);
  if (access.error) {
    return Response.json({ error: access.error }, { status: access.status });
  }

  const now = new Date().toISOString();
  const department = {
    workspaceId: String(access.workspaceObjectId),
    name,
    description,
    createdByClerkUserId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const result = await access.db.collection("departments").insertOne(department);

  return Response.json(
    {
      department: {
        id: String(result.insertedId),
        ...department,
      },
    },
    { status: 201 }
  );
}
