import { ModalSheet } from './ModalSheet'
import { ActionButton } from './ActionButton'
import { useTranslate } from '../../i18n/useTranslate'
export function ConfirmSheet({
    open,
    message,
    onCancel,
    onConfirm,
}: {
    open: boolean
    message: string
    onCancel: () => void
    onConfirm: () => void
}) {
    const t = useTranslate()
    return (
        <ModalSheet
            open={open}
            title={t('confirm.title')}
            onClose={onCancel}
            closeLabel={t('confirm.close')}
            actions={
                <>
                    <ActionButton variant="outline" onClick={onCancel}>
                        {t('confirm.cancel')}
                    </ActionButton>
                    <ActionButton variant="danger" onClick={onConfirm}>
                        {t('confirm.confirm')}
                    </ActionButton>
                </>
            }
            className="confirm-sheet"
        >
            <p>{message}</p>
        </ModalSheet>
    )
}
