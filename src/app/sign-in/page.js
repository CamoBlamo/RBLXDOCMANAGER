import Topbar from "../components/Topbar";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const hasClerkPublishableKey = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  return (
    <>
      <Topbar />
      <main className="sign-in-page">
        <div className="sign-in-div">
          {hasClerkPublishableKey ? (
            <SignIn
              path="/sign-in"
              routing="path"
              forceRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
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