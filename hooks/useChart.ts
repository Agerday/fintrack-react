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
        const chart = new Chart(canvas, getConfig());

        return () => chart.destroy();
    }, [data]);

    return canvasRef;
}
