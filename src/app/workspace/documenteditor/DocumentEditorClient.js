"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardTopbar from "../../components/DashboardTopbar";

const DEFAULT_DOC = {
  title: "Untitled Workspace Document",
  summary: "A shared document for your Roblox group operations.",
  content:
    "# Weekly Operations\n\n## Priorities\n- Finalize staff handbook updates\n- Publish moderation escalation policy\n- Review payment queue\n\n## Notes\nUse this editor like a Notion page. Organize your sections with headings and bullet lists.",
  visibility: "workspace",
  minimumRole: "member",
  allowComments: true,
  allowDownload: false,
  collaborators: [
    { id: "1", label: "Operations Team", access: "editor" },
    { id: "2", label: "HR Team", access: "commenter" },
  ],
};

const STORAGE_KEY = "rblxdocmanager.workspace.document.v1";

function getInitialDocState() {
  if (typeof window === "undefined") {
    return DEFAULT_DOC;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DOC;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DOC, ...parsed };
  } catch {
    return DEFAULT_DOC;
  }
}

export default function DocumentEditorClient({
  profileImageUrl,
  profileName,
  workspaceId,
  docId,
}) {
  const [doc, setDoc] = useState(getInitialDocState);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [newCollaboratorAccess, setNewCollaboratorAccess] = useState("viewer");
  const [saveState, setSaveState] = useState("idle");
  const [apiError, setApiError] = useState("");

  const safeWorkspaceId = String(workspaceId || "");
  const safeDocId = String(docId || "");
  const hasApiContext = Boolean(safeWorkspaceId && safeDocId);

  useEffect(() => {
    async function loadDocFromApi() {
      if (!safeWorkspaceId || !safeDocId) {
        return;
      }

      try {
        setApiError("");
        const response = await fetch(`/api/documents?workspaceId=${safeWorkspaceId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load document");
        }

        const found = (data.documents || []).find((item) => item.id === safeDocId);
        if (!found) {
          throw new Error("Document not found in selected workspace");
        }

        setDoc((prev) => ({
          ...prev,
          title: String(found.title || prev.title),
          summary: String(found.summary || prev.summary),
          content: String(found.content || ""),
          visibility: String(found.visibility || prev.visibility),
          minimumRole: String(found.minimumRole || prev.minimumRole),
          allowComments: Boolean(found.allowComments),
          allowDownload: Boolean(found.allowDownload),
          collaborators: Array.isArray(found.collaborators)
            ? found.collaborators
            : prev.collaborators,
        }));
      } catch (loadError) {
        setApiError(String(loadError?.message || "Failed to load document"));
      }
    }

    loadDocFromApi();
  }, [safeWorkspaceId, safeDocId]);

  const wordCount = useMemo(() => {
    return doc.content
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [doc.content]);

  const collaboratorCount = doc.collaborators.length;

  function updateDoc(field, value) {
    setDoc((prev) => ({ ...prev, [field]: value }));
  }

  async function saveDocument() {
    setSaveState("saving");
    setApiError("");

    try {
      if (safeWorkspaceId && safeDocId) {
        const response = await fetch("/api/documents", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: safeDocId,
            workspaceId: safeWorkspaceId,
            title: doc.title,
            summary: doc.summary,
            content: doc.content,
            visibility: doc.visibility,
            minimumRole: doc.minimumRole,
            allowComments: doc.allowComments,
            allowDownload: doc.allowDownload,
            collaborators: doc.collaborators,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to save document");
        }

        const saved = data?.document;
        if (saved) {
          setDoc((prev) => ({
            ...prev,
            title: String(saved.title || prev.title),
            summary: String(saved.summary || prev.summary),
            content: String(saved.content || prev.content),
            visibility: String(saved.visibility || prev.visibility),
            minimumRole: String(saved.minimumRole || prev.minimumRole),
            allowComments: Boolean(saved.allowComments),
            allowDownload: Boolean(saved.allowDownload),
            collaborators: Array.isArray(saved.collaborators)
              ? saved.collaborators
              : prev.collaborators,
          }));
        }
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      }

      window.setTimeout(() => setSaveState("saved"), 200);
      window.setTimeout(() => setSaveState("idle"), 1400);
    } catch (saveError) {
      setApiError(String(saveError?.message || "Failed to save"));
      setSaveState("idle");
    }
  }

  function addCollaborator() {
    const cleanValue = newCollaborator.trim();
    if (!cleanValue) return;

    const collaborator = {
      id: String(Date.now()),
      label: cleanValue,
      access: newCollaboratorAccess,
    };

    setDoc((prev) => ({
      ...prev,
      collaborators: [...prev.collaborators, collaborator],
    }));
    setNewCollaborator("");
    setNewCollaboratorAccess("viewer");
  }

  function updateCollaboratorAccess(id, nextAccess) {
    setDoc((prev) => ({
      ...prev,
      collaborators: prev.collaborators.map((person) =>
        person.id === id ? { ...person, access: nextAccess } : person
      ),
    }));
  }

  function removeCollaborator(id) {
    setDoc((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((person) => person.id !== id),
    }));
  }

  const shareLink =
    doc.visibility === "public"
      ? "https://rblxdocmanager.app/share/workspace-public"
      : "Only visible to allowed members";

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="doc-editor-page">
        <section className="doc-editor-header">
          <div>
            <p className="doc-editor-eyebrow">Workspace Document</p>
            {hasApiContext ? (
              <p className="doc-summary">Connected to workspace document</p>
            ) : (
              <p className="doc-summary">Local draft mode</p>
            )}
            <input
              className="doc-title-input"
              value={doc.title}
              onChange={(event) => updateDoc("title", event.target.value)}
              aria-label="Document title"
            />
            <p className="doc-summary">{doc.summary}</p>
            {apiError ? <p className="owner-error">{apiError}</p> : null}
          </div>

          <div className="doc-header-actions">
            <button
              type="button"
              className="open-workspace-btn secondary"
              onClick={() => updateDoc("content", DEFAULT_DOC.content)}
            >
              Reset Body
            </button>
            <button
              type="button"
              className="open-workspace-btn"
              onClick={saveDocument}
            >
              Save Document
            </button>
            <p className="doc-save-state">
              {saveState === "saving" && "Saving..."}
              {saveState === "saved" && "Saved"}
              {saveState === "idle" && "Not saved"}
            </p>
          </div>
        </section>

        <section className="doc-editor-layout">
          <article className="doc-editor-canvas">
            <div className="doc-editor-toolbar">
              <button type="button" className="doc-editor-tool">
                Heading
              </button>
              <button type="button" className="doc-editor-tool">
                Checklist
              </button>
              <button type="button" className="doc-editor-tool">
                Bullet List
              </button>
              <button type="button" className="doc-editor-tool">
                Divider
              </button>
            </div>

            <textarea
              className="doc-editor-textarea"
              value={doc.content}
              onChange={(event) => updateDoc("content", event.target.value)}
              aria-label="Document body"
            />

            <div className="doc-editor-footer">
              <p>{wordCount} words</p>
              <p>{collaboratorCount} collaborators</p>
            </div>
          </article>

          <aside className="doc-editor-sidebar">
            <section className="doc-sidebar-card">
              <h2>Visibility</h2>
              <label className="doc-field-label">
                Who can access this document
                <select
                  className="owner-role-select"
                  value={doc.visibility}
                  onChange={(event) => updateDoc("visibility", event.target.value)}
                >
                  <option value="private">Private (only you)</option>
                  <option value="workspace">Workspace members</option>
                  <option value="shared">Specific collaborators</option>
                  <option value="public">Public link</option>
                </select>
              </label>

              <label className="doc-field-label">
                Minimum workspace role
                <select
                  className="owner-role-select"
                  value={doc.minimumRole}
                  onChange={(event) => updateDoc("minimumRole", event.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="doc-inline-check">
                <input
                  type="checkbox"
                  checked={doc.allowComments}
                  onChange={(event) =>
                    updateDoc("allowComments", event.target.checked)
                  }
                />
                Allow comments
              </label>

              <label className="doc-inline-check">
                <input
                  type="checkbox"
                  checked={doc.allowDownload}
                  onChange={(event) =>
                    updateDoc("allowDownload", event.target.checked)
                  }
                />
                Allow export/download
              </label>
            </section>

            <section className="doc-sidebar-card">
              <h2>Collaborators</h2>
              <div className="doc-collaborator-add-row">
                <input
                  type="text"
                  value={newCollaborator}
                  onChange={(event) => setNewCollaborator(event.target.value)}
                  className="doc-collaborator-input"
                  placeholder="Discord user, team, or email"
                />
                <select
                  className="owner-role-select"
                  value={newCollaboratorAccess}
                  onChange={(event) => setNewCollaboratorAccess(event.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="button"
                  className="open-workspace-btn"
                  onClick={addCollaborator}
                >
                  Add
                </button>
              </div>

              <div className="doc-collaborator-list">
                {doc.collaborators.map((person) => (
                  <div key={person.id} className="doc-collaborator-row">
                    <p className="owner-user-name">{person.label}</p>
                    <div className="owner-user-controls">
                      <select
                        className="owner-role-select"
                        value={person.access}
                        onChange={(event) =>
                          updateCollaboratorAccess(person.id, event.target.value)
                        }
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        type="button"
                        className="open-workspace-btn secondary"
                        onClick={() => removeCollaborator(person.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="doc-sidebar-card">
              <h2>Share Link</h2>
              <p className="doc-share-link">{shareLink}</p>
              <p className="doc-share-hint">
                Public links only work when visibility is set to Public link.
              </p>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}
