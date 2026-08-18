import { FormEvent, useEffect, useMemo, useState } from "react";
import { createTicket, deleteTicket, listTickets, updateTicket } from "../api/tickets";
import type { Ticket, TicketPriority, TicketStatus } from "../api/tickets";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  closed: "Closed",
};

const statusTones: Record<TicketStatus, "neutral" | "success" | "warning" | "danger"> = {
  open: "danger",
  in_review: "warning",
  resolved: "success",
  closed: "neutral",
};

const priorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

type TicketFormState = {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  assignee: string;
};

const initialFormState: TicketFormState = {
  title: "",
  description: "",
  priority: "medium",
  category: "general",
  assignee: "",
};

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [formState, setFormState] = useState<TicketFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0],
    [selectedTicketId, tickets],
  );

  useEffect(() => {
    let isMounted = true;

    listTickets()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setTickets(data);
        setSelectedTicketId(data[0]?.id ?? null);
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const createdTicket = await createTicket({
        ...formState,
        assignee: formState.assignee.trim() || null,
      });
      setTickets((currentTickets) => [createdTicket, ...currentTickets]);
      setSelectedTicketId(createdTicket.id);
      setFormState(initialFormState);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create ticket");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(ticket: Ticket, status: TicketStatus) {
    setError(null);
    try {
      const updatedTicket = await updateTicket(ticket.id, { status });
      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) => (currentTicket.id === ticket.id ? updatedTicket : currentTicket)),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update ticket");
    }
  }

  async function handleDelete(ticket: Ticket) {
    setError(null);
    try {
      await deleteTicket(ticket.id);
      setTickets((currentTickets) => currentTickets.filter((currentTicket) => currentTicket.id !== ticket.id));
      setSelectedTicketId((currentId) => (currentId === ticket.id ? null : currentId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete ticket");
    }
  }

  return (
    <>
      <PageHeader title="Tickets" description="Track escalated issues and support ownership across IT teams." />
      {error ? <div className="alert alert--error">{error}</div> : null}
      <div className="ticket-workspace">
        <section className="panel ticket-list-panel">
          <div className="panel-header">
            <h2>Ticket queue</h2>
            <span>{isLoading ? "Loading..." : `${tickets.length} total`}</span>
          </div>
          <div className="table-list">
            {tickets.map((ticket) => (
              <button
                className={`ticket-row ${ticket.id === selectedTicket?.id ? "ticket-row--active" : ""}`}
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                type="button"
              >
                <strong>INC-{String(ticket.id).padStart(4, "0")}</strong>
                <span>{ticket.title}</span>
                <StatusBadge tone={statusTones[ticket.status]}>{statusLabels[ticket.status]}</StatusBadge>
              </button>
            ))}
            {!isLoading && tickets.length === 0 ? <p className="empty-state">No tickets yet.</p> : null}
          </div>
        </section>

        <aside className="panel ticket-detail-panel">
          {selectedTicket ? (
            <>
              <div className="panel-header">
                <h2>{selectedTicket.title}</h2>
                <StatusBadge tone={statusTones[selectedTicket.status]}>{statusLabels[selectedTicket.status]}</StatusBadge>
              </div>
              <dl className="ticket-detail-list">
                <div>
                  <dt>Priority</dt>
                  <dd>{priorityLabels[selectedTicket.priority]}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{selectedTicket.category}</dd>
                </div>
                <div>
                  <dt>Assignee</dt>
                  <dd>{selectedTicket.assignee ?? "Unassigned"}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(selectedTicket.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
              <p className="ticket-description">{selectedTicket.description}</p>
              <label className="field-group">
                Status
                <select
                  value={selectedTicket.status}
                  onChange={(event) => handleStatusChange(selectedTicket, event.target.value as TicketStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="secondary-button danger-button" onClick={() => handleDelete(selectedTicket)} type="button">
                Delete ticket
              </button>
            </>
          ) : (
            <p className="empty-state">Select a ticket to review details.</p>
          )}
        </aside>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Create ticket</h2>
        </div>
        <form className="ticket-form" onSubmit={handleSubmit}>
          <label className="field-group">
            Title
            <input
              minLength={3}
              required
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field-group">
            Category
            <input
              required
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
            />
          </label>
          <label className="field-group">
            Priority
            <select
              value={formState.priority}
              onChange={(event) => setFormState((current) => ({ ...current, priority: event.target.value as TicketPriority }))}
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            Assignee
            <input
              value={formState.assignee}
              onChange={(event) => setFormState((current) => ({ ...current, assignee: event.target.value }))}
            />
          </label>
          <label className="field-group field-group--wide">
            Description
            <textarea
              minLength={5}
              required
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Creating..." : "Create ticket"}
          </button>
        </form>
      </section>
    </>
  );
}
