import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";

export function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Measure support volume, response performance, deflection, and escalation patterns." />
      <div className="metrics-grid">
        <MetricCard label="Tickets avoided" value="311" trend="Last 30 days" tone="good" />
        <MetricCard label="Top category" value="Access" trend="34% of demand" />
        <MetricCard label="SLA risk" value="9" trend="Needs attention" tone="warn" />
      </div>
      <section className="panel chart-panel">
        <h2>Resolution trend</h2>
        <div className="bar-chart" aria-label="Resolution trend chart">
          <span style={{ height: "42%" }} />
          <span style={{ height: "58%" }} />
          <span style={{ height: "50%" }} />
          <span style={{ height: "66%" }} />
          <span style={{ height: "74%" }} />
          <span style={{ height: "81%" }} />
        </div>
      </section>
    </>
  );
}
