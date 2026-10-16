'use client';

import React, { useEffect, useState } from 'react';

const SAMPLE_INTERVAL_MS = 500;

const fpsColor = (fps: number) => (fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171');

const FpsMeter = () => {
    const [fps, setFps] = useState(0);

    useEffect(() => {
        let frames = 0;
        let sampleStart = performance.now();
        let frameId: number;

        const tick = (now: number) => {
            frames++;
            const elapsed = now - sampleStart;
            if (elapsed >= SAMPLE_INTERVAL_MS) {
                setFps(Math.round((frames * 1000) / elapsed));
                frames = 0;
                sampleStart = now;
            }
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <div
            className="pointer-events-none absolute top-3 right-3 rounded-md border border-zinc-800 bg-[#111111] px-2 py-1 text-xs text-zinc-400 tabular-nums select-none"
            aria-hidden="true"
        >
            <span style={{ color: fpsColor(fps) }}>{fps}</span> FPS
        </div>
    );
};

export default FpsMeter;
