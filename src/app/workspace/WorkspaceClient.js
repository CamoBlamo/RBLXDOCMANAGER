"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardTopbar from "../components/DashboardTopbar";

function formatAgo(isoDate) {
  const time = new Date(isoDate).getTime();
  if (!Number.isFinite(time)) return "Unknown";
  const diff = Date.now() - time;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusFromDate(isoDate) {
  const time = new Date(isoDate).getTime();
  if (!Number.isFinite(time)) return "inactive";
  return Date.now() - time < 1000 * 60 * 30 ? "Online" : "Idle";
}

export default function WorkspaceClient({ profileImageUrl, profileName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [settingsMode, setSettingsMode] = useState("view");
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    description: "",
    guildName: "",
    visibility: "private",
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [error, setError] = useState("");

  const selectedWorkspace = useMemo(
    () => workspaces.find((item) => item.id === selectedWorkspaceId) || null,
    [workspaces, selectedWorkspaceId]
  );

  const workspaceSettingsTitle = selectedWorkspace?.name || "Workspace settings";

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) => {
      return (
        String(doc.title || "").toLowerCase().includes(query) ||
        String(doc.summary || "").toLowerCase().includes(query)
      );
    });
  }, [documents, searchQuery]);

  const [memberNames, setMemberNames] = useState({});

  const activeMembers = useMemo(() => {
    if (!selectedWorkspace) return [];
    const owner = {
      id: selectedWorkspace.ownerClerkUserId,
      username: memberNames[selectedWorkspace.ownerClerkUserId] || selectedWorkspace.ownerClerkUserId,
      status: "Owner",
    };
    const admins = (selectedWorkspace.adminClerkUserIds || [])
      .filter((id) => id !== selectedWorkspace.ownerClerkUserId)
      .slice(0, 5)
      .map((id) => ({
        id,
        username: memberNames[id] || id,
        status: "Admin",
      }));
    return [owner, ...admins].map((person) => ({
      ...person,
      presence: documents.length > 0 ? statusFromDate(documents[0].updatedAt) : "Idle",
    }));
  }, [selectedWorkspace, documents, memberNames]);

  const alerts = useMemo(() => {
    if (!selectedWorkspace) return [];
    const result = [];
    if (selectedWorkspace.visibility === "private") {
      result.push("Workspace is private: only owner and admins can access.");
    }
    if ((selectedWorkspace.adminDiscordUserIds || []).length > 0) {
      result.push("Discord user ID admin overrides are enabled.");
    }
    if ((selectedWorkspace.allowedAppRoles || []).length === 0) {
      result.push("No app-role restriction set for restricted mode.");
    }
    return result.length ? result : ["No security alerts."];
  }, [selectedWorkspace]);

  const recentActivity = useMemo(() => {
    return documents.slice(0, 6).map((doc) => ({
      text: `Document ${doc.title} updated`,
      at: formatAgo(doc.updatedAt),
      kind: "success",
    }));
  }, [documents]);

  async function loadWorkspaces() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/workspaces", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load workspaces");
      }
      const list = data.all || [];
      setWorkspaces(list);
      if (list.length > 0) {
        const queryWorkspaceId = searchParams?.get("workspaceId");
        const selectedId =
          queryWorkspaceId && list.some((item) => item.id === queryWorkspaceId)
            ? queryWorkspaceId
            : list[0].id;
        setSelectedWorkspaceId((current) => current || selectedId);
      }
    } catch (loadError) {
      setError(String(loadError?.message || "Failed to load workspaces"));
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(workspaceId) {
    if (!workspaceId) {
      setDocuments([]);
      return;
    }
    try {
      const response = await fetch(`/api/documents?workspaceId=${workspaceId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load documents");
      }
      setDocuments(data.documents || []);
    } catch (loadError) {
      setError(String(loadError?.message || "Failed to load documents"));
      setDocuments([]);
    }
  }

  async function loadDepartments(workspaceId) {
    if (!workspaceId) {
      setDepartments([]);
      return;
    }

    try {
      const response = await fetch(`/api/departments?workspaceId=${workspaceId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load departments");
      }
      setDepartments(data.departments || []);
    } catch (loadError) {
      setError(String(loadError?.message || "Failed to load departments"));
      setDepartments([]);
    }
  }

  async function createDepartment() {
    if (!selectedWorkspaceId || creatingDepartment) return;
    if (!newDepartmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    setCreatingDepartment(true);
    setError("");
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          name: newDepartmentName.trim(),
          description: newDepartmentDescription.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create department");
      }
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      await loadDepartments(selectedWorkspaceId);
    } catch (createError) {
      setError(String(createError?.message || "Failed to create department"));
    } finally {
      setCreatingDepartment(false);
    }
  }

  async function loadWorkspaceSettings(workspaceId) {
    if (!workspaceId) return;
    try {
      const response = await fetch(`/api/workspaces?workspaceId=${workspaceId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load workspace settings");
      }
      const workspace = data.workspace;
      if (workspace) {
        setWorkspaceForm({
          name: workspace.name || "",
          description: workspace.description || "",
          guildName: workspace.guildName || "",
          visibility: workspace.visibility || "private",
        });
        const ids = [
          workspace.ownerClerkUserId,
          ...(workspace.adminClerkUserIds || []),
        ].filter(Boolean);
        if (ids.length > 0) {
          await loadMemberNames(ids);
        }
      }
    } catch (loadError) {
      setError(String(loadError?.message || "Failed to load workspace settings"));
    }
  }

  async function loadMemberNames(ids) {
    if (ids.length === 0) return;
    try {
      const response = await fetch(`/api/users?ids=${ids.join(",")}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load member names");
      }
      const map = {};
      (data.users || []).forEach((user) => {
        if (user?.id) map[user.id] = user.username;
      });
      setMemberNames(map);
    } catch {
      // ignore lookup failure; fall back to IDs
    }
  }

  async function saveWorkspaceSettings() {
    if (!selectedWorkspaceId || savingSettings) return;
    setSavingSettings(true);
    setError("");
    try {
      const response = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          ...workspaceForm,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save workspace settings");
      }
      const updated = data.workspace;
      setWorkspaces((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelectedWorkspaceId(updated.id);
      setSettingsMode("view");
    } catch (saveError) {
      setError(String(saveError?.message || "Failed to save workspace settings"));
    } finally {
      setSavingSettings(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const queryWorkspaceId = searchParams.get("workspaceId");
    if (
      queryWorkspaceId &&
      queryWorkspaceId !== selectedWorkspaceId &&
      workspaces.some((workspace) => workspace.id === queryWorkspaceId)
    ) {
      setSelectedWorkspaceId(queryWorkspaceId);
    }
  }, [searchParams, workspaces, selectedWorkspaceId]);

  useEffect(() => {
    loadDocuments(selectedWorkspaceId);
    loadDepartments(selectedWorkspaceId);
    loadWorkspaceSettings(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  async function createDocument() {
    if (!selectedWorkspaceId || creatingDoc) return;
    setCreatingDoc(true);
    setError("");
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          title: "Untitled Document",
          summary: "New document",
          content: "",
          visibility: "workspace",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create document");
      }
      const docId = data?.document?.id;
      if (docId) {
        router.push(
          `/workspace/documenteditor?workspaceId=${selectedWorkspaceId}&docId=${docId}`
        );
        return;
      }
      await loadDocuments(selectedWorkspaceId);
    } catch (createError) {
      setError(String(createError?.message || "Failed to create document"));
    } finally {
      setCreatingDoc(false);
    }
  }

  const primaryDocument = filteredDocuments[0] || null;

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="workspace-ops-page">
        <aside className="workspace-ops-sidebar">
          <h2>{selectedWorkspace?.name || "Workspace"}</h2>
          <p className="workspace-ops-subtitle">Operations Console</p>
          {user?.username && (
            <p style={{ fontSize: "13px", color: "#999", margin: "8px 0 0" }}>
              Logged in as: <strong>{user.username}</strong>
            </p>
          )}

          <nav className="workspace-ops-nav">
            <button
              type="button"
              aria-pressed={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "departments"}
              onClick={() => setActiveSection("departments")}
            >
              Departments
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "documents"}
              onClick={() => setActiveSection("documents")}
            >
              Documents
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "members"}
              onClick={() => setActiveSection("members")}
            >
              Members
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "permissions"}
              onClick={() => setActiveSection("permissions")}
            >
              Permissions
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            >
              Settings
            </button>
            <button
              type="button"
              aria-pressed={activeSection === "logs"}
              onClick={() => setActiveSection("logs")}
            >
              Logs
            </button>
          </nav>
        </aside>

        <section className="workspace-ops-main">
          <header className="workspace-ops-topbar">
            <select
              value={selectedWorkspaceId}
              onChange={(event) => setSelectedWorkspaceId(event.target.value)}
              className="workspace-ops-select"
              aria-label="Select workspace"
              disabled={loading || workspaces.length === 0}
            >
              {workspaces.length === 0 ? (
                <option value="">
                  {loading ? "Loading workspaces..." : "No workspace found"}
                </option>
              ) : (
                workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))
              )}
            </select>

            <div className="workspace-ops-actions">
              <input
                type="search"
                className="workspace-ops-search"
                placeholder="Search documents"
                aria-label="Search documents"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button type="button" className="workspace-ops-icon-btn">
                Notifications
              </button>
            </div>
          </header>

          {error ? <p className="owner-error">{error}</p> : null}

          <div className="workspace-ops-grid">
            <article
              className="workspace-ops-card"
              hidden={activeSection !== "documents" && activeSection !== "dashboard"}
            >
              <h3>Recent Documents</h3>
              <ul className="workspace-ops-list">
                {filteredDocuments.slice(0, 6).map((doc) => (
                  <li key={doc.id}>
                    <span>{doc.title}</span>
                    <small>{formatAgo(doc.updatedAt)}</small>
                    <Link
                      href={{
                        pathname: "/workspace/documentview",
                        query: { workspaceId: selectedWorkspaceId, docId: doc.id },
                      }}
                      className="open-workspace-btn secondary"
                    >
                      View
                    </Link>
                  </li>
                ))}
                {filteredDocuments.length === 0 ? (
                  <li>
                    <span>No documents yet</span>
                    <small>Create one below</small>
                  </li>
                ) : null}
              </ul>
              {primaryDocument ? (
                <Link
                  href={`/workspace/documenteditor?workspaceId=${selectedWorkspaceId}&docId=${primaryDocument.id}`}
                  className="open-workspace-btn"
                >
                  Open Latest Document
                </Link>
              ) : null}
            </article>

            <article
              className="workspace-ops-card"
              hidden={activeSection !== "members" && activeSection !== "dashboard"}
            >
              <h3>Active Members</h3>
              <ul className="workspace-ops-members">
                {activeMembers.map((member) => (
                  <li key={user?.username}>
                    <span>{user?.username}</span>
                    <strong>{member.presence}</strong>
                  </li>
                ))}
                {activeMembers.length === 0 ? (
                  <li>
                    <span>No members listed</span>
                    <strong>Idle</strong>
                  </li>
                ) : null}
              </ul>
            </article>

            <article
              className="workspace-ops-card"
              hidden={activeSection !== "departments" && activeSection !== "dashboard"}
            >
              <h3>Departments</h3>
              <div className="workspace-ops-form-row">
                <label>
                  Name
                  <input
                    type="text"
                    value={newDepartmentName}
                    onChange={(event) => setNewDepartmentName(event.target.value)}
                    placeholder="New department"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={newDepartmentDescription}
                    onChange={(event) => setNewDepartmentDescription(event.target.value)}
                    placeholder="Optional department description"
                    rows={3}
                  />
                </label>
                <button
                  type="button"
                  className="open-workspace-btn"
                  onClick={createDepartment}
                  disabled={!selectedWorkspaceId || creatingDepartment}
                >
                  {creatingDepartment ? "Creating..." : "Add department"}
                </button>
              </div>

              <ul className="workspace-ops-list">
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <li key={department.id}>
                      <span>{department.name}</span>
                      <small>{department.description || "No description"}</small>
                    </li>
                  ))
                ) : (
                  <li>
                    <span>No departments yet.</span>
                    <small>Use the form above to add one.</small>
                  </li>
                )}
              </ul>
            </article>

            <article
              className="workspace-ops-card"
              hidden={activeSection !== "permissions" && activeSection !== "dashboard"}
            >
              <h3>Workspace access</h3>
              <ul className="workspace-ops-alerts">
                {alerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            </article>

            <article
              className="workspace-ops-card"
              hidden={activeSection !== "settings"}
            >
              <h3>{workspaceSettingsTitle}</h3>
              <div className="workspace-ops-form-row">
                <label>
                  Workspace name
                  <input
                    type="text"
                    value={workspaceForm.name}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Workspace name"
                  />
                </label>
                <label>
                  Server name
                  <input
                    type="text"
                    value={workspaceForm.guildName}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({ ...prev, guildName: event.target.value }))
                    }
                    placeholder="Connected Discord server"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={workspaceForm.description}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Workspace description"
                    rows={4}
                  />
                </label>
                <label>
                  Visibility
                  <select
                    value={workspaceForm.visibility}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({ ...prev, visibility: event.target.value }))
                    }
                  >
                    <option value="private">Private</option>
                    <option value="members">Members</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </label>
                <div className="workspace-ops-form-actions">
                  <button
                    type="button"
                    className="open-workspace-btn"
                    onClick={saveWorkspaceSettings}
                    disabled={!selectedWorkspaceId || savingSettings}
                  >
                    {savingSettings ? "Saving..." : "Save settings"}
                  </button>
                  <button
                    type="button"
                    className="open-workspace-btn secondary"
                    onClick={() => setSettingsMode("view")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div
            className="workspace-ops-cta-row"
            hidden={
              activeSection !== "dashboard" &&
              activeSection !== "documents" &&
              activeSection !== "departments"
            }
          >
            <button
              type="button"
              className="open-workspace-btn"
              onClick={createDocument}
              disabled={!selectedWorkspaceId || creatingDoc}
            >
              {creatingDoc ? "Creating..." : "+ New Document"}
            </button>
            <button
              type="button"
              className="open-workspace-btn secondary"
              onClick={() => setActiveSection("settings")}
              disabled={!selectedWorkspaceId}
            >
              Workspace Settings
            </button>
          </div>

          <section
            className="workspace-ops-wide"
            hidden={activeSection !== "logs" && activeSection !== "dashboard"}
          >
            <h3>Recent Activity</h3>
            <ul className="workspace-ops-activity">
              {recentActivity.map((item) => (
                <li key={`${item.text}-${item.at}`} data-kind={item.kind}>
                  <span>{item.text}</span>
                  <small>{item.at}</small>
                </li>
              ))}
              {recentActivity.length === 0 ? (
                <li data-kind="warning">
                  <span>No activity recorded.</span>
                  <small>Check back after editing or sharing documents.</small>
                </li>
              ) : null}
            </ul>
          </section>

          <section
            className="workspace-ops-wide"
            hidden={activeSection !== "documents" && activeSection !== "dashboard"}
          >
            <div className="workspace-ops-document-header">
              <h3>{primaryDocument?.title || "Recent document"}</h3>
              <div className="workspace-ops-tags">
                <span>{selectedWorkspace?.guildName || "Workspace"}</span>
                <span>{primaryDocument?.visibility || "workspace"}</span>
              </div>
            </div>
            <p>
              {primaryDocument?.summary ||
                "Quick access to your latest document content and edit link."}
            </p>
            <p className="workspace-ops-footer-meta">
              Last edited {primaryDocument ? formatAgo(primaryDocument.updatedAt) : "never"}
            </p>
          </section>
        </section>
      </main>
    </>
  );
}
