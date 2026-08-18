import { FormEvent, useEffect, useMemo, useState } from "react";
import { addMessage, createConversation, getConversation, listConversations } from "../api/conversations";
import type { Conversation, ConversationSummary } from "../api/conversations";
import { PageHeader } from "../components/PageHeader";

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [newTitle, setNewTitle] = useState("New IT support request");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSummary = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversation?.id),
    [activeConversation?.id, conversations],
  );

  useEffect(() => {
    let isMounted = true;

    listConversations()
      .then(async (data) => {
        if (!isMounted) {
          return;
        }

        setConversations(data);
        if (data[0]) {
          const conversation = await getConversation(data[0].id);
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

  async function refreshConversationList(selectedConversation: Conversation) {
    const summaries = await listConversations();
    setConversations(summaries);
    setActiveConversation(selectedConversation);
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
      {error ? <div className="alert alert--error">{error}</div> : null}
      <section className="chat-workspace">
        <aside className="conversation-panel">
          <div className="panel-header">
            <h2>Conversations</h2>
            <span>{isLoading ? "Loading..." : `${conversations.length} total`}</span>
          </div>
          <form className="conversation-form" onSubmit={handleStartConversation}>
            <input
              aria-label="Conversation title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <button className="secondary-button" disabled={isSending} type="submit">
              Start
            </button>
          </form>
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                className={`conversation-item ${
                  conversation.id === activeConversation?.id ? "conversation-item--active" : ""
                }`}
                key={conversation.id}
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
              {message.source_type ? (
                <small>
                  Source placeholder: {message.source_type}
                  {message.source_id ? ` / ${message.source_id}` : ""}
                </small>
              ) : null}
            </div>
          ))}
          {activeConversation && activeConversation.messages.length === 0 ? (
            <p className="empty-state">No messages yet.</p>
          ) : null}
        </div>
        <aside className="source-panel">
          <h2>Source placeholders</h2>
          <div className="source-item">
            <strong>VPN credential reset guide</strong>
            <span>Knowledge Base - Networking</span>
          </div>
          <div className="source-item">
            <strong>Identity password sync FAQ</strong>
            <span>Knowledge Base - IAM</span>
          </div>
        </aside>
      </section>
      <form className="composer" onSubmit={activeConversation ? handleSendMessage : handleStartConversation}>
        <input
          placeholder="Ask ResolveAI about an IT issue..."
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
