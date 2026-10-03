'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';

let themeFontApplied = false;

// Global Chart.js default, set once. Not at import time: there is no document on the server
function applyThemeFont() {
    if (themeFontApplied) return;
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    themeFontApplied = true;
}

function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
}

// Chart.js is imperative: it draws on a <canvas> it owns. Create it after mount and destroy
// it in the cleanup (like ngAfterViewInit + ngOnDestroy), otherwise every change would stack
// a new chart on the same canvas. Only `data` triggers a redraw: createConfig is an effect
// event, so callers can pass an inline function without memoizing it.
export function useChart<TType extends ChartType>(
    createConfig: () => ChartConfiguration<TType>,
    data: unknown,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const getConfig = useEffectEvent(createConfig);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        applyThemeFont();
        let chart = new Chart(canvas, getConfig());

        // Canvas colors are resolved once: redraw when the theme class on <html> changes.
        // Not useTheme(): next-themes sets the class in its own effect, which runs after ours
        let dark = isDarkTheme();
        const observer = new MutationObserver(() => {
            if (isDarkTheme() === dark) return;
            dark = isDarkTheme();
            chart.destroy();
            chart = new Chart(canvas, getConfig());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            chart.destroy();
        };
    }, [data]);

    return canvasRef;
}
