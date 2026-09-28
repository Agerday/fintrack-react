import type { z } from 'zod';

// Next Route Handlers can't keep a socket open, so real-time goes through a standalone
// WebSocket server (server/ws.ts, `npm run ws`): the API publishes, the socket server broadcasts
export const WS_PORT = 3001;
export const WS_URL = `ws://localhost:${WS_PORT}`;
const WS_PUBLISH_URL = `http://localhost:${WS_PORT}/publish`;
// Publishing is best effort: never let a stuck socket server hold the API response
const PUBLISH_TIMEOUT_MS = 1000;

// One id per browser tab (module evaluated once per page load). apiClient sends it on every
// request and the API copies it into the event, so a tab can skip the echo of its own mutations:
// their onSuccess already refreshed the cache
export const TAB_ID = crypto.randomUUID();
export const TAB_ID_HEADER = 'X-Tab-Id';

// Called from Route Handlers after a mutation. Never throws: if the socket server is down
// or too slow, the mutation still succeeds, clients just won't be notified in real time
export async function publishEvent<T extends object>(request: Request, event: T) {
    const sourceId = request.headers.get(TAB_ID_HEADER) ?? undefined;
    try {
        await fetch(WS_PUBLISH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...event, sourceId }),
            signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
        });
    } catch (error) {
        console.warn('WebSocket server unreachable, event not published:', error);
    }
}

// Client-side counterpart of parseBody: a socket message is untrusted text, so it goes through
// JSON.parse and the Zod schema. Returns null instead of throwing, a bad message is just skipped
export function parseEvent<T extends z.ZodType>(data: string, schema: T): z.infer<T> | null {
    try {
        const result = schema.safeParse(JSON.parse(data));
        return result.success ? result.data : null;
    } catch {
        return null;
    }
}
