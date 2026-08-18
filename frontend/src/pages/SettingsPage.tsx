import { PageHeader } from "../components/PageHeader";

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Configure workspace preferences and service desk defaults." />
      <section className="settings-grid">
        <label className="setting-item">
          Workspace name
          <input value="Enterprise IT" readOnly />
        </label>
        <label className="setting-item">
          Default escalation team
          <select defaultValue="service-desk">
            <option value="service-desk">Service Desk</option>
            <option value="networking">Networking</option>
            <option value="iam">Identity and Access</option>
          </select>
        </label>
        <label className="setting-toggle">
          <input type="checkbox" defaultChecked />
          Show source citations in support drafts
        </label>
      </section>
    </>
  );
}
