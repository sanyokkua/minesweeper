import type { PropsWithChildren } from 'react'
export function SettingRow({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description?: string }>) {
    return (
        <div className="setting-row">
            <div>
                <strong>{title}</strong>
                {description ? <p className="muted">{description}</p> : null}
            </div>
            <div>{children}</div>
        </div>
    )
}
