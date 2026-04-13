"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardTopbar from "../../components/DashboardTopbar";

const ROLE_OPTIONS = ["user", "employee", "supervisor", "manager", "admin", "owner"];

export default function OwnerDashboardClient({
  profileImageUrl,
  profileName,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingByUserId, setSavingByUserId] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/owner/users", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Could not load users");
        }

        const data = await res.json();
        if (isMounted) {
          setUsers(Array.isArray(data?.users) ? data.users : []);
        }
      } catch (_loadErr) {
        if (isMounted) {
          setError("Unable to load users. Check permissions and try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const byRole = users.reduce(
      (acc, item) => {
        const role = String(item?.role || "user").toLowerCase();
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      totalUsers: users.length,
      employeePlus:
        (byRole.employee || 0) +
        (byRole.supervisor || 0) +
        (byRole.manager || 0) +
        (byRole.admin || 0) +
        (byRole.owner || 0),
      owners: byRole.owner || 0,
    };
  }, [users]);

  async function updateRole(userId, role) {
    const previous = users;
    setSavingByUserId((old) => ({ ...old, [userId]: true }));
    setError("");

    setUsers((old) => old.map((u) => (u.id === userId ? { ...u, role } : u)));

    try {
      const res = await fetch("/api/owner/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      if (!res.ok) {
        throw new Error("Role update failed");
      }
    } catch (_updateErr) {
      setUsers(previous);
      setError("Role update failed. Please try again.");
    } finally {
      setSavingByUserId((old) => ({ ...old, [userId]: false }));
    }
  }

  return (
    <>
      <DashboardTopbar
        profileImageUrl={profileImageUrl}
        profileName={profileName}
      />

      <main className="dashboard-page">
        <section className="settings-div">
          <h1>Owner Dashboard</h1>
          <p>
            Welcome {profileName}. Manage platform access, team roles, and
            operational status from one place.
          </p>
        </section>

        <section className="owner-dashboard-section">
          <h2>Overview</h2>
          <div className="dashboard-metrics owner-dashboard-metrics">
            <article className="dashboard-metric-card">
              <p className="metric-label">Total Users</p>
              <p className="metric-value">{metrics.totalUsers}</p>
            </article>
            <article className="dashboard-metric-card">
              <p className="metric-label">Employee Plus</p>
              <p className="metric-value">{metrics.employeePlus}</p>
            </article>
            <article className="dashboard-metric-card">
              <p className="metric-label">Owners</p>
              <p className="metric-value">{metrics.owners}</p>
            </article>
          </div>
        </section>

        <section className="owner-dashboard-section">
          <h2>User Role Management</h2>
          <p>Changing a role here updates Clerk public metadata immediately.</p>

          {loading && <p>Loading users...</p>}
          {!loading && error && <p className="owner-error">{error}</p>}

          {!loading && !error && (
            <div className="owner-user-list">
              {users.map((person) => (
                <article className="owner-user-row" key={person.id}>
                  <div>
                    <p className="owner-user-name">{person.fullName}</p>
                    <p className="owner-user-meta">{person.email}</p>
                  </div>

                  <div className="owner-user-controls">
                    <select
                      className="owner-role-select"
                      value={person.role}
                      disabled={Boolean(savingByUserId[person.id])}
                      onChange={(event) => updateRole(person.id, event.target.value)}
                    >
                      {ROLE_OPTIONS.map((roleOption) => (
                        <option value={roleOption} key={roleOption}>
                          {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                        </option>
                      ))}
                    </select>
                    {savingByUserId[person.id] && (
                      <span className="owner-saving">Saving...</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
