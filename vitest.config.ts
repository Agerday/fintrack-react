import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        globals: true,
        // tests/ holds the Playwright E2E specs, run by `npx playwright test`, not Vitest
        exclude: [...configDefaults.exclude, 'tests/**'],
        // no unit tests yet: don't fail the run until the first one is written
        passWithNoTests: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})