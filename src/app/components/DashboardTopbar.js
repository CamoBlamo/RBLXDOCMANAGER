function DashboardTopbar({ profileImageUrl, profileName }) {
  return (
    <div className="dashboard-topbar">
      <div className="dashboard-topbar-inner">
        <nav className="dashboard-nav">
          <ul className="dashboard-nav-list">
            <li><a href="/dashboard" className="dashboard-nav-link">Dashboard</a></li>
            <li><a href="/dashboard/settings" className="dashboard-nav-link">Settings</a></li>
            <li><a href="/dashboard/profile" className="dashboard-nav-link">Profile</a></li>
          </ul>
        </nav>

        <div className="dashboard-meta">
          <div className="system-status">
            <span className="status-indicator green"></span>
            <span className="status-text">System Online</span>
          </div>

          <div className="profile">
            <img
              src={profileImageUrl}
              alt="Profile Picture"
              className="profile-pic"
              referrerPolicy="no-referrer"
            />
            <span className="profile-name">{profileName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTopbar;