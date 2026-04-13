import DashboardTopbar from "../../components/DashboardTopbar";
import { currentUser } from "@clerk/nextjs/server";

export default async function SettingsPage() {
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
            <main className="settings-page">
                <div className="settings-div">
                    <h1>Settings</h1>
                    <p>
                        This is your settings page. Here you can manage your account settings, linked accounts, notification preferences, and other configurations for the Roblox Group Document Manager.
                    </p>
                </div>
                <div className="settings-toolbar">
                    <button id="account-settings-btn">Account Settings</button>
                    <button id="account-standing-btn">Account Standing</button>
                    <button id="other-settings-btn">Other Preferences</button>
                </div>
            </main>
        </>
    );
}
