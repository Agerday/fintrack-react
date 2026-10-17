import type { FullConfig } from '@playwright/test';

// The Next dev server compiles each route on its first request. When every parallel worker
// hits a cold server at once, those compilations pile up and tests time out, so each route
// the tests use is requested once, one after the other, before any test starts.
// Runs after `webServer` is up (Playwright starts the servers first)
const routes = [
    '/',
    '/invoices',
    // Any id compiles the dynamic route, a 404 is fine
    '/invoices/INV-WARMUP',
    '/clients',
    '/account',
    '/trading',
    '/profile',
    '/api/invoices',
    '/api/invoices/INV-WARMUP',
    '/api/clients',
    '/api/account',
    '/api/trading/positions',
    '/api/profile',
];

export default async function globalSetup(config: FullConfig) {
    const baseURL = config.projects[0]?.use.baseURL;
    if (!baseURL) throw new Error('globalSetup needs use.baseURL to warm up the dev server');

    for (const route of routes) {
        await fetch(new URL(route, baseURL));
    }
}
