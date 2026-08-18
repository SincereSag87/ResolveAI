type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  tone?: "default" | "good" | "warn";
};

export function MetricCard({ label, value, trend, tone = "default" }: MetricCardProps) {
  return (
    <section className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </section>
  );
}
