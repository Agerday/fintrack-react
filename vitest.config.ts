import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        // Default environment: jsdom, a fake browser DOM in Node. Files that test server code
        // (Route Handlers) switch to plain Node with a `// @vitest-environment node` comment
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        globals: true,
        // tests/ holds the Playwright E2E specs, run by `npx playwright test`, not Vitest
        exclude: [...configDefaults.exclude, 'tests/**'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})
