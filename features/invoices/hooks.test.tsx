import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInvoiceEvents } from './hooks';
import { TAB_ID } from '@/lib/realtime';
import { renderHookWithClient } from '@/test/render';

// Hand-written instead of MSW's WebSocket support: these tests drive every step of the
// socket lifecycle (open, server close, reconnect) together with fake timers
class FakeWebSocket {
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

function latestSocket() {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
}

function renderInvoiceEvents() {
    const result = renderHookWithClient(() => useInvoiceEvents());
    const invalidate = vi.spyOn(result.queryClient, 'invalidateQueries').mockResolvedValue();
    return { ...result, invalidate };
}

describe('useInvoiceEvents', () => {
    beforeEach(() => {
        FakeWebSocket.instances = [];
        vi.stubGlobal('WebSocket', FakeWebSocket);
        vi.useFakeTimers();
    });

    it('refreshes the list and the detail when another tab updates an invoice', () => {
        const { invalidate } = renderInvoiceEvents();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.updated', id: 'INV-001', sourceId: 'other-tab' });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoice', 'INV-001'] });
    });

    it('only refreshes the list when an invoice is created', () => {
        const { invalidate } = renderInvoiceEvents();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.created', id: 'INV-009' });

        expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: ['invoices'] });
    });

    it('ignores the echo of a change made by this same tab', () => {
        const { invalidate } = renderInvoiceEvents();
        latestSocket().open();

        latestSocket().receive({ type: 'invoice.updated', id: 'INV-001', sourceId: TAB_ID });

        expect(invalidate).not.toHaveBeenCalled();
    });

    it('skips an invalid message and keeps listening', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { invalidate } = renderInvoiceEvents();
        latestSocket().open();

        latestSocket().receive('not json');
        latestSocket().receive({ type: 'invoice.created', id: 'INV-009' });

        expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: ['invoices'] });
    });

    it('reconnects after 1s, then 2s, while the server stays down', () => {
        renderInvoiceEvents();
        latestSocket().open();

        latestSocket().serverClose();
        vi.advanceTimersByTime(999);
        expect(FakeWebSocket.instances).toHaveLength(1);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(2);

        latestSocket().serverClose();
        vi.advanceTimersByTime(1999);
        expect(FakeWebSocket.instances).toHaveLength(2);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(3);
    });

    it('refetches after a reconnection to catch up on the events missed while offline', () => {
        const { invalidate } = renderInvoiceEvents();
        latestSocket().open();
        latestSocket().serverClose();
        vi.advanceTimersByTime(1000);

        latestSocket().open();

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
    });

    it('closes the socket on unmount and never reconnects', () => {
        const { unmount } = renderInvoiceEvents();
        const socket = latestSocket();
        socket.open();

        unmount();
        vi.advanceTimersByTime(60_000);

        expect(socket.close).toHaveBeenCalledOnce();
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    // Strict Mode unmounts before the handshake ends; closing then logs a browser warning
    it('closes a socket unmounted while connecting only once it has opened', () => {
        const { unmount } = renderInvoiceEvents();
        const socket = latestSocket();

        unmount();
        expect(socket.close).not.toHaveBeenCalled();
        socket.open();

        expect(socket.close).toHaveBeenCalledOnce();
    });
});
