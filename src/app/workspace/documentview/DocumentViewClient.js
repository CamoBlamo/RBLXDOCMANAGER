"use client";

import { useEffect, useState } from "react";
import DashboardTopbar from "../../components/DashboardTopbar";

export default function DocumentViewClient({
  profileImageUrl,
  profileName,
  workspaceId,
  docId,
}) {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    summary: "",
    content: "",
  });
  const [effectiveWorkspaceId, setEffectiveWorkspaceId] = useState("");
  const [effectiveDocId, setEffectiveDocId] = useState("");
  const [workspace, setWorkspace] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [activeMembers, setActiveMembers] = useState([]);

  useEffect(() => {
    async function loadDocument() {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const wsId = workspaceId || params?.get("workspaceId") || "";
      const dId = docId || params?.get("docId") || "";

      setEffectiveWorkspaceId(wsId);
      setEffectiveDocId(dId);

      if (!wsId || !dId) {
        setError("Missing workspace or document ID.");
        setLoading(false);
        return;
      }

      setError("");
      try {
        const response = await fetch(
          `/api/documents?workspaceId=${wsId}&documentId=${dId}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load document");
        }
        const doc = data.document || null;
        setDocument(doc);
        if (doc) {
          setEditForm({
            title: doc.title || "",
            summary: doc.summary || "",
            content: doc.content || "",
          });
        }
      } catch (loadError) {
        setError(String(loadError?.message || "Failed to load document"));
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [workspaceId, docId]);

  async function saveDocument() {
    if (!effectiveWorkspaceId || !effectiveDocId) {
      setError("Missing workspace or document ID.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: effectiveWorkspaceId,
          documentId: effectiveDocId,
          title: editForm.title.trim(),
          summary: editForm.summary.trim(),
          content: editForm.content.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save document");
      }
      setDocument(data.document);
      setIsEditing(false);
    } catch (saveError) {
      setError(String(saveError?.message || "Failed to save document"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
        <main className="workspace-ops-page">
          <p>Loading document…</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
        <main className="workspace-ops-page">
          <p className="owner-error">{error}</p>
        </main>
      </>
    );
  }

  if (!document) {
    return (
      <>
        <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
        <main className="workspace-ops-page">
          <p>No document found.</p>
        </main>
      </>
    );
  }

  if (isEditing) {
    return (
      <>
        <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
        <main className="workspace-ops-page">
          <section className="workspace-ops-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ margin: "0" }}>Edit Document</h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="open-workspace-btn secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="open-workspace-btn"
                  onClick={saveDocument}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </section>

          <section className="workspace-ops-wide">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#d5d5d5" }}>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Document title"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-color)",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#d5d5d5" }}>Summary</label>
                <input
                  type="text"
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  placeholder="Brief summary"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-color)",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#d5d5d5" }}>Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Document content"
                  style={{
                    width: "100%",
                    minHeight: "400px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-color)",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
      <main className="workspace-ops-page">
        <section className="workspace-ops-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <h1>{document.title || "Untitled Document"}</h1>
              {document.summary && <p className="workspace-ops-subtitle">{document.summary}</p>}
              <div className="workspace-ops-meta">
                <span>Last updated {new Date(document.updatedAt).toLocaleDateString()} at {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Visibility: {document.visibility}</span>
                {document.minimumRole && <span>Minimum role: {document.minimumRole}</span>}
              </div>
            </div>
            <button
              className="open-workspace-btn"
              onClick={() => setIsEditing(true)}
              style={{ whiteSpace: "nowrap", marginLeft: "16px" }}
            >
              Edit
            </button>
          </div>
        </section>

        <section className="workspace-ops-wide">
          <article className="workspace-document-view">
            <div
              className="workspace-document-content"
              dangerouslySetInnerHTML={{
                __html: document.content
                  ? String(document.content)
                      .replace(/\n/g, "<br />")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  : "<p>No content available.</p>",
              }}
            />
          </article>
        </section>
      </main>
    </>
  );
}
