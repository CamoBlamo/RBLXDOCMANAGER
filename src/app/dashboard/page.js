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
            </div>

            <div className="dashboard-workspaces">
                <h2>Your Workspaces</h2>
                <p>Here you can view and manage all your workspaces for the Roblox Group Document Manager. Click on a workspace to access its documents and settings.</p>
                <div className="workspace-list">
                    <div className="workspace-card-template">
                        <h3>Workspace Name</h3>
                        <p><strong>Owner:</strong> Owner Name</p>
                        <p><strong>Created On:</strong> Creation Date</p>
                        <button className="open-workspace-btn">Open Workspace</button>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}

export default dashboard;