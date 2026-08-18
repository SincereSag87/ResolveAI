export type ConversationStatus = "active" | "resolved" | "escalated" | "closed";
export type MessageRole = "employee" | "agent" | "system";

export type Message = {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
};

export type Conversation = {
  id: number;
  title: string;
  status: ConversationStatus;
  employee_email: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

export type ConversationSummary = Omit<Conversation, "messages"> & {
  message_count: number;
};

export type ConversationCreatePayload = {
  title: string;
  employee_email?: string | null;
  initial_message?: string | null;
};

export type MessageCreatePayload = {
  role: MessageRole;
  content: string;
  source_type?: string | null;
  source_id?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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

export function listConversations(): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>("/conversations");
}

export function createConversation(payload: ConversationCreatePayload): Promise<Conversation> {
  return request<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getConversation(id: number): Promise<Conversation> {
  return request<Conversation>(`/conversations/${id}`);
}

export function addMessage(id: number, payload: MessageCreatePayload): Promise<Conversation> {
  return request<Conversation>(`/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
