import Topbar from "./components/Topbar";
export default function Home() {
  return (
<div className="global-div">
    <Topbar />
    <div className="welcome-div">
      <h1>Roblox Group Document Manager</h1>
      <p>
        The Roblox Group Document Manager is a tool designed to help Roblox group owners and administrators manage their group documents efficiently. It provides a user-friendly interface for creating, editing, and organizing documents related to the group, such as rules, announcements, and member information. With features like version control and collaboration tools, the Roblox Group Document Manager aims to streamline communication and enhance the overall management experience for Roblox groups.
      </p>

      </div>

      <div className="images">
        <img src="/images/feature1.png" alt="Feature 1" />
        <img src="/images/feature2.png" alt="Feature 2" />
        <img src="/images/feature3.png" alt="Feature 3" />
      </div>

</div>
  );
}
