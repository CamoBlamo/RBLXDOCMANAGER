import Topbar from "../components/Topbar";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <>
      <Topbar />
      <main className="sign-in-page">
        <div className="sign-in-div">
          <SignIn
            path="/sign-in"
            routing="path"
            forceRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </main>
    </>
  );
}