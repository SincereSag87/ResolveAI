import { FormEvent, useEffect, useMemo, useState } from "react";
import { addMessage, createConversation, getConversation, listConversations } from "../api/conversations";
import type { Conversation, ConversationSummary } from "../api/conversations";
import { listKnowledgeArticles, searchKnowledgeArticles } from "../api/knowledgeArticles";
import type { KnowledgeArticle } from "../api/knowledgeArticles";
import { PageHeader } from "../components/PageHeader";

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [newTitle, setNewTitle] = useState("New IT support request");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<KnowledgeArticle[]>([]);

  const activeSummary = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversation?.id),
    [activeConversation?.id, conversations],
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([listConversations(), listKnowledgeArticles()])
      .then(async (data) => {
        if (!isMounted) {
          return;
        }

        const [conversationData, articleData] = data;
        setConversations(conversationData);
        setArticles(articleData);
        if (conversationData[0]) {
          const conversation = await getConversation(conversationData[0].id);
          if (isMounted) {
            setActiveConversation(conversation);
          }
        }
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

  useEffect(() => {
    let isMounted = true;
    const latestEmployeeMessage = [...(activeConversation?.messages ?? [])]
      .reverse()
      .find((message) => message.role === "employee");

    if (!latestEmployeeMessage) {
      setRelatedArticles([]);
      return;
    }

    searchKnowledgeArticles(latestEmployeeMessage.content)
      .then((matches) => {
        if (isMounted) {
          setRelatedArticles(matches);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRelatedArticles([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversation]);

  async function refreshConversationList(selectedConversation: Conversation) {
    const [summaries, articleData] = await Promise.all([listConversations(), listKnowledgeArticles()]);
    setConversations(summaries);
    setArticles(articleData);
    setActiveConversation(selectedConversation);
  }

  function getCitationArticles(sourceType: string | null, sourceId: string | null) {
    if (sourceType !== "knowledge_article" || !sourceId) {
      return [];
    }

    const citationIds = sourceId
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id));

    return citationIds
      .map((id) => articles.find((article) => article.id === id))
      .filter((article): article is KnowledgeArticle => Boolean(article));
  }

  async function handleSelectConversation(conversationId: number) {
    setError(null);
    try {
      setActiveConversation(await getConversation(conversationId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load conversation");
    }
  }

  async function handleStartConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const createdConversation = await createConversation({
        title: newTitle,
        initial_message: draft || null,
      });
      await refreshConversationList(createdConversation);
      setDraft("");
      setNewTitle("New IT support request");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to start conversation");
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation || !draft.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const updatedConversation = await addMessage(activeConversation.id, {
        role: "employee",
        content: draft,
      });
      await refreshConversationList(updatedConversation);
      setDraft("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="AI Support Chat"
        description="Troubleshoot employee issues, surface source-backed answers, and prepare escalations when needed."
      />
      {error ? (
        <div className="alert alert--error">
          <strong>Support chat API unavailable</strong>
          <span>{error}</span>
        </div>
      ) : null}
      <section className="chat-workspace">
        <aside className="conversation-panel">
          <div className="panel-header">
            <h2>Conversations</h2>
            <span>{isLoading ? "Loading..." : `${conversations.length} total`}</span>
          </div>
          <form className="conversation-form" onSubmit={handleStartConversation}>
            <input
              aria-label="Conversation title"
              disabled={isSending}
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <button className="secondary-button" disabled={isSending} type="submit">
              Start
            </button>
          </form>
          <div className="conversation-list">
            {isLoading ? (
              <div className="loading-stack" aria-label="Loading conversations">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {conversations.map((conversation) => (
              <button
                className={`conversation-item ${
                  conversation.id === activeConversation?.id ? "conversation-item--active" : ""
                }`}
                key={conversation.id}
                disabled={isSending}
                onClick={() => handleSelectConversation(conversation.id)}
                type="button"
              >
                <strong>{conversation.title}</strong>
                <span>{conversation.message_count} messages</span>
              </button>
            ))}
            {!isLoading && conversations.length === 0 ? (
              <p className="empty-state">Start a conversation to begin troubleshooting.</p>
            ) : null}
          </div>
        </aside>
        <div className="chat-thread">
          <div className="chat-thread-header">
            <strong>{activeConversation?.title ?? "No conversation selected"}</strong>
            {activeSummary ? <span>{activeSummary.status}</span> : null}
          </div>
          {activeConversation?.messages.map((message) => (
            <div className={`chat-message chat-message--${message.role}`} key={message.id}>
              <p>{message.content}</p>
              {getCitationArticles(message.source_type, message.source_id).length > 0 ? (
                <div className="citation-list">
                  {getCitationArticles(message.source_type, message.source_id).map((article) => (
                    <a href={`/knowledge-base?articleId=${article.id}`} key={article.id}>
                      {article.title}
                    </a>
                  ))}
                </div>
              ) : message.source_type ? (
                <small>{message.source_type === "mock" ? "No KB citation matched" : message.source_type}</small>
              ) : null}
            </div>
          ))}
          {activeConversation && activeConversation.messages.length === 0 ? (
            <p className="empty-state">No messages yet.</p>
          ) : null}
        </div>
        <aside className="source-panel">
          <h2>Related articles</h2>
          {relatedArticles.map((article) => (
            <a className="source-item source-item--link" href={`/knowledge-base?articleId=${article.id}`} key={article.id}>
              <strong>{article.title}</strong>
              <span>{article.category}</span>
            </a>
          ))}
          {relatedArticles.length === 0 ? <p className="empty-state">No related articles found yet.</p> : null}
        </aside>
      </section>
      <form className="composer" onSubmit={activeConversation ? handleSendMessage : handleStartConversation}>
        <input
          placeholder="Ask ResolveAI about an IT issue..."
          disabled={isSending}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="primary-button" disabled={isSending || !draft.trim()} type="submit">
          {isSending ? "Sending..." : activeConversation ? "Send" : "Start chat"}
        </button>
      </form>
    </>
  );
}
