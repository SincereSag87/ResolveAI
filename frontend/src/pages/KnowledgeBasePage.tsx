import { PageHeader } from "../components/PageHeader";

const articles = ["VPN credential reset guide", "Device encryption recovery", "New hire laptop setup", "Email phishing triage"];

export function KnowledgeBasePage() {
  return (
    <>
      <PageHeader title="Knowledge Base" description="Manage internal support articles that ResolveAI will search and cite." action="Add article" />
      <section className="card-grid">
        {articles.map((article) => (
          <article className="article-card" key={article}>
            <strong>{article}</strong>
            <span>Updated this month</span>
            <p>Operational guidance for service desk agents and employee self-service support.</p>
          </article>
        ))}
      </section>
    </>
  );
}
