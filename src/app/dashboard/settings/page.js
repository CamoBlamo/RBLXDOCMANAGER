import { currentUser } from "@clerk/nextjs/server";
import { ensureUserRole } from "../../../lib/roles";
import SettingsClient from "./settingsClient";

export default async function SettingsPage() {
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

    const email = user?.emailAddresses?.[0]?.emailAddress || "Not available";
    const externalAccounts = user?.externalAccounts ?? [];

    return (
        <SettingsClient
            profileImageUrl={profileImageUrl}
            profileName={profileName}
            email={email}
            externalAccounts={externalAccounts}
        />
    );
}