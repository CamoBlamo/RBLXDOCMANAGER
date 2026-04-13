import DashboardTopbar from "../../components/DashboardTopbar";
import { currentUser } from "@clerk/nextjs/server";

export default async function EmplyeeDashboard() {
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
            <main className="employee-dashboard-page">
                <div className="employee-dashboard-div">
                    <h1>Employee Dashboard</h1>
                    <p>
                        Welcome {profileName}! Ready to manage?
                    </p>
                </div>
                <div className="employee-dashboard-metrics">
                    <article className="employee-dashboard-metric-card">
                        <p id="label1">Tickets Claimed</p>
                        <p id="value1">12</p>
                    </article>
                    <article className="employee-dashboard-metric-card">
                        <p id="label2">Tickets Closed</p>
                        <p id="value2">8</p>
                    </article>
                    
                    <article className="nav-bar">
                        <div className="nav-item">
                            <button>Employee Information</button>
                            <button>Employee Metrics</button>
                            <button>Employee Punishments</button>
                            <button>Employee Payments</button>
                            <button>Employee Settings</button>
                        </div>
                    </article>