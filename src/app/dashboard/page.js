import DashboardTopbar from "../components/DashboardTopbar";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserRole } from "../../lib/roles";
import { getDb } from "../../lib/mongodb";
import { serializeWorkspace } from "../../lib/workspaces";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();
  await ensureUserRole(user);

  const discordAccount = user?.externalAccounts?.find(
    (account) => account.provider === "oauth_discord"
  );

  const profileImageUrl =
    discordAccount?.imageUrl || user?.imageUrl || "/default-avatar.png";

  const profileName =
    discordAccount?.username ||
    discordAccount?.identifier ||
    user?.username ||
    user?.firstName ||
    "User";

  const db = await getDb();
  const docs = await db
    .collection("workspaces")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  const workspaces = docs.map(serializeWorkspace);
  const documentsCount = await db.collection("documents").countDocuments();
  const workspaceCount = workspaces.length;
  const pendingReviews = 0;

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="dashboard-page">
        <div className="dashboard-div">
          <h1>Welcome to the Dashboard</h1>
          <p>
            This is your dashboard where you can manage your Roblox Group
            Document Manager account, view your workspaces, and access your
            profile and settings.
          </p>

          <div className="dashboard-metrics">
            <article className="dashboard-metric-card">
              <p className="metric-label">Workspaces</p>
              <p className="metric-value">{workspaceCount}</p>
            </article>
            <article className="dashboard-metric-card">
              <p className="metric-label">Active Documents</p>
              <p className="metric-value">{documentsCount}</p>
            </article>
            <article className="dashboard-metric-card">
              <p className="metric-label">Pending Reviews</p>
              <p className="metric-value">{pendingReviews}</p>
            </article>
          </div>
        </div>

        <div className="dashboard-workspaces">
          <p>Do not have a workspace yet? Create one to get started!</p>
          <Link href="/newworkspace" className="create-workspace-btn">
            + Create New Workspace
          </Link>
          <h2>Your Workspaces</h2>
          <p>
            Here you can view and manage all your workspaces for the Roblox
            Group Document Manager. Click on a workspace to access its
            documents and settings.
          </p>
          <div className="workspace-list">
            {workspaces.length === 0 ? (
              <div className="workspace-card-template">
                <h3>No workspaces yet</h3>
                <p>Create one to begin managing documents and members.</p>
              </div>
            ) : (
              workspaces.map((workspace) => (
                <article key={workspace.id} className="workspace-card-template">
                  <h3>{workspace.name || "Untitled Workspace"}</h3>
                  <p>
                    <strong>Owner:</strong> {workspace.ownerClerkUserId}
                  </p>
                  <p>
                    <strong>Server:</strong> {workspace.guildName || "Unknown"}
                  </p>
                  <p>
                    <strong>Created On:</strong>{" "}
                    {workspace.createdAt
                      ? new Date(workspace.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                  <div className="workspace-card-actions">
                    <Link
                      href={`/workspace?workspaceId=${workspace.id}`}
                      className="open-workspace-btn"
                    >
                      Open Workspace
                    </Link>
                    <Link
                      href={`/workspace?workspaceId=${workspace.id}`}
                      className="open-workspace-btn secondary"
                    >
                      Manage Members
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}