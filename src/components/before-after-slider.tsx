// src/components/before-after-slider.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MoveHorizontal } from 'lucide-react';

export function BeforeAfterSlider({
    before,
    after,
}: {
    before: React.ReactNode;
    after: React.ReactNode;
}) {
    const [sliderValue, setSliderValue] = useState(50);

    return (
        <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
            <div className="absolute inset-0">
                {before}
            </div>
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
            >
                {after}
            </div>
            <div
                className="absolute inset-y-0 w-1 bg-white/70 cursor-ew-resize"
                style={{ left: `calc(${sliderValue}% - 2px)` }}
            >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-primary">
                    <MoveHorizontal />
                </div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0"
                aria-label="Image comparison slider"
            />
        </div>
    );
}
