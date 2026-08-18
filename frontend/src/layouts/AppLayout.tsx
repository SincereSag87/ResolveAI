import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/chat", label: "AI Support Chat" },
  { to: "/tickets", label: "Tickets" },
  { to: "/knowledge-base", label: "Knowledge Base" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RA</div>
          <div>
            <strong>ResolveAI</strong>
            <span>IT Help Desk Agent</span>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Workspace</span>
          <strong>Enterprise IT</strong>
        </div>
      </aside>
      <div className="main-panel">
        <header className="topbar">
          <div>
            <span>Service desk command center</span>
            <strong>North America Operations</strong>
          </div>
          <div className="user-pill">RW</div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
