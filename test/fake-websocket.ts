import { vi } from 'vitest';

// Hand-written instead of MSW's WebSocket support: tests drive every step of the socket
// lifecycle (open, server close, reconnect) together with fake timers.
// Install it with vi.stubGlobal('WebSocket', FakeWebSocket) and reset `instances` in beforeEach
export class FakeWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 3;
    static instances: FakeWebSocket[] = [];

    readyState = FakeWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onclose: (() => void) | null = null;
    close = vi.fn(() => this.serverClose());

    constructor(public url: string) {
        FakeWebSocket.instances.push(this);
    }

    static latest() {
        return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    }

    open() {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.();
    }

    receive(message: unknown) {
        this.onmessage?.({ data: typeof message === 'string' ? message : JSON.stringify(message) });
    }

    serverClose() {
        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.();
    }
}
