import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolveBuildInfo } from './scripts/build-info.mjs'

export default defineConfig({
    base: '/minesweeper/',
    define: {
        __APP_BUILD__: JSON.stringify(resolveBuildInfo(process.env, new Date())),
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
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2,ttf}'],
            },
        }),
    ],
})
