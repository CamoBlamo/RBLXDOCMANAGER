import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserRole } from "../../lib/roles";
import NewWorkspaceClient from "./NewWorkspaceClient";

export default async function NewWorkspacePage() {
	const user = await currentUser();

	if (!user?.id) {
		redirect("/sign-in");
	}

	await ensureUserRole(user);

	const discordAccount = user.externalAccounts?.find(
		(account) => account.provider === "oauth_discord"
	);

	const profileImageUrl =
		discordAccount?.imageUrl || user.imageUrl || "/default-avatar.png";

	const profileName =
		discordAccount?.username ||
		discordAccount?.identifier ||
		user.username ||
		user.firstName ||
		"User";

	return (
		<NewWorkspaceClient
			profileImageUrl={profileImageUrl}
			profileName={profileName}
		/>
	);
}
