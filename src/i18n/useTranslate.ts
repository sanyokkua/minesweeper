import { useCallback } from 'react'
import { useAppSelector } from '../app/hooks'
import { translate } from './translate'
import type { MessageKey } from './catalog'

export function useTranslate() {
    const locale = useAppSelector((state) => state.preferences.locale)
    return useCallback(
        (key: MessageKey, variables?: Record<string, string | number>) => translate(locale, key, variables),
        [locale],
    )
}
