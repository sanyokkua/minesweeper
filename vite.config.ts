import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    base: '/minesweeper/',
    define: {
        __APP_BUILD_TIMESTAMP__: JSON.stringify(process.env.BUILD_TIMESTAMP ?? 'dev version'),
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            injectRegister: false,
            includeAssets: ['icon-192.png', 'icon-512.png'],
            manifest: false,
            workbox: {
                navigateFallback: '/minesweeper/index.html',
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
            },
        }),
    ],
})
