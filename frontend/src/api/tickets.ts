export type TicketStatus = "open" | "in_review" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export type Ticket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketCreatePayload = {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  assignee?: string | null;
};

export type TicketUpdatePayload = Partial<TicketCreatePayload> & {
  status?: TicketStatus;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listTickets(): Promise<Ticket[]> {
  return request<Ticket[]>("/tickets");
}

export function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  return request<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTicket(id: number, payload: TicketUpdatePayload): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTicket(id: number): Promise<void> {
  return request<void>(`/tickets/${id}`, {
    method: "DELETE",
  });
}
