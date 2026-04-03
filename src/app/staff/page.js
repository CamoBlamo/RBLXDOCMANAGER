import Topbar from "../components/Topbar";
export default function Staff() {
    return (
        <>
        <Topbar />
        <div className="staff-div">
            <h1>Our Staff</h1>
            <p>
                Meet the dedicated team behind the Roblox Group Document Manager. Our staff is committed to providing the best experience for our users, ensuring that your group management is smooth and efficient.
            </p>
        </div>

        <div className="staff-members">
            <div className="staff-member">
                <h2>Coming Soon</h2>
                <p>We will be introducing our staff members soon! Stay tuned to learn more about the talented individuals who are working hard to bring you the best group document management experience on Roblox.</p>
            </div>
        </div>
        </>
    );
}