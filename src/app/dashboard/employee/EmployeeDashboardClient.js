"use client";

import Link from "next/link";
import { useState } from "react";
import DashboardTopbar from "../../components/DashboardTopbar";

export default function EmployeeDashboardClient({
  profileImageUrl,
  profileName,
  role,
}) {
  const [activeSection, setActiveSection] = useState("information");
  const canSeeOwnerShortcut = role === "owner" || role === "admin";

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="dashboard-page">
        <div className="settings-div">
          <h1>Employee Dashboard</h1>
          <p>
            Welcome {profileName}. Use the toolbar below to switch between your
            employee panels.
          </p>
        </div>

        <div className="settings-toolbar">
          <button
            type="button"
            className="open-workspace-btn"
            aria-pressed={activeSection === "information"}
            onClick={() => setActiveSection("information")}
          >
            Employee Information
          </button>
          <button
            type="button"
            className="open-workspace-btn"
            aria-pressed={activeSection === "punishments"}
            onClick={() => setActiveSection("punishments")}
          >
            Employee Punishments
          </button>
          <button
            type="button"
            className="open-workspace-btn"
            aria-pressed={activeSection === "payments"}
            onClick={() => setActiveSection("payments")}
          >
            Employee Payments
          </button>
          <button
            type="button"
            className="open-workspace-btn"
            aria-pressed={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          >
            Employee Settings
          </button>
          {canSeeOwnerShortcut && (
            <Link
              href="/dashboard/employee/owner"
              className="open-workspace-btn secondary"
            >
              Open Owner Dashboard
            </Link>
          )}
        </div>

        <article
          className="employee-dashboard-information"
          hidden={activeSection !== "information"}
        >
          <h2>Employee Information</h2>
          <p>
            Here you can view your employee information, including your current
            role, permissions, and other employment details.
          </p>

          <div className="info-section1">
            <h3>Guides</h3>
            <p>
              Access guides and documentation to help you navigate your
              responsibilities.
            </p>
            <div className="info-links">
              <a href="EMPLOYEE-GUIDE-LINK" target="_blank" rel="noopener noreferrer">
                Employee Guide
              </a>
              <a href="DEPT-INFO-LINK" target="_blank" rel="noopener noreferrer">
                Department Information
              </a>
              <a href="POLICY-LINK" target="_blank" rel="noopener noreferrer">
                Company Policies
              </a>
            </div>
          </div>
        </article>

        <article
          className="employee-dashboard-punishments"
          hidden={activeSection !== "punishments"}
        >
          <h2>Employee Punishments</h2>
          <p>View disciplinary actions or warnings issued to your account.</p>
          <div className="punishment-list">
            <div className="punishment-item">
              <p><strong>Date:</strong> MM/DD/YYYY</p>
              <p><strong>Reason:</strong> Placeholder reason</p>
              <p><strong>Status:</strong> Active/Resolved</p>
            </div>
          </div>
        </article>

        <article
          className="employee-dashboard-payments"
          hidden={activeSection !== "payments"}
        >
          <h2>Employee Payments</h2>
          <p>View your payment history.</p>
          <div className="payment-metrics">
            <p><strong>Total Earnings:</strong> $0</p>
          </div>
          <div className="payment-history">
            <div className="payment-item">
              <p><strong>Date:</strong> MM/DD/YYYY</p>
              <p><strong>Amount:</strong> $0</p>
            </div>
          </div>
        </article>

        <article
          className="employee-dashboard-settings"
          hidden={activeSection !== "settings"}
        >
          <h2>Employee Settings</h2>
          <p>
            Manage notification preferences, account details, and other options.
          </p>

          <div className="settings-options">
            <button type="button">Notification Preferences</button>
            <button type="button">Account Details</button>
            <button type="button">Other Settings</button>
          </div>

          <div className="notification-preferences">
            <h3>Notification Preferences</h3>
            <p>Customize how you receive updates and assignments.</p>
            <div className="notification-options">
              <label>
                <input type="checkbox" name="emailNotifications" />
                Email Notifications
              </label>
              <label>
                <input type="checkbox" name="smsNotifications" />
                SMS Notifications
              </label>
              <label>
                <input type="checkbox" name="pushNotifications" />
                Push Notifications
              </label>
            </div>
          </div>

          <div className="account-details">
            <h3>Account Details</h3>
            <p>Update your account details and profile configuration.</p>
            <button type="button">Update Profile Picture</button>
            <button type="button">Change Username</button>
            <button type="button">Other Account Settings</button>
          </div>

          <div className="other-settings">
            <h3>Other Settings</h3>
            <p>Additional personalization options for your dashboard.</p>
            <button type="button">Language Preferences</button>
            <button type="button">Theme Settings</button>
            <button type="button">Other Customization Options</button>
          </div>
        </article>
      </main>
    </>
  );
}
