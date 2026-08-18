import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createKnowledgeArticle,
  deleteKnowledgeArticle,
  listKnowledgeArticles,
  updateKnowledgeArticle,
} from "../api/knowledgeArticles";
import type { ArticleStatus, KnowledgeArticle } from "../api/knowledgeArticles";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const statusTones: Record<ArticleStatus, "neutral" | "success" | "warning"> = {
  draft: "warning",
  published: "success",
  archived: "neutral",
};

type ArticleFormState = {
  title: string;
  category: string;
  summary: string;
  body: string;
  source_url: string;
  status: ArticleStatus;
};

const initialFormState: ArticleFormState = {
  title: "",
  category: "general",
  summary: "",
  body: "",
  source_url: "",
  status: "draft",
};

export function KnowledgeBasePage() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ArticleFormState>(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category))).sort(),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        [article.title, article.category, article.summary, article.body].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      return matchesCategory && matchesSearch;
    });
  }, [articles, categoryFilter, searchTerm]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? filteredArticles[0],
    [articles, filteredArticles, selectedArticleId],
  );

  useEffect(() => {
    let isMounted = true;

    listKnowledgeArticles()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const linkedArticleId = Number(searchParams.get("articleId"));
        setArticles(data);
        setSelectedArticleId(
          Number.isInteger(linkedArticleId) && data.some((article) => article.id === linkedArticleId)
            ? linkedArticleId
            : (data[0]?.id ?? null),
        );
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
  }, [searchParams]);

  async function handleCreateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const createdArticle = await createKnowledgeArticle({
        ...formState,
        source_url: formState.source_url.trim() || null,
      });
      setArticles((currentArticles) => [createdArticle, ...currentArticles]);
      setSelectedArticleId(createdArticle.id);
      setFormState(initialFormState);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create article");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(article: KnowledgeArticle, status: ArticleStatus) {
    setError(null);
    try {
      const updatedArticle = await updateKnowledgeArticle(article.id, { status });
      setArticles((currentArticles) =>
        currentArticles.map((currentArticle) => (currentArticle.id === article.id ? updatedArticle : currentArticle)),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update article");
    }
  }

  async function handleDeleteArticle(article: KnowledgeArticle) {
    setError(null);
    try {
      await deleteKnowledgeArticle(article.id);
      setArticles((currentArticles) => currentArticles.filter((currentArticle) => currentArticle.id !== article.id));
      setSelectedArticleId((currentId) => (currentId === article.id ? null : currentId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete article");
    }
  }

  return (
    <>
      <PageHeader title="Knowledge Base" description="Manage internal support articles that ResolveAI will search and cite." />
      {error ? (
        <div className="alert alert--error">
          <strong>Knowledge Base API unavailable</strong>
          <span>{error}</span>
        </div>
      ) : null}
      <section className="knowledge-toolbar">
        <input
          placeholder="Search articles..."
          disabled={isLoading}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select disabled={isLoading} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </section>
      <div className="knowledge-workspace">
        <section className="card-grid knowledge-card-grid">
          {isLoading ? (
            <div className="loading-stack" aria-label="Loading articles">
              <span />
              <span />
              <span />
            </div>
          ) : null}
          {filteredArticles.map((article) => (
            <button
              className={`article-card article-card--button ${
                article.id === selectedArticle?.id ? "article-card--active" : ""
              }`}
              key={article.id}
              onClick={() => setSelectedArticleId(article.id)}
              type="button"
            >
              <div className="article-card-heading">
                <strong>{article.title}</strong>
                <StatusBadge tone={statusTones[article.status]}>{statusLabels[article.status]}</StatusBadge>
              </div>
              <span>{article.category}</span>
              <p>{article.summary}</p>
            </button>
          ))}
          {!isLoading && filteredArticles.length === 0 ? <p className="empty-state">No articles match this view.</p> : null}
        </section>

        <aside className="panel knowledge-detail-panel">
          {selectedArticle ? (
            <>
              <div className="panel-header">
                <h2>{selectedArticle.title}</h2>
                <StatusBadge tone={statusTones[selectedArticle.status]}>{statusLabels[selectedArticle.status]}</StatusBadge>
              </div>
              <dl className="ticket-detail-list">
                <div>
                  <dt>Category</dt>
                  <dd>{selectedArticle.category}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(selectedArticle.updated_at).toLocaleString()}</dd>
                </div>
                <div className="detail-wide">
                  <dt>Source URL</dt>
                  <dd>{selectedArticle.source_url ?? "Not provided"}</dd>
                </div>
              </dl>
              <p className="article-summary">{selectedArticle.summary}</p>
              <div className="article-body">{selectedArticle.body}</div>
              <label className="field-group">
                Status
                <select
                  value={selectedArticle.status}
                  disabled={isSaving}
                  onChange={(event) => handleStatusChange(selectedArticle, event.target.value as ArticleStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="secondary-button danger-button"
                disabled={isSaving}
                onClick={() => handleDeleteArticle(selectedArticle)}
                type="button"
              >
                Delete article
              </button>
            </>
          ) : (
            <p className="empty-state">Select an article to review details.</p>
          )}
        </aside>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Create article</h2>
        </div>
        <form className="article-form" onSubmit={handleCreateArticle}>
          <label className="field-group">
            Title
            <input
              minLength={3}
              required
              disabled={isSaving}
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field-group">
            Category
            <input
              minLength={2}
              required
              disabled={isSaving}
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
            />
          </label>
          <label className="field-group">
            Status
            <select
              value={formState.status}
              disabled={isSaving}
              onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ArticleStatus }))}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            Source URL
            <input
              disabled={isSaving}
              value={formState.source_url}
              onChange={(event) => setFormState((current) => ({ ...current, source_url: event.target.value }))}
            />
          </label>
          <label className="field-group field-group--wide">
            Summary
            <textarea
              minLength={5}
              required
              disabled={isSaving}
              value={formState.summary}
              onChange={(event) => setFormState((current) => ({ ...current, summary: event.target.value }))}
            />
          </label>
          <label className="field-group field-group--wide">
            Body
            <textarea
              minLength={10}
              required
              disabled={isSaving}
              value={formState.body}
              onChange={(event) => setFormState((current) => ({ ...current, body: event.target.value }))}
            />
          </label>
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Creating..." : "Create article"}
          </button>
        </form>
      </section>
    </>
  );
}
