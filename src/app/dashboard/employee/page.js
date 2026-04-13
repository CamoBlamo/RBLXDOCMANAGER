import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EmployeeDashboardClient from "./EmployeeDashboardClient";
import { EMPLOYEE_PLUS_ROLES, ensureUserRole } from "../../../lib/roles";

export default async function EmployeeDashboard() {
  const user = await currentUser();
  const role = await ensureUserRole(user);

  if (!EMPLOYEE_PLUS_ROLES.includes(role)) {
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
    <EmployeeDashboardClient
      profileImageUrl={profileImageUrl}
      profileName={profileName}
      role={role}
    />
  );
}