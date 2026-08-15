export function StatDisplay({
    label,
    value,
    tone = 'flags',
}: {
    label: string
    value: string | number
    tone?: 'flags' | 'timer'
}) {
    const displayValue = typeof value === 'number' ? String(value).padStart(3, '0') : value
    return (
        <div className={`stat-display stat-display--lcd stat-display--${tone}`}>
            <span className="stat-display__label">{label}</span>
            <strong className="stat-display__value">{displayValue}</strong>
        </div>
    )
}
