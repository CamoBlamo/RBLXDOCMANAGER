import DashboardTopbar from "../../components/DashboardTopbar";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserRole } from "../../../lib/roles";

export default async function Profilepage() {
    const user = await currentUser();
    await ensureUserRole(user);
    
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
            <main className="profile-page">
                <div className="profile-div">
                    <h1>Your Profile</h1>
                    <p>
                        This is your profile page. Here you can view and manage your account information, linked accounts, and other profile settings for the Roblox Group Document Manager.
                    </p>
                </div>

                <div className="profile-info">
                    <h2>Profile Information</h2>
                    <p><strong>Name:</strong> {profileName}</p>
                    <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || "Not available"}</p>
                </div>
                </main>
        </>
    );
}
