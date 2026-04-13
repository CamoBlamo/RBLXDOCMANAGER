import DashboardTopbar from "../../components/DashboardTopbar";
import { currentUser } from "@clerk/nextjs/server";

export default async function OwnerDashboard() {
  const user = await currentUser();
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
    return (
        <>
            <DashboardTopbar
                profileImageUrl={profileImageUrl}
                profileName={profileName}
            />
            <div className="owner-dashboard-content">
                <h1>Owner Dashboard</h1>
                <p>Welcome {profileName}. This is the owner dashboard where you can manage your business and employees.</p>
                <div className="owner-dashboard-panels">
                    <div className="owner-dashboard-panel">
                        <h2>User Role Management</h2>
                        <p>View and manage user roles and permissions.</p>

                        <div className="user-list">
                            <div className="user-list-item">
                                <span className="user-name">John Doe</span>
                                <select className="role-select">
                                    <option value="chooseone" disabled selected>Choose Role</option>
                                    <option value="employee">Employee</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                    </select>
                        </div>
                    </div>
            </div>
    );
            </div>
        </>