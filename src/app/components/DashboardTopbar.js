"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function DashboardTopbar({ profileImageUrl, profileName }) {
  const { user } = useUser();

  const role = String(user?.publicMetadata?.role || "").toLowerCase();
  const employeePlusRoles = ["employee", "supervisor", "manager", "admin", "owner"];
  const canSeeEmployeeLink = employeePlusRoles.includes(role);
  const canSeeOwnerLink = role === "owner" || role === "admin";

  return (
    <div className="dashboard-topbar">
      <div className="dashboard-topbar-inner">
        <nav className="dashboard-nav">
          <ul className="dashboard-nav-list">
            <li>
              <Link href="/dashboard" className="dashboard-nav-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" className="dashboard-nav-link">
                Settings
              </Link>
            </li>
            <li>
              <Link href="/dashboard/profile" className="dashboard-nav-link">
                Profile
              </Link>
            </li>

            {canSeeEmployeeLink && (
              <li>
                <Link href="/dashboard/employee" className="dashboard-nav-link">
                  Employee
                </Link>
              </li>
            )}

            {canSeeOwnerLink && (
              <li>
                <Link href="/dashboard/employee/owner" className="dashboard-nav-link">
                  Owner
                </Link>
              </li>
            )}
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