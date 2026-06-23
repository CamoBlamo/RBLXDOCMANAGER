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
      if (!workspaceId || !docId) {
        setError("Missing workspace or document ID.");
        setLoading(false);
        return;
      }

      setError("");
      try {
        const response = await fetch(
          `/api/documents?workspaceId=${workspaceId}&documentId=${docId}`,
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
          <p className="workspace-ops-subtitle">{document.summary || "No summary provided."}</p>
          <div className="workspace-ops-meta">
            <span>Visibility: {document.visibility}</span>
            <span>Minimum role: {document.minimumRole}</span>
            <span>Updated: {new Date(document.updatedAt).toLocaleString()}</span>
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
