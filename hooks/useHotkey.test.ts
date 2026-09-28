import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderHook } from '@testing-library/react';
import { useHotkey } from './useHotkey';

describe('useHotkey', () => {
    it('calls the handler when the key is pressed, whatever its case', () => {
        const handler = vi.fn();
        renderHook(() => useHotkey('n', handler));

        fireEvent.keyDown(window, { key: 'n' });
        fireEvent.keyDown(window, { key: 'N' });

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('lets the key be typed in a form field', () => {
        const handler = vi.fn();
        renderHook(() => useHotkey('n', handler));
        const input = document.createElement('input');
        document.body.append(input);

        fireEvent.keyDown(input, { key: 'n' });

        expect(handler).not.toHaveBeenCalled();
        input.remove();
    });

    it('leaves browser shortcuts like Ctrl+N alone', () => {
        const handler = vi.fn();
        renderHook(() => useHotkey('n', handler));

        fireEvent.keyDown(window, { key: 'n', ctrlKey: true });
        fireEvent.keyDown(window, { key: 'n', metaKey: true });

        expect(handler).not.toHaveBeenCalled();
    });

    // Regression: Chrome autofill fires a keydown without `key` and event.key.toLowerCase()
    // crashed. A listener exception doesn't reach dispatchEvent, jsdom reports it on window
    it('ignores a keydown without key instead of crashing (Chrome autofill)', () => {
        const handler = vi.fn();
        const onError = vi.fn();
        window.addEventListener('error', onError);
        renderHook(() => useHotkey('n', handler));

        window.dispatchEvent(new Event('keydown'));

        expect(onError).not.toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener('error', onError);
    });

    it('calls the latest handler after a re-render', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(({ fn }) => useHotkey('n', fn), {
            initialProps: { fn: first },
        });

        rerender({ fn: second });
        fireEvent.keyDown(window, { key: 'n' });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledOnce();
    });

    it('stops listening once unmounted', () => {
        const handler = vi.fn();
        const { unmount } = renderHook(() => useHotkey('n', handler));

        unmount();
        fireEvent.keyDown(window, { key: 'n' });

        expect(handler).not.toHaveBeenCalled();
    });
});
