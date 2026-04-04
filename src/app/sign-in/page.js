function signIn() {
    return (
        <div className="sign-in-div">
            <h1>Sign In</h1>
            <p>
                Sign in to your account to access the Roblox Group Document Manager. Enter your credentials below to log in and manage your group documents efficiently. If you don't have an account yet, you can sign up for one to get started.
            </p>
            <div className="sign-in-form">
                <h2>Sign in with Discord</h2>
                <button id="discord-sign-in-btn">Sign in with Discord</button>
            </div>
        </div>
    );
}

export default signIn;