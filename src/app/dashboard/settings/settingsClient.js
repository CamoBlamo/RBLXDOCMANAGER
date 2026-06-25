"use client";
import { useState } from "react";
import DashboardTopbar from "../../components/DashboardTopbar";

export default function SettingsClient({ profileImageUrl, profileName, email, externalAccounts }) {
  const [active, setActive] = useState("account");

  return (
    <>
      <DashboardTopbar profileImageUrl={profileImageUrl} profileName={profileName} />
      <main className="dashboard-page">
        <div className="settings-div">
          <h1>Settings</h1>
          <p>Manage your account settings...</p>
        </div>

        <div className="settings-toolbar">
          <button
            className="open-workspace-btn"
            aria-pressed={active === "account"}
            onClick={() => setActive("account")}
          >Account Settings</button>
          <button
            className="open-workspace-btn"
            aria-pressed={active === "standing"}
            onClick={() => setActive("standing")}
          >Account Standing</button>
          <button
            className="open-workspace-btn"
            aria-pressed={active === "themes"}
            onClick={() => setActive("themes")}
          > Themes</button>
        </div>

        <div className="settings-div" hidden={active !== "account"}>
          <h2>Account Settings</h2>
          <p>Username: {profileName}</p>
          <p>Email: {email}</p>
          <p>Account Security Access Code: 837482</p> {/* This is a placeholder. This code will be rotating. */}
        </div>

        <div className="settings-div" hidden={active !== "standing"}>
          <h2>Account Standing</h2>
          <p id="account-standing-status">STANDING STATUS</p>

          <button id="report-issue-btn" className="open-workspace-btn secondary">View Previous Violations</button>
        </div>

        <div className="settings-div" hidden={active !== "themes"}>
          <h2>Themes</h2>
          <p>Choose your preferred theme.</p>
          {/* other content */}
        </div>
      </main>
    </>
  );
}