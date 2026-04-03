function DashboardTopbar() {
    return (
        <>
        <div className="dashboard-topbar">
            <nav className="dashboard-nav">
                <ul className="dashboard-nav-list">
                <li><a href="/dashboard" className="dashboard-nav-link">Dashboard</a></li>
                <li><a href="/dashboard/profile" className="dashboard-nav-link">Settings</a></li>
                <li><a href="/dashboard/settings" className="dashboard-nav-link">Profile</a></li>
                </ul>
            </nav>

            
        </div>

        <div className="system-status">
            <span className="status-indicator online"></span>
            <span className="status-text">System Online</span>
        </div>

        <div className="profile">
            <img src="profile-pic" alt="Profile Picture" className="profile-pic" />
            <span className="profile-name">USERNAME HERE</span>
        </div>
        </>

    );
}
export default DashboardTopbar;