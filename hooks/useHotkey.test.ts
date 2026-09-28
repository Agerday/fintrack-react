// Testing a hook: a hook can only run inside a component, so renderHook mounts a tiny
// invisible test component that calls it. unmount() then runs the effect cleanups.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderHook } from '@testing-library/react';
import { useHotkey } from './useHotkey';

describe('useHotkey', () => {
    // vi.fn() = a mock function that records its calls (Jasmine: jasmine.createSpy())
    const handler = vi.fn();
    afterEach(() => handler.mockReset());

    it('calls the handler when the key is pressed', () => {
        renderHook(() => useHotkey('n', handler));

        // fireEvent dispatches ONE raw DOM event. Enough here: the hook listens to keydown only
        fireEvent.keyDown(window, { key: 'n' });

        expect(handler).toHaveBeenCalledOnce();
    });

    it('matches the key case-insensitively (Shift / Caps Lock)', () => {
        renderHook(() => useHotkey('n', handler));

        fireEvent.keyDown(window, { key: 'N' });

        expect(handler).toHaveBeenCalledOnce();
    });

    it('ignores the key combined with Ctrl / Cmd, so browser shortcuts keep working', () => {
        renderHook(() => useHotkey('n', handler));

        fireEvent.keyDown(window, { key: 'n', ctrlKey: true });
        fireEvent.keyDown(window, { key: 'n', metaKey: true });

        expect(handler).not.toHaveBeenCalled();
    });

    it('ignores keys typed inside a form field', () => {
        renderHook(() => useHotkey('n', handler));
        const input = document.createElement('input');
        document.body.append(input);

        // The event bubbles from the input up to window, where the hook listens
        fireEvent.keyDown(input, { key: 'n' });

        expect(handler).not.toHaveBeenCalled();
        input.remove();
    });

    // REGRESSION TEST: reproduces a bug we fixed, so it can never come back unnoticed.
    // Chrome autofill fires a `keydown` that is a plain Event, without a `key` property,
    // and `event.key.toLowerCase()` crashed with "Cannot read properties of undefined"
    it('does not crash on a keydown event without key (Chrome autofill)', () => {
        renderHook(() => useHotkey('n', handler));
        // An exception inside an event listener doesn't propagate to dispatchEvent: the
        // browser (and jsdom) report it as an 'error' event on window. So we listen to that
        const onError = vi.fn();
        window.addEventListener('error', onError);

        window.dispatchEvent(new Event('keydown'));

        expect(onError).not.toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener('error', onError);
    });

    it('does nothing when no key is given', () => {
        renderHook(() => useHotkey(undefined, handler));

        fireEvent.keyDown(window, { key: 'n' });

        expect(handler).not.toHaveBeenCalled();
    });

    it('stops listening once the component unmounts (no leak)', () => {
        const { unmount } = renderHook(() => useHotkey('n', handler));

        unmount();
        fireEvent.keyDown(window, { key: 'n' });

        expect(handler).not.toHaveBeenCalled();
    });

    it('always calls the latest handler without re-subscribing', () => {
        const first = vi.fn();
        const second = vi.fn();
        // rerender() re-runs the hook with new props, like a parent re-rendering
        const { rerender } = renderHook(({ fn }) => useHotkey('n', fn), {
            initialProps: { fn: first },
        });

        rerender({ fn: second });
        fireEvent.keyDown(window, { key: 'n' });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledOnce();
    });
});
