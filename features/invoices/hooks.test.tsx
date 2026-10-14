import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useInvoiceEvents } from './hooks';
import { TAB_ID } from '@/lib/realtime';
import { FakeWebSocket } from '@/test/fake-websocket';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { renderHookWithClient } from '@/test/render';

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
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({
            type: 'invoice.updated',
            id: 'INV-001',
            sourceId: 'other-tab',
        });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoice', 'INV-001'] });
    });

    it('refreshes the bank account when another tab updates an invoice, as it may be paid', () => {
        const { invalidate } = renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({
            type: 'invoice.updated',
            id: 'INV-001',
            sourceId: 'other-tab',
        });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account'] });
    });

    it('refreshes the invoices and the clients they make up when an invoice is created', () => {
        const { invalidate } = renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({ type: 'invoice.created', id: 'INV-009' });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['clients'] });
        expect(invalidate).toHaveBeenCalledTimes(2);
    });

    it('alerts the user when another tab creates an invoice', () => {
        renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({
            type: 'invoice.created',
            id: 'INV-009',
            sourceId: 'other-tab',
        });

        expect(useNotificationStore.getState().notifications).toEqual([
            expect.objectContaining({ title: 'Invoice INV-009 created' }),
        ]);
    });

    it('does not alert the user about a change made in this same tab', () => {
        renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({
            type: 'invoice.created',
            id: 'INV-009',
            sourceId: TAB_ID,
        });

        expect(useNotificationStore.getState().notifications).toEqual([]);
    });

    it('ignores the echo of a change made by this same tab', () => {
        const { invalidate } = renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive({
            type: 'invoice.updated',
            id: 'INV-001',
            sourceId: TAB_ID,
        });

        expect(invalidate).not.toHaveBeenCalled();
    });

    it('skips an invalid message and keeps listening', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { invalidate } = renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());

        FakeWebSocket.latest().receive('not json');
        FakeWebSocket.latest().receive({ type: 'invoice.created', id: 'INV-009' });

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
    });

    it('refetches after a reconnection to catch up on the events missed while offline', () => {
        const { invalidate } = renderInvoiceEvents();
        act(() => FakeWebSocket.latest().open());
        act(() => FakeWebSocket.latest().serverClose());
        vi.advanceTimersByTime(1000);

        act(() => FakeWebSocket.latest().open());

        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['invoices'] });
    });
});
