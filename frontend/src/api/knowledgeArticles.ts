export type ArticleStatus = "draft" | "published" | "archived";

export type KnowledgeArticle = {
  id: number;
  title: string;
  category: string;
  summary: string;
  body: string;
  source_url: string | null;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};

export type KnowledgeArticleCreatePayload = {
  title: string;
  category: string;
  summary: string;
  body: string;
  source_url?: string | null;
  status: ArticleStatus;
};

export type KnowledgeArticleUpdatePayload = Partial<KnowledgeArticleCreatePayload>;

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

export function listKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  return request<KnowledgeArticle[]>("/knowledge-articles");
}

export function createKnowledgeArticle(payload: KnowledgeArticleCreatePayload): Promise<KnowledgeArticle> {
  return request<KnowledgeArticle>("/knowledge-articles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateKnowledgeArticle(
  id: number,
  payload: KnowledgeArticleUpdatePayload,
): Promise<KnowledgeArticle> {
  return request<KnowledgeArticle>(`/knowledge-articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteKnowledgeArticle(id: number): Promise<void> {
  return request<void>(`/knowledge-articles/${id}`, {
    method: "DELETE",
  });
}
