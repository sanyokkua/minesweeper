import type { Appearance } from '../features/persistence/recordCodec'

export type ResolvedTheme = 'light' | 'dark'
export function resolveTheme(appearance: Appearance, prefersDark = false): ResolvedTheme {
  return appearance === 'system' ? (prefersDark ? 'dark' : 'light') : appearance
}
export function applyTheme(
  appearance: Appearance,
  root: HTMLElement = document.documentElement,
): ResolvedTheme {
  const media =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null
  const theme = resolveTheme(appearance, media?.matches ?? false)
  root.dataset.theme = theme
  return theme
}
export function watchSystemTheme(
  appearance: Appearance,
  onTheme: (theme: ResolvedTheme) => void,
): () => void {
  if (appearance !== 'system' || typeof window === 'undefined' || !window.matchMedia)
    return () => undefined
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = (event: MediaQueryListEvent) => onTheme(resolveTheme('system', event.matches))
  media.addEventListener?.('change', listener)
  return () => media.removeEventListener?.('change', listener)
}
