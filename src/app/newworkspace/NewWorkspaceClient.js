"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardTopbar from "../components/DashboardTopbar";

const APP_ROLES = ["user", "employee", "supervisor", "manager", "admin", "owner"];

function apiErrorMessage(error) {
  return String(error?.message || "Unexpected error");
}

export default function NewWorkspaceClient({ profileImageUrl, profileName }) {
  const [guilds, setGuilds] = useState([]);
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdMessage, setCreatedMessage] = useState("");

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [allowedAppRoles, setAllowedAppRoles] = useState(["user"]);
  // Comma-separated Discord user IDs (snowflakes) — no bot needed
  const [adminDiscordUserIdsText, setAdminDiscordUserIdsText] = useState("");
  const [allowedDiscordUserIdsText, setAllowedDiscordUserIdsText] = useState("");
  // Comma-separated Clerk user IDs for co-admins
  const [adminClerkUserIdsText, setAdminClerkUserIdsText] = useState("");

  const [workspaces, setWorkspaces] = useState([]);

  const selectedGuild = useMemo(
    () => guilds.find((guild) => guild.id === selectedGuildId),
    [guilds, selectedGuildId]
  );

  function splitIds(text) {
    return text
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  async function loadGuilds() {
    setLoadingGuilds(true);
    setError("");
    try {
      const response = await fetch("/api/discord/guilds", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load Discord servers");
      }
      setGuilds(data.guilds || []);
      if ((data.guilds || []).length > 0) {
        setSelectedGuildId(data.guilds[0].id);
      }
    } catch (loadError) {
      setError(apiErrorMessage(loadError));
    } finally {
      setLoadingGuilds(false);
    }
  }

  async function loadWorkspaces() {
    try {
      const response = await fetch("/api/workspaces", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load workspaces");
      }
      setWorkspaces(data.all || []);
    } catch (loadError) {
      setError(apiErrorMessage(loadError));
    }
  }

  useEffect(() => {
    loadGuilds();
    loadWorkspaces();
  }, []);

  function toggleAppRole(role) {
    setAllowedAppRoles((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    );
  }

  async function createWorkspace() {
    setCreating(true);
    setCreatedMessage("");
    setError("");

    try {
      if (!selectedGuild) {
        throw new Error("Select a Discord server first.");
      }

      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription,
          guildId: selectedGuild.id,
          guildName: selectedGuild.name,
          guildIcon: selectedGuild.icon,
          visibility,
          allowedAppRoles,
          adminClerkUserIds: splitIds(adminClerkUserIdsText),
          adminDiscordUserIds: splitIds(adminDiscordUserIdsText),
          allowedDiscordUserIds: splitIds(allowedDiscordUserIdsText),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create workspace");
      }

      setCreatedMessage(`Workspace "${data.workspace.name}" created successfully.`);
      setWorkspaceName("");
      setWorkspaceDescription("");
      setAdminDiscordUserIdsText("");
      setAllowedDiscordUserIdsText("");
      setAdminClerkUserIdsText("");
      await loadWorkspaces();
    } catch (createError) {
      setError(apiErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="dashboard-page">
        <section className="new-workspace-card">
          <h1>Create Workspace From Discord Server</h1>
          <p>
            Select one of your Discord servers, then configure who can view and
            administer this workspace.
          </p>

          {error ? <p className="owner-error">{error}</p> : null}
          {createdMessage ? <p className="owner-saving">{createdMessage}</p> : null}

          <div className="new-workspace-grid">
            <label className="new-workspace-field">
              Workspace Name
              <input
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Operations Docs"
              />
            </label>

            <label className="new-workspace-field">
              Discord Server
              <select
                value={selectedGuildId}
                onChange={(event) => setSelectedGuildId(event.target.value)}
                disabled={loadingGuilds || guilds.length === 0}
              >
                {guilds.length === 0 ? (
                  <option value="">
                    {loadingGuilds ? "Loading servers..." : "No servers found"}
                  </option>
                ) : (
                  guilds.map((guild) => (
                    <option key={guild.id} value={guild.id}>
                      {guild.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="new-workspace-field new-workspace-field-full">
              Description
              <textarea
                value={workspaceDescription}
                onChange={(event) => setWorkspaceDescription(event.target.value)}
                rows={3}
                placeholder="Workspace for group policies, announcements, and workflows."
              />
            </label>

            <label className="new-workspace-field">
              Visibility
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value="private">Private (owner + admins only)</option>
                <option value="members">All linked server members</option>
                <option value="restricted">Restricted (by role or user ID)</option>
              </select>
            </label>
          </div>

          <section className="new-workspace-permissions">
            <div className="new-workspace-role-column">
              <h2>Admin Discord User IDs</h2>
              <p>
                These Discord user IDs always have full admin access. Find them in
                Discord Settings &rarr; Advanced &rarr; Copy User ID.
              </p>
              <label className="new-workspace-field">
                <textarea
                  value={adminDiscordUserIdsText}
                  onChange={(event) => setAdminDiscordUserIdsText(event.target.value)}
                  rows={4}
                  placeholder={"123456789012345678,\n987654321098765432"}
                />
              </label>
            </div>

            <div className="new-workspace-role-column">
              <h2>Allowed Discord User IDs</h2>
              <p>
                Only relevant when visibility is Restricted. These users can view
                this workspace regardless of their app role.
              </p>
              <label className="new-workspace-field">
                <textarea
                  value={allowedDiscordUserIdsText}
                  onChange={(event) => setAllowedDiscordUserIdsText(event.target.value)}
                  rows={4}
                  placeholder={"123456789012345678,\n987654321098765432"}
                />
              </label>
            </div>

            <div className="new-workspace-role-column">
              <h2>Allowed App Roles</h2>
              <p>
                Users with these app roles can access when visibility is Restricted.
                Toggle all that should be allowed.
              </p>
              <div className="new-workspace-role-list">
                {APP_ROLES.map((role) => (
                  <label key={role} className="new-workspace-check-row">
                    <input
                      type="checkbox"
                      checked={allowedAppRoles.includes(role)}
                      onChange={() => toggleAppRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>

              <h2 style={{ marginTop: "16px" }}>Admin Clerk User IDs</h2>
              <p>Comma-separated Clerk user IDs for co-admins (from Clerk dashboard).</p>
              <label className="new-workspace-field">
                <input
                  type="text"
                  value={adminClerkUserIdsText}
                  onChange={(event) => setAdminClerkUserIdsText(event.target.value)}
                  placeholder="user_abc,user_xyz"
                />
              </label>
            </div>
          </section>

          <div className="workspace-card-actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="create-workspace-btn"
              onClick={createWorkspace}
              disabled={creating || !selectedGuildId}
            >
              {creating ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </section>

        <section className="new-workspace-card">
          <h2>Your Workspaces</h2>
          <p>Workspaces you own or have admin access to.</p>

          <div className="workspace-list">
            {workspaces.map((workspace) => (
              <article key={workspace.id} className="workspace-card-template">
                <h3>{workspace.name}</h3>
                <p><strong>Server:</strong> {workspace.guildName}</p>
                <p><strong>Visibility:</strong> {workspace.visibility}</p>
                <p>
                  <strong>Admins:</strong> {workspace.adminClerkUserIds.length} Clerk,{" "}
                  {workspace.adminDiscordUserIds.length} Discord users
                </p>
              </article>
            ))}
            {workspaces.length === 0 ? <p>No workspaces yet.</p> : null}
          </div>
        </section>
      </main>
    </>
  );
}
