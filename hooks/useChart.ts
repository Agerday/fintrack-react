'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';

let themeFontApplied = false;

function applyThemeFont() {
    if (themeFontApplied) return;
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    themeFontApplied = true;
}

function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
}

// Chart.js is imperative: it draws on a <canvas> it owns. Create it once after mount and
// destroy it in the cleanup (like ngAfterViewInit + ngOnDestroy). When `data` changes, the
// same chart gets the new config and redraws in place: cheaper than a rebuild, which matters
// for a live chart updated several times a second. createConfig is an effect event, so
// callers can pass an inline function without memoizing it.
export function useChart<TType extends ChartType>(
    createConfig: () => ChartConfiguration<TType>,
    data: unknown,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart<TType>>(null);
    const getConfig = useEffectEvent(createConfig);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        applyThemeFont();
        chartRef.current = new Chart(canvas, getConfig());

        // Canvas colors are resolved once: rebuild when the theme class on <html> changes.
        // Not useTheme(): next-themes sets the class in its own effect, which runs after ours
        let dark = isDarkTheme();
        const observer = new MutationObserver(() => {
            if (isDarkTheme() === dark) return;
            dark = isDarkTheme();
            chartRef.current?.destroy();
            chartRef.current = new Chart(canvas, getConfig());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, []);

    // Runs after the mount effect: on the first render it only redraws the chart just created
    useEffect(() => {
        const chart = chartRef.current;
        // No ctx: Chart.js could not get a 2D context (no canvas support, jsdom) and an update
        // would throw. There is nothing drawn to refresh anyway
        if (!chart?.ctx) return;

        const { data: nextData, options } = getConfig();
        chart.data = nextData;
        if (options) chart.options = options;
        // 'none': no animation, the new point just appears
        chart.update('none');
    }, [data]);

    return canvasRef;
}
