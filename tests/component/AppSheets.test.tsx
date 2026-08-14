import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { AppSheets } from '../../src/ui/components/AppSheets'
import { openSheet } from '../../src/app/appSlice'
describe('application sheets', () => {
  it('updates settings content from the store', () => {
    const store = createAppStore()
    store.dispatch(openSheet('settings'))
    render(
      <Provider store={store}>
        <AppSheets />
      </Provider>,
    )
    expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
  })
})
