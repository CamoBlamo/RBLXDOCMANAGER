import Topbar from "../components/Topbar";

export default function Features() {
    return (
      <>
      <Topbar />
      <div className="features-div">
        <h2>Features</h2>
        <ul>
          <li>Document Creation: Easily create new documents for your Roblox group.</li>
          <li>Editing Tools: Edit existing documents with a simple and intuitive interface.</li>
          <li>Organization: Organize your documents into categories for easy access.</li>
          <li>Version Control: Keep track of changes made to documents with version history.</li>
          <li>Collaboration: Allow multiple administrators to collaborate on document management.</li>
        </ul>
      </div>
      </>
    );
}