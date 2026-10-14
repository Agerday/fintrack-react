'use client';

import { useEffect, useEffectEvent, useState } from 'react';

// Reconnection delays grow 1s, 2s, 4s, 8s... up to this cap
const RECONNECT_MAX_DELAY_MS = 10_000;

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

type UseWebSocketOptions = {
    // Raw text frame: each caller validates it with its own schema (see parseEvent)
    onMessage: (data: string) => void;
    // Called when the socket opens again after a drop. The server keeps no history,
    // so this is where a caller catches up on what it missed (refetch, reset...)
    onReconnect?: () => void;
};

// Keeps a WebSocket connection open while the component is mounted, reconnecting with an
// exponential backoff. Angular equivalent: webSocket() from rxjs/webSocket + retry({ delay })
// + takeUntilDestroyed(). The callbacks are effect events: callers pass inline functions
// and only a new url opens a new connection
export function useWebSocket(url: string, { onMessage, onReconnect }: UseWebSocketOptions) {
    const [status, setStatus] = useState<ConnectionStatus>('connecting');
    const handleMessage = useEffectEvent(onMessage);
    const handleReconnect = useEffectEvent(() => onReconnect?.());

    useEffect(() => {
        // Mutable state local to this effect run: each mount gets its own connection
        let socket: WebSocket;
        let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
        let attempts = 0;
        // Set by the cleanup, so a close we asked for doesn't trigger a reconnection
        let unmounted = false;

        function connect() {
            // `new WebSocket` starts the handshake: an HTTP request with `Upgrade: websocket`,
            // the server answers 101 Switching Protocols and the TCP connection stays open.
            // Visible in Chrome DevTools > Network > WS > Messages
            socket = new WebSocket(url);

            // Fires once the handshake succeeded, the socket can now receive (and send) messages
            socket.onopen = () => {
                setStatus('open');
                if (attempts > 0) handleReconnect();
                attempts = 0;
            };

            // WebSocket only carries text or binary, so structured data travels as JSON
            socket.onmessage = (event: MessageEvent<string>) => handleMessage(event.data);

            // Fires on every disconnection: server stopped, network lost, or our own close().
            // A failed handshake fires onerror then onclose, so reconnecting here covers both
            socket.onclose = () => {
                if (unmounted) return;
                setStatus('closed');

                // Exponential backoff: don't hammer a server that is down or restarting
                const delay = Math.min(1000 * 2 ** attempts, RECONNECT_MAX_DELAY_MS);
                attempts++;
                reconnectTimer = setTimeout(connect, delay);
            };
        }

        connect();

        // Cleanup, like ngOnDestroy: without it every mount would leak an open connection
        return () => {
            unmounted = true;
            clearTimeout(reconnectTimer);
            socket.onmessage = null;

            // In dev, React Strict Mode mounts -> unmounts -> remounts right away, so the first
            // socket is still handshaking here. Closing it now logs "closed before the connection
            // is established": let the handshake finish, then close it
            if (socket.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => socket.close();
            } else {
                socket.close();
            }
        };
    }, [url]);

    return status;
}
