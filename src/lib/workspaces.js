export const WORKSPACE_VISIBILITY = ["private", "members", "restricted"];

export const WORKSPACE_APP_ROLES = [
  "user",
  "employee",
  "supervisor",
  "manager",
  "admin",
  "owner",
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(value) {
  return [
    ...new Set(asArray(value).map((item) => String(item).trim()).filter(Boolean)),
  ];
}

/**
 * Builds a clean workspace document ready to insert into MongoDB.
 * _id is assigned by MongoDB; `id` is added on read via serializeWorkspace.
 */
export function buildWorkspaceDocument(payload, ownerClerkUserId) {
  const now = new Date().toISOString();

  const adminClerkUserIds = uniqueStrings(payload?.adminClerkUserIds);
  if (!adminClerkUserIds.includes(ownerClerkUserId)) {
    adminClerkUserIds.push(ownerClerkUserId);
  }

  const visibility = WORKSPACE_VISIBILITY.includes(payload?.visibility)
    ? payload.visibility
    : "private";

  const allowedAppRoles = uniqueStrings(payload?.allowedAppRoles).filter(
    (role) => WORKSPACE_APP_ROLES.includes(role)
  );

  return {
    name: String(payload?.name || "").trim() || "Untitled Workspace",
    description: String(payload?.description || "").trim(),
    guildId: String(payload?.guildId || "").trim(),
    guildName: String(payload?.guildName || "").trim() || "Unknown Server",
    guildIcon: payload?.guildIcon ? String(payload.guildIcon) : null,
    visibility,
    ownerClerkUserId,
    adminClerkUserIds,
    adminDiscordUserIds: uniqueStrings(payload?.adminDiscordUserIds),
    allowedAppRoles,
    allowedDiscordUserIds: uniqueStrings(payload?.allowedDiscordUserIds),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Converts a MongoDB document to a plain serializable object for the client.
 * Strips _id and converts ObjectId to string.
 */
export function serializeWorkspace(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: String(_id),
    ...rest,
    adminClerkUserIds: asArray(rest.adminClerkUserIds),
    adminDiscordUserIds: asArray(rest.adminDiscordUserIds),
    allowedAppRoles: asArray(rest.allowedAppRoles),
    allowedDiscordUserIds: asArray(rest.allowedDiscordUserIds),
  };
}

/**
 * Returns true if the user is allowed to view a workspace.
 * Pass discordUserId as the user's Discord snowflake (from their OAuth account).
 */
export function userCanAccessWorkspace(workspace, options) {
  const clerkUserId = String(options?.clerkUserId || "");
  const appRole = String(options?.appRole || "").toLowerCase();
  const discordUserId = String(options?.discordUserId || "");

  const isOwner = workspace.ownerClerkUserId === clerkUserId;
  const isAppAdmin = appRole === "admin" || appRole === "owner";
  const isDirectClerkAdmin = asArray(workspace.adminClerkUserIds).includes(clerkUserId);
  const isDiscordAdmin =
    discordUserId &&
    asArray(workspace.adminDiscordUserIds).includes(discordUserId);

  if (isOwner || isAppAdmin || isDirectClerkAdmin || isDiscordAdmin) {
    return true;
  }

  if (workspace.visibility === "private") {
    return false;
  }

  if (workspace.visibility === "members") {
    return true;
  }

  const matchesAppRole =
    asArray(workspace.allowedAppRoles).length === 0 ||
    asArray(workspace.allowedAppRoles).includes(appRole);

  const matchesDiscordUser =
    asArray(workspace.allowedDiscordUserIds).length === 0 ||
    (discordUserId &&
      asArray(workspace.allowedDiscordUserIds).includes(discordUserId));

  return matchesAppRole && matchesDiscordUser;
}
