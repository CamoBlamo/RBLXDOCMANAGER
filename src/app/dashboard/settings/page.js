import DashboardTopbar from "../../components/DashboardTopbar";
function settings() {
    return (
        <>
        <DashboardTopbar />
        <div className="settings-div">
            <h1>Settings</h1>
            <p>
                This is your settings page. Here you can manage your account settings, privacy preferences, and other configurations for the Roblox Group Document Manager.
            </p>
        </div>

        <div className="settings-option">
            <h2>Account Settings</h2>
            <p>Manage your account information, account standing, and other related preferences.</p>
            <hr />
            <div className="settings-toolbar">
                <button id="account-settings-btn">Account Information</button>
                <button id="standing-settings-btn">Account Standing</button>
                <button id="other-settings-btn">Other Settings</button>
            </div>
        </div>


        </>
    );
}

export default settings;