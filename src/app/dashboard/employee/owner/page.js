import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OwnerDashboardClient from "./OwnerDashboardClient";

const OWNER_ROLES = ["owner", "admin"];

export default async function OwnerDashboard() {
    const user = await currentUser();
    const role = String(user?.publicMetadata?.role || "").toLowerCase();

    if (!OWNER_ROLES.includes(role)) {
        redirect("/dashboard");
    }

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
        <OwnerDashboardClient
            profileImageUrl={profileImageUrl}
            profileName={profileName}
        />
    );
}