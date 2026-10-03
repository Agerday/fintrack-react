// Resolve a theme token to its real color, for APIs that can't read Tailwind classes (canvas).
// Browser only: call it from an effect or an event handler, never during render
export function cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
