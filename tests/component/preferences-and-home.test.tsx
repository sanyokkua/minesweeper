import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '../../src/app/store'
import { HomeScreen } from '../../src/ui/screens/HomeScreen'
describe('home preferences', () => {
  it('shows retained selection and accessible settings actions', () => {
    render(
      <Provider store={createAppStore()}>
        <HomeScreen />
      </Provider>,
    )
    expect(screen.getByRole('button', { name: /beginner/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })
})
