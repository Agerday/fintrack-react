// Standalone WebSocket server, run with `npm run ws` next to `npm run dev`.
// It lives outside Next because Route Handlers close the connection once the response is sent.
//
// Flow:  browser --PATCH--> Next API --POST /publish--> this server --ws message--> every browser
//
// It holds no data: it only relays events. The Next API stays the single source of truth.
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { WS_PORT } from '@/lib/realtime';

// One plain HTTP server serves both sides on the same port:
// - regular HTTP requests: POST /publish, called by the Next Route Handlers
// - HTTP requests with `Upgrade: websocket`: handed to the WebSocketServer below
// Local training only: /publish has no auth, anyone on the machine could push events
const server = createServer((request, response) => {
    if (request.method !== 'POST' || request.url !== '/publish') {
        response.writeHead(404).end();
        return;
    }

    // Node streams the request body in chunks, we concatenate them until 'end'
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
        // The body is already JSON: we forward it as is, no need to parse it
        broadcast(body);
        response.writeHead(204).end();
    });
});

// Attached to the HTTP server: `ws` answers the upgrade handshake (101 Switching Protocols)
// and then keeps each connection open. wss.clients is the set of currently connected sockets
const wss = new WebSocketServer({ server });

// "Broadcast" = send the same message to every connected client.
// A socket can be closing while we loop, so we only send to the OPEN ones
function broadcast(message: string) {
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    }
    console.log(`broadcast to ${wss.clients.size} client(s): ${message}`);
}

// One 'connection' event per browser tab (per mounted useInvoiceEvents, in fact).
// Open two tabs on /invoices and watch the counter go up
wss.on('connection', (socket) => {
    console.log(`client connected (${wss.clients.size} total)`);

    // Fires when the tab closes, navigates away (hook cleanup) or loses the network
    socket.on('close', () => console.log(`client disconnected (${wss.clients.size} total)`));
});

server.listen(WS_PORT, () =>
    console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`),
);
