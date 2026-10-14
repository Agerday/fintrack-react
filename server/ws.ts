// Standalone WebSocket server, run with `npm run ws` next to `npm run dev`.
// It lives outside Next because Route Handlers close the connection once the response is sent.
//
// Two jobs, one port:
// - Invoice events (ws://localhost:3001):
//   browser --PATCH--> Next API --POST /publish--> this server --ws message--> every browser
//   It holds no invoice data: it only relays events. The Next API stays the source of truth.
// - Market simulator (ws://localhost:3001/market): it owns the live prices, moves each one
//   on its own random schedule and pushes every tick. The Next API reads them through
//   GET /prices to fill orders at the market price, and gets every tick (POST
//   /api/trading/ticks) to fill the stop losses and take profits.
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { assets } from '@/features/trading/data';
import { nextPrice, nextTickDelay } from '@/features/trading/rules';
import type { PriceTick } from '@/features/trading/types';
import { TRADING_TICKS_URL, WS_PORT } from '@/lib/realtime';

const TICK_REPORT_TIMEOUT_MS = 2000;

// The market opens when the server starts: every restart is a fresh trading day
const prices = new Map<string, PriceTick>(
    assets.map(({ symbol, initialPrice }) => [
        symbol,
        {
            type: 'price',
            symbol,
            price: initialPrice,
            open: initialPrice,
            time: new Date().toISOString(),
        },
    ]),
);

// One plain HTTP server serves both sides on the same port:
// - regular HTTP requests: POST /publish (Next Route Handlers), GET /prices (order route)
// - HTTP requests with `Upgrade: websocket`: handed to a WebSocketServer, see 'upgrade' below
// Local training only: /publish has no auth, anyone on the machine could push events
const server = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/prices') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify([...prices.values()]));
        return;
    }

    // /publish -> invoice listeners, /publish/market -> trading pages (e.g. a stop loss filled)
    const target =
        request.url === '/publish'
            ? eventsWss
            : request.url === '/publish/market'
              ? marketWss
              : null;
    if (request.method !== 'POST' || !target) {
        response.writeHead(404).end();
        return;
    }

    // Node streams the request body in chunks, we concatenate them until 'end'
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
        // The body is already JSON: we forward it as is, no need to parse it
        broadcast(target, body);
        console.log(`event to ${target.clients.size} client(s): ${body}`);
        response.writeHead(204).end();
    });
});

// noServer: we route the upgrade handshake ourselves, by path, to one of the two servers.
// Each one has its own `clients` set, so a broadcast only reaches the right audience
const eventsWss = new WebSocketServer({ noServer: true });
const marketWss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const target = request.url === '/market' ? marketWss : eventsWss;
    // `ws` answers the handshake (101 Switching Protocols) and keeps the connection open
    target.handleUpgrade(request, socket, head, (client) => target.emit('connection', client));
});

// "Broadcast" = send the same message to every connected client.
// A socket can be closing while we loop, so we only send to the OPEN ones
function broadcast(wss: WebSocketServer, message: string) {
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    }
}

// One 'connection' event per mounted useInvoiceEvents. Open two tabs on /invoices
// and watch the counter go up
eventsWss.on('connection', (socket) => {
    console.log(`events: client connected (${eventsWss.clients.size} total)`);
    // Fires when the tab closes, navigates away (hook cleanup) or loses the network
    socket.on('close', () =>
        console.log(`events: client disconnected (${eventsWss.clients.size} total)`),
    );
});

marketWss.on('connection', (socket) => {
    console.log(`market: client connected (${marketWss.clients.size} total)`);
    // A newcomer gets every current price right away instead of waiting for the next ticks
    for (const tick of prices.values()) socket.send(JSON.stringify(tick));
    socket.on('close', () =>
        console.log(`market: client disconnected (${marketWss.clients.size} total)`),
    );
});

// The Next API owns the portfolio: each tick goes there so it can fill the stop losses and
// take profits it crossed, even when no browser is open. Best effort, like publishEvent: if
// Next is down (or still compiling), that tick is skipped and the next one will catch up
let apiReachable = true;
async function reportTick(tick: PriceTick) {
    try {
        await fetch(TRADING_TICKS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tick),
            signal: AbortSignal.timeout(TICK_REPORT_TIMEOUT_MS),
        });
        if (!apiReachable) console.log('Next API reachable again, pending orders are watched');
        apiReachable = true;
    } catch {
        // Logged once per outage, not on every tick
        if (apiReachable)
            console.warn(`Next API unreachable on ${TRADING_TICKS_URL}, pending orders paused`);
        apiReachable = false;
    }
}

// Each asset ticks on its own random schedule: a setTimeout that re-arms itself with a new
// random delay (a setInterval would tick at a fixed pace)
function scheduleTick(symbol: string, volatility: number) {
    setTimeout(() => {
        const current = prices.get(symbol);
        if (current) {
            const tick: PriceTick = {
                ...current,
                price: nextPrice(current.price, volatility),
                time: new Date().toISOString(),
            };
            prices.set(symbol, tick);
            broadcast(marketWss, JSON.stringify(tick));
            void reportTick(tick);
        }
        scheduleTick(symbol, volatility);
    }, nextTickDelay());
}

for (const { symbol, volatility } of assets) scheduleTick(symbol, volatility);

server.listen(WS_PORT, () =>
    console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`),
);
