import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

const tickets = [
  ["INC-1048", "VPN access failing", "Open", "danger"],
  ["INC-1047", "Teams audio unavailable", "In review", "warning"],
  ["INC-1046", "Software install request", "Resolved", "success"],
];

export function TicketsPage() {
  return (
    <>
      <PageHeader title="Tickets" description="Track escalated issues and support ownership across IT teams." action="Create ticket" />
      <section className="panel">
        <div className="table-list">
          {tickets.map(([id, title, status, tone]) => (
            <div className="table-row" key={id}>
              <strong>{id}</strong>
              <span>{title}</span>
              <StatusBadge tone={tone as "success" | "warning" | "danger"}>{status}</StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
