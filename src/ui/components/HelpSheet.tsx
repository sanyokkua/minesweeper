import { ModalSheet } from './ModalSheet'
import { useTranslate } from '../../i18n/useTranslate'
import { useAppSelector } from '../../app/hooks'
export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslate()
  const inputMode = useAppSelector((state) => state.preferences.inputMode)
  const revealFirst = inputMode === 'reveal-first'
  return (
    <ModalSheet
      open={open}
      title={t('help.title')}
      onClose={onClose}
      closeLabel={t('help.close')}
      className="help-sheet"
    >
      <div className="help-rule">
        <span className="help-rule__icon" aria-hidden="true">
          1
        </span>
        <div>
          <strong>{t('help.revealHeading')}</strong>
          <p>{t('help.reveal')}</p>
        </div>
      </div>
      <div className="help-rule">
        <span className="help-rule__icon" aria-hidden="true">
          ⚑
        </span>
        <div>
          <strong>{t('help.flagsHeading')}</strong>
          <p>{t('help.flags')}</p>
        </div>
      </div>
      <div className="help-rule">
        <span className="help-rule__icon" aria-hidden="true">
          3
        </span>
        <div>
          <strong>{t('help.numbersHeading')}</strong>
          <p>{t('help.numbers')}</p>
        </div>
      </div>
      <div className="help-rule">
        <span className="help-rule__icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong>{t('help.outcomesHeading')}</strong>
          <p>{t('help.outcomes')}</p>
        </div>
      </div>
      <div className="help-mapping">
        <strong>{t('help.mappingHeading')}</strong>
        <p>{revealFirst ? t('help.mappingReveal') : t('help.mappingFlag')}</p>
        <p>{t('help.pointer')}</p>
        <p>{t('help.touch')}</p>
        <p>{t('help.keyboard')}</p>
      </div>
    </ModalSheet>
  )
}
