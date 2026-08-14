export function StatDisplay({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-display">
      <span className="stat-display__label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
