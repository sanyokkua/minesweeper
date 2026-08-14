import { ModalSheet } from './ModalSheet'
import { useTranslate } from '../../i18n/useTranslate'
export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslate()
  return (
    <ModalSheet open={open} title={t('help.title')} onClose={onClose} closeLabel={t('help.close')}>
      <p>{t('help.reveal')}</p>
      <p>{t('help.flags')}</p>
      <p>{t('help.numbers')}</p>
      <p>{t('help.outcomes')}</p>
    </ModalSheet>
  )
}
