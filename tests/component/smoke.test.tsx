import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { App } from '../../src/App'
import { createAppStore } from '../../src/app/store'

describe('application shell', () => {
  it('renders the home start surface', () => {
    render(
      <Provider store={createAppStore()}>
        <App />
      </Provider>,
    )

    expect(screen.getByRole('heading', { name: /minesweeper/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument()
  })
})
