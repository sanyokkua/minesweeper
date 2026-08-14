import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { HelpSheet } from '../../src/ui/components/HelpSheet'
describe('help and recovery', () => {
  it('shows localized rules and a close control', () => {
    render(
      <Provider store={createAppStore()}>
        <HelpSheet open onClose={vi.fn()} />
      </Provider>,
    )
    expect(screen.getByRole('dialog', { name: /how to play/i })).toHaveTextContent(
      /reveal unopened/i,
    )
    expect(screen.getByRole('button', { name: /close help/i })).toBeInTheDocument()
  })
})
