import Topbar from "../components/Topbar";

function SignIn() {
    return (
        <>
            <Topbar />
            <main className="sign-in-page">
                <div className="sign-in-div">
                    <h1>Sign In</h1>
                    <p>
                        Sign in to your account to access the Roblox Group Document Manager. Enter your credentials below to log in and manage your group documents efficiently.
                    </p>

                    <div className="sign-in-form">
                        <h2>Continue with Discord</h2>
                        <button id="discord-sign-in-btn">Sign in with Discord</button>
                        <p className="sign-in-note">You will be redirected to Discord to authorize your account.</p>
                    </div>
                </div>
            </main>
        </>
    );
}

export default SignIn;