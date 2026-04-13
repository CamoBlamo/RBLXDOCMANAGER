"use client";
import DashboardTopbar from "../../components/DashboardTopbar";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function EmployeeDashboard() {
  const { user } = useUser();

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

  const [activeSection, setActiveSection] = useState("information");

  const sectionId = (name) =>
    activeSection === name ? "shown-employee" : "hidden-employee";

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="employee-dashboard-page">
        <div className="employee-dashboard-div">
          <h1>Employee Dashboard</h1>
          <p>Welcome {profileName}! Ready to manage?</p>
        </div>

        <div className="employee-dashboard-metrics">
          <article className="nav-bar">
            <div className="nav-item">
              <button type="button" onClick={() => setActiveSection("information")}>
                Employee Information
              </button>
              <button type="button" onClick={() => setActiveSection("punishments")}>
                Employee Punishments
              </button>
              <button type="button" onClick={() => setActiveSection("payments")}>
                Employee Payments
              </button>
              <button type="button" onClick={() => setActiveSection("settings")}>
                Employee Settings
              </button>
            </div>
          </article>

          <article
            className="employee-dashboard-information"
            id={sectionId("information")}
          >
            ...
          </article>

          <article
            className="employee-dashboard-punishments"
            id={sectionId("punishments")}
          >
            ...
          </article>

          <article
            className="employee-dashboard-payments"
            id={sectionId("payments")}
          >
            ...
          </article>

          <article
            className="employee-dashboard-settings"
            id={sectionId("settings")}
          >
            ...
          </article>
        </div>
      </main>
    </>
  );
}