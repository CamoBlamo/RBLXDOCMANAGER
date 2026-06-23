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

  useEffect(() => {
    async function loadDocument() {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const effectiveWorkspaceId = workspaceId || params?.get("workspaceId") || "";
      const effectiveDocId = docId || params?.get("docId") || "";

      if (!effectiveWorkspaceId || !effectiveDocId) {
        setError("Missing workspace or document ID.");
        setLoading(false);
        return;
      }

      setError("");
      try {
        const response = await fetch(
          `/api/documents?workspaceId=${effectiveWorkspaceId}&documentId=${effectiveDocId}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load document");
        }
        setDocument(data.document || null);
      } catch (loadError) {
        setError(String(loadError?.message || "Failed to load document"));
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [workspaceId, docId]);

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

  return (
    <>
      <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
      <main className="workspace-ops-page">
        <section className="workspace-ops-card">
          <h1>{document.title || "Untitled Document"}</h1>
          {document.summary && <p className="workspace-ops-subtitle">{document.summary}</p>}
          <div className="workspace-ops-meta">
            <span>Last updated {new Date(document.updatedAt).toLocaleDateString()} at {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Visibility: {document.visibility}</span>
            {document.minimumRole && <span>Minimum role: {document.minimumRole}</span>}
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
