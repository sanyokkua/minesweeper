import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButton } from '../../src/ui/components/ActionButton'
import { ModalSheet } from '../../src/ui/components/ModalSheet'
import { SelectableOption } from '../../src/ui/components/SelectableOption'

describe('accessible UI primitives', () => {
  it('exposes button, selection, disabled and modal semantics', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <>
        <ActionButton onClick={onClick}>Play</ActionButton>
        <SelectableOption selected onSelect={onClick}>
          Beginner
        </SelectableOption>
        <ModalSheet title="Settings" onClose={onClick} open>
          Settings content
        </ModalSheet>
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Beginner' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })
})
