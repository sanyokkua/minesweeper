import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'filled' | 'tonal' | 'outline' | 'text' | 'danger'
}
export function ActionButton({ children, variant = 'filled', className = '', ...props }: Props) {
  return (
    <button className={`action-button action-button--${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
