import Topbar from "../components/Topbar";

function Workspace() {
  return (
    <>
      <Topbar />
      <main className="global-div">
        <section className="workspace-page">
          <h1>Workspace Name</h1>
          <p>
            This is your workspace page. Here you can manage your documents,
            collaborate with your team, and access all the features of the
            Roblox Group Document Manager.
          </p>
        </section>

        <section className="workspace-documents">
          <h2>Documents</h2>
          <p>
            Here you can view and manage all your documents for this workspace.
            Click on a document to open it and start editing.
          </p>

          <section className="workspace-document-card-template">
            <h3>Document Name</h3>
            <p>Last edited: Date</p>
            <button className="open-workspace-btn">Open Document</button>
          </section>


          <div className="workspace-documents-list">
            <article className="workspace-document-card">
              <h3>Group Rules</h3>
              <p>Last edited: Today</p>
              <button className="open-workspace-btn">Open Document</button>
            </article>

            <article className="workspace-document-card">
              <h3>Announcement Template</h3>
              <p>Last edited: Yesterday</p>
              <button className="open-workspace-btn">Open Document</button>
            </article>
          </div>
        </section>

        <section className="workspace-Settings">
            <h2>Workspace Settings</h2>
            <p>Manage your workspace settings, including permissions, collaborators, and other configurations for the Roblox Group Document Manager.</p>
            <hr />
            <div className="workspace-settings-toolbar">
                <button id="permissions-settings-btn">Permissions</button>
                <button id="department-settings-btn">Departments</button>
                <button id="collaborators-settings-btn">Collaborators</button>
                <button id="other-workspace-settings-btn">Other Settings</button>
            </div>
        </section>

      </main>
    </>
  );
}

export default Workspace;