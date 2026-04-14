import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserRole } from "../../../lib/roles";
import DocumentEditorClient from "./DocumentEditorClient";

export default async function DocumentEditorPage({ searchParams }) {
	const user = await currentUser();

	if (!user) {
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

	const workspaceId = String(searchParams?.workspaceId || "");
	const docId = String(searchParams?.docId || "");

	return (
		<DocumentEditorClient
			profileImageUrl={profileImageUrl}
			profileName={profileName}
			workspaceId={workspaceId}
			docId={docId}
		/>
	);
}
