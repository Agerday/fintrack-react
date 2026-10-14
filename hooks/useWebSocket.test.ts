import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWebSocket } from './useWebSocket';
import { FakeWebSocket } from '@/test/fake-websocket';
import { renderHookWithClient } from '@/test/render';

function renderWebSocket() {
    const onMessage = vi.fn();
    const onReconnect = vi.fn();
    const result = renderHookWithClient(() =>
        useWebSocket('ws://test', { onMessage, onReconnect }),
    );
    return { ...result, onMessage, onReconnect };
}

describe('useWebSocket', () => {
    beforeEach(() => {
        FakeWebSocket.instances = [];
        vi.stubGlobal('WebSocket', FakeWebSocket);
        vi.useFakeTimers();
    });

    it('passes every message to the caller and reports the connection as open', () => {
        const { result, onMessage } = renderWebSocket();

        act(() => FakeWebSocket.latest().open());
        FakeWebSocket.latest().receive('hello');

        expect(result.current).toBe('open');
        expect(onMessage).toHaveBeenCalledWith('hello');
    });

    it('reconnects after 1s, then 2s, while the server stays down', () => {
        const { result } = renderWebSocket();
        act(() => FakeWebSocket.latest().open());

        act(() => FakeWebSocket.latest().serverClose());
        expect(result.current).toBe('closed');
        vi.advanceTimersByTime(999);
        expect(FakeWebSocket.instances).toHaveLength(1);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(2);

        act(() => FakeWebSocket.latest().serverClose());
        vi.advanceTimersByTime(1999);
        expect(FakeWebSocket.instances).toHaveLength(2);
        vi.advanceTimersByTime(1);
        expect(FakeWebSocket.instances).toHaveLength(3);
    });

    it('tells the caller when it is back online, but not on the first connection', () => {
        const { onReconnect } = renderWebSocket();
        act(() => FakeWebSocket.latest().open());
        expect(onReconnect).not.toHaveBeenCalled();

        act(() => FakeWebSocket.latest().serverClose());
        vi.advanceTimersByTime(1000);
        act(() => FakeWebSocket.latest().open());

        expect(onReconnect).toHaveBeenCalledOnce();
    });

    it('closes the socket on unmount and never reconnects', () => {
        const { unmount } = renderWebSocket();
        const socket = FakeWebSocket.latest();
        act(() => socket.open());

        unmount();
        vi.advanceTimersByTime(60_000);

        expect(socket.close).toHaveBeenCalledOnce();
        expect(FakeWebSocket.instances).toHaveLength(1);
    });

    // Strict Mode unmounts before the handshake ends; closing then logs a browser warning
    it('closes a socket unmounted while connecting only once it has opened', () => {
        const { unmount } = renderWebSocket();
        const socket = FakeWebSocket.latest();

        unmount();
        expect(socket.close).not.toHaveBeenCalled();
        socket.open();

        expect(socket.close).toHaveBeenCalledOnce();
    });
});
