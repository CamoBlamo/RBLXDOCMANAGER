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
            aria-pressed={active === "other"}
            onClick={() => setActive("other")}
          >Other Preferences</button>
        </div>

        <div className="settings-div" hidden={active !== "account"}>
          <h2>Account Settings</h2>
          {/* account content */}
        </div>

        <div className="settings-div" hidden={active !== "standing"}>
          <h2>Account Standing</h2>
          {/* standing content */}
        </div>

        <div className="settings-div" hidden={active !== "other"}>
          <h2>Other Preferences</h2>
          {/* other content */}
        </div>
      </main>
    </>
  );
}