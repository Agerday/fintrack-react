import { useEffect, useRef } from 'react';

// Keys typed into a field must stay in the field, never trigger a shortcut
function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
    );
}

// Single-key shortcut on the whole page (no Ctrl / Cmd / Alt), like @HostListener('window:keydown')
// `key` can be undefined so callers with an optional shortcut can still call the hook unconditionally
export function useHotkey(key: string | undefined, handler: () => void) {
    // Ref so a new inline handler on every render doesn't re-subscribe the listener
    const handlerRef = useRef(handler);
    useEffect(() => {
        handlerRef.current = handler;
    });

    useEffect(() => {
        if (!key) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key.toLowerCase() !== key?.toLowerCase()) return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (isTypingTarget(event.target)) return;

            event.preventDefault();
            handlerRef.current();
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key]);
}
