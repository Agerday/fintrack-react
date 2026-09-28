// UNIT TEST of useInvoiceEvents with a hand-written fake WebSocket and fake timers.
//
// Why a fake instead of MSW here? We want full control over the socket lifecycle
// (open, message, server closes, reconnect) and over time (backoff delays), step by step.
// MSW's WebSocket support is used in the InvoiceTable integration test instead.
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useInvoiceEvents } from './hooks';
import { TAB_ID, WS_URL } from '@/lib/realtime';
import { createTestQueryClient } from '@/test-utils/render';

// Mimics the parts of the browser WebSocket the hook uses. The extra methods (open,
// receive, serverClose) let the test play the role of the server / network
class FakeWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 3;
    // Every socket the hook creates, so the test can grab the latest one
    static instances: FakeWebSocket[] = [];

    readyState = FakeWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onclose: (() => void) | null = null;
    // The browser fires onclose after close(), our own close() included
    close = vi.fn(() => this.serverClose());

    constructor(public url: string) {
        FakeWebSocket.instances.push(this);
    }

    open() {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.();
    }

    receive(message: unknown) {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        this.onmessage?.({ data });
    }

    serverClose() {
        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.();
    }
}

function latestSocket() {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
}

// Mounts the hook inside a QueryClientProvider and spies on invalidateQueries,
// the only side effect of the hook we care about
function setup() {
    const queryClient = createTestQueryClient();
    // mockResolvedValue: don't really refetch anything, just record the call
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { unmount } = renderHook(() => useInvoiceEvents(), { wrapper });
    return { invalidate, unmount };
}

describe('useInvoiceEvents', () => {
    beforeEach(() => {
        FakeWebSocket.instances = [];
        // stubGlobal swaps `WebSocket` for the whole test, the hook's `new WebSocket()`
        // creates a FakeWebSocket. unstubAllGlobals puts the original back
        vi.stubGlobal('WebSocket', FakeWebSocket);
        // Fake timers: setTimeout callbacks only run when the test advances the clock.
        // Angular analogy: fakeAsync() + tick()
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('opens a connection to the socket server on mount', () => {
        setup();

        expect(FakeWebSocket.instances).toHaveLength(1);
        expect(latestSocket().url).toBe(WS_URL);
    });

    it('refreshes the list and the detail when another tab updates an invoice', () => {
        const { invalidate } = setup();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.updated', id: 'INV-001', sourceId: 'other-tab' });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoice', 'INV-001'] });
    });

    it('only refreshes the list for a created invoice (no detail page to update yet)', () => {
        const { invalidate } = setup();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.created', id: 'INV-009' });

        expect(invalidate).toHaveBeenCalledOnce();
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
    });

    it('ignores the echo of a mutation made by this same tab', () => {
        const { invalidate } = setup();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.updated', id: 'INV-001', sourceId: TAB_ID });

        expect(invalidate).not.toHaveBeenCalled();
    });

    it('ignores (and logs) a message that is not a valid invoice event', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { invalidate } = setup();
        latestSocket().open();

        latestSocket().receive('not json');
        latestSocket().receive({ type: 'something.else', id: 1 });

        expect(invalidate).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(2);
    });

    it('reconnects with an exponential backoff when the connection drops', () => {
        setup();
        latestSocket().open();

        // 1st drop -> retry after 1s
        latestSocket().serverClose();
        vi.advanceTimersByTime(999);
        expect(FakeWebSocket.instances).toHaveLength(1);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(2);

        // The retry fails too (server still down) -> next retry after 2s, not 1s
        latestSocket().serverClose();
        vi.advanceTimersByTime(1999);
        expect(FakeWebSocket.instances).toHaveLength(2);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(3);
    });

    it('refetches after a REconnection to catch up on the events missed while offline', () => {
        const { invalidate } = setup();
        latestSocket().open();
        // A first connection doesn't refetch: the query just loaded its data anyway
        expect(invalidate).not.toHaveBeenCalled();

        latestSocket().serverClose();
        vi.advanceTimersByTime(1000);
        latestSocket().open();

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
    });

    it('closes the socket on unmount and does not reconnect', () => {
        const { unmount } = setup();
        const socket = latestSocket();
        socket.open();

        unmount();
        // Even after a long time, no new connection
        vi.advanceTimersByTime(60_000);

        expect(socket.close).toHaveBeenCalledOnce();
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it('waits for the handshake before closing a socket that is still connecting', () => {
        // The React Strict Mode case: mount -> unmount before the connection is open.
        // Closing right away logs a browser warning, so the hook closes it once opened
        const { unmount } = setup();
        const socket = latestSocket();

        unmount();
        expect(socket.close).not.toHaveBeenCalled();

        socket.open();
        expect(socket.close).toHaveBeenCalledOnce();
    });
});
