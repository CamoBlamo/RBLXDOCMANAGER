function profile() {
    return (
        <>
        <DashboardTopbar />
        <div className="profile-div">
            <h1>Profile</h1>
            <p>
                This is your profile page. Here you can view your account information for the Roblox Group Document Manager. Keep your profile up to date to ensure you have the best experience using our tool.
            </p>
        </div>

<div className="profile-information">
    <h2>Profile Information</h2>
    <p><strong>Name:</strong> John Doe</p>
    <p><strong>Email:</strong>
        <a href="mailto:johndoe@example.com">johndoe@example.com</a>
    </p>
</div>

        </>
    );
}

export default profile;