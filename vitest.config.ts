import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// e2e/ holds the Playwright specs, run by `npm run test:e2e`, never by Vitest
const exclude = [...configDefaults.exclude, 'e2e/**']

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        globals: false,
        // Two projects so each level can run alone: npm run test:unit / npm run test:int
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['**/*.test.{ts,tsx}'],
                    exclude: [...exclude, '**/*.int.test.{ts,tsx}'],
                },
            },
            {
                extends: true,
                test: {name: 'int', include: ['**/*.int.test.{ts,tsx}'], exclude},
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})
