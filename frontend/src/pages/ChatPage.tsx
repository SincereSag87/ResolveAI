import { PageHeader } from "../components/PageHeader";

const messages = [
  { from: "employee", text: "I cannot connect to the VPN after changing my password." },
  {
    from: "agent",
    text: "I found two likely fixes in the knowledge base. Start by clearing saved VPN credentials, then retry with your current identity password.",
  },
];

export function ChatPage() {
  return (
    <>
      <PageHeader
        title="AI Support Chat"
        description="Troubleshoot employee issues, surface source-backed answers, and prepare escalations when needed."
      />
      <section className="chat-workspace">
        <div className="chat-thread">
          {messages.map((message) => (
            <div className={`chat-message chat-message--${message.from}`} key={message.text}>
              {message.text}
            </div>
          ))}
        </div>
        <aside className="source-panel">
          <h2>Suggested sources</h2>
          <div className="source-item">
            <strong>VPN credential reset guide</strong>
            <span>Knowledge Base · Networking</span>
          </div>
          <div className="source-item">
            <strong>Identity password sync FAQ</strong>
            <span>Knowledge Base · IAM</span>
          </div>
        </aside>
      </section>
      <div className="composer">
        <input placeholder="Ask ResolveAI about an IT issue..." />
        <button className="primary-button">Send</button>
      </div>
    </>
  );
}
