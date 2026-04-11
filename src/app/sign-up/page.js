import Topbar from "../components/Topbar";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const hasClerkPublishableKey = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  return (
    <>
      <Topbar />
      <main className="sign-in-page">
        <div className="sign-in-div">
          {hasClerkPublishableKey ? (
            <SignUp
              path="/sign-up"
              routing="path"
              forceRedirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          ) : (
            <p>
              Authentication is temporarily unavailable. Configure Clerk environment
              variables and redeploy.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
