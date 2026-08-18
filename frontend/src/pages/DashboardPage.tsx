import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

const queue = [
  ["VPN access failing", "Networking", "High"],
  ["Laptop running slowly", "Endpoint", "Medium"],
  ["Password reset loop", "Identity", "Medium"],
  ["Printer unavailable", "Facilities IT", "Low"],
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor ticket demand, AI resolution progress, and high-priority support activity."
        action="New ticket"
      />
      <div className="metrics-grid">
        <MetricCard label="Open tickets" value="128" trend="+12 today" tone="warn" />
        <MetricCard label="AI deflection" value="42%" trend="+8% this week" tone="good" />
        <MetricCard label="Avg response" value="4m 18s" trend="-21s today" tone="good" />
        <MetricCard label="Escalations" value="17" trend="5 high priority" />
      </div>
      <section className="panel">
        <div className="panel-header">
          <h2>Active support queue</h2>
          <button className="secondary-button">View all</button>
        </div>
        <div className="table-list">
          {queue.map(([title, team, priority]) => (
            <div className="table-row" key={title}>
              <strong>{title}</strong>
              <span>{team}</span>
              <StatusBadge tone={priority === "High" ? "danger" : priority === "Medium" ? "warning" : "neutral"}>
                {priority}
              </StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
