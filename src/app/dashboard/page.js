import DashboardTopbar from "../components/DashboardTopbar";


function dashboard() {
    return (
        <>
        <DashboardTopbar />
        <main className="dashboard-page">
            <div className="dashboard-div">
                <h1>Welcome to the Dashboard</h1>
                <p>
                    This is your dashboard where you can manage your Roblox Group Document Manager account, view your workspaces, and access your profile and settings.
                </p>

                <div className="dashboard-metrics">
                    <article className="dashboard-metric-card">
                        <p className="metric-label">Workspaces</p>
                        <p className="metric-value">3</p>
                    </article>
                    <article className="dashboard-metric-card">
                        <p className="metric-label">Active Documents</p>
                        <p className="metric-value">27</p>
                    </article>
                    <article className="dashboard-metric-card">
                        <p className="metric-label">Pending Reviews</p>
                        <p className="metric-value">5</p>
                    </article>
                </div>
            </div>

            <div className="dashboard-workspaces">
                <h2>Your Workspaces</h2>
                <p>Here you can view and manage all your workspaces for the Roblox Group Document Manager. Click on a workspace to access its documents and settings.</p>
                <div className="workspace-list">
                    <div className="workspace-card-template">
                        <h3>Workspace Name</h3>
                        <p><strong>Owner:</strong> Owner Name</p>
                        <p><strong>Created On:</strong> Creation Date</p>
                        <div className="workspace-card-actions">
                            <button className="open-workspace-btn">Open Workspace</button>
                            <button className="open-workspace-btn secondary">Manage Members</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}

export default dashboard;