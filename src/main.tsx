import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { App } from './App'
import { appStore } from './app/store'
import { initializeInstallGateway } from './pwa/installGateway'

initializeInstallGateway()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={appStore}>
            <App />
        </Provider>
    </StrictMode>,
)
