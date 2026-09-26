// Next Route Handlers can't keep a socket open, so real-time goes through a standalone
// WebSocket server (server/ws.ts, `npm run ws`): the API publishes, the socket server broadcasts
export const WS_PORT = 3001;
export const WS_URL = `ws://localhost:${WS_PORT}`;
const WS_PUBLISH_URL = `http://localhost:${WS_PORT}/publish`;

// Called from Route Handlers after a mutation. Never throws: if the socket server is down,
// the mutation still succeeds, clients just won't be notified in real time
export async function publishEvent<T>(event: T) {
    try {
        await fetch(WS_PUBLISH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
    } catch (error) {
        console.warn('WebSocket server unreachable, event not published:', error);
    }
}
