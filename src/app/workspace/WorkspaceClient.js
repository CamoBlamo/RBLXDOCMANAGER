"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isConfidential, setIsConfidential] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [error, setError] = useState("");

  const selectedWorkspace = useMemo(
    () => workspaces.find((item) => item.id === selectedWorkspaceId) || null,
    [workspaces, selectedWorkspaceId]
  );

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

  const activeMembers = useMemo(() => {
    if (!selectedWorkspace) return [];
    const owner = {
      username: selectedWorkspace.ownerClerkUserId,
      status: "Owner",
    };
    const admins = (selectedWorkspace.adminClerkUserIds || [])
      .filter((id) => id !== selectedWorkspace.ownerClerkUserId)
      .slice(0, 5)
      .map((id) => ({ username: id, status: "Admin" }));
    return [owner, ...admins].map((person) => ({
      ...person,
      presence: documents.length > 0 ? statusFromDate(documents[0].updatedAt) : "Idle",
    }));
  }, [selectedWorkspace, documents]);

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
        setSelectedWorkspaceId((current) => current || list[0].id);
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

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadDocuments(selectedWorkspaceId);
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
                  <li key={member.username}>
                    <span>{member.username}</span>
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
              hidden={activeSection !== "permissions" && activeSection !== "dashboard"}
            >
              <h3>Alerts</h3>
              <ul className="workspace-ops-alerts">
                {alerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
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
            <button type="button" className="open-workspace-btn secondary">
              + New Department
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
                  <span>No document activity yet.</span>
                  <small>Waiting</small>
                </li>
              ) : null}
            </ul>
          </section>

          <section
            className="workspace-ops-wide"
            hidden={activeSection !== "documents" && activeSection !== "dashboard"}
          >
            <div className="workspace-ops-document-header">
              <h3>{primaryDocument?.title || "Policy Update Document"}</h3>
              <div className="workspace-ops-tags">
                <span>{isConfidential ? "Confidential" : "Internal"}</span>
                <span>{selectedWorkspace?.guildName || "Workspace"}</span>
              </div>
            </div>
            <p>
              {primaryDocument?.summary ||
                "Review updates and maintain your policy documents here."}
            </p>
            <div className="workspace-ops-confidential-toggle">
              <span>Confidential</span>
              <button
                type="button"
                aria-pressed={isConfidential}
                onClick={() => setIsConfidential((value) => !value)}
              >
                {isConfidential ? "On" : "Off"}
              </button>
            </div>
            <p className="workspace-ops-footer-meta">
              Last edited {primaryDocument ? formatAgo(primaryDocument.updatedAt) : "never"}
            </p>
          </section>
        </section>
      </main>
    </>
  );
}
