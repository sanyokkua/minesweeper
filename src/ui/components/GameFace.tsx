export function GameFace({
    status,
    onReset,
    label,
}: {
    status: 'ready' | 'playing' | 'won' | 'lost'
    onReset: () => void
    label: string
}) {
    const face = status === 'won' ? '😎' : status === 'lost' ? '😵' : status === 'playing' ? '😮' : '🙂'
    return (
        <button type="button" className={`game-face game-face--${status}`} aria-label={label} onClick={onReset}>
            {face}
        </button>
    )
}
