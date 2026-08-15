import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost/minesweeper/',
            },
        },
        setupFiles: ['./tests/setup.ts'],
        globals: true,
        css: true,
        include: ['tests/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['tests/e2e/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: { lines: 70, functions: 65, branches: 60, statements: 70 },
            exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
        },
    },
})
