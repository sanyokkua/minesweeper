import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
export function IconAction({
    label,
    children,
    ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>) {
    return (
        <button type="button" className="icon-action" aria-label={label} {...props}>
            {children}
        </button>
    )
}
