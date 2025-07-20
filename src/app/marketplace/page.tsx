// src/app/marketplace/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import InfiniteScroll from '@/InfiniteScroll/InfiniteScroll';
import { Card, CardContent } from '@/components/ui/card';

export default function MarketplacePage() {
    const resumeTemplates = [
        { name: 'Horizontal Split', id: 'horizontal-split', image: '/images/resume(1).png', hint: 'resume template' },
        { name: 'Vertical Split', id: 'vertical-split', image: '/images/resume(2).png', hint: 'modern resume' },
        { name: 'Classic', id: 'classic', image: '/images/resume(3).png', hint: 'classic resume' },
        { name: 'ATS-Friendly', id: 'ats-friendly', image: '/images/resume(4).png', hint: 'ATS resume' },
        { name: 'Creative', id: 'creative', image: '/images/resume(5).png', hint: 'creative resume' },
        { name: 'Student', id: 'student', image: '/images/resume(6).png', hint: 'student resume' },
        { name: 'Developer', id: 'developer', image: '/images/resume(7).png', hint: 'developer resume' },
        { name: 'Minimal CV', id: 'minimal-cv', image: '/images/resume(8).png', hint: 'minimal cv' },
        { name: 'Two-Column Balanced', id: 'two-column-balanced', image: '/images/resume(9).png', hint: 'two column resume' },
        { name: 'Showcase First', id: 'showcase-first', image: '/images/resume(10).png', hint: 'portfolio resume' },
      ];

      const portfolioTemplates = [
        { name: 'Split Showcase', id: 'split-showcase', image: '/images/template1.jpg', hint: 'split portfolio' },
        { name: 'Terminal', id: 'terminal', image: '/images/template2.jpg', hint: 'terminal portfolio' },
        { name: 'Modern Dark', id: 'modern-dark', image: '/images/template3.jpg', hint: 'dark portfolio' },
        { name: 'Zen Slide', id: 'zen-slide', image: '/images/template4.jpg', hint: 'horizontal scroll' },
        { name: 'Magazine Spread', id: 'magazine-spread', image: '/images/template5.jpg', hint: 'editorial layout' },
        { name: 'Minimalist Card Grid', id: 'minimalist-card-grid', image: '/images/template6.jpg', hint: 'card grid' },
        { name: 'Floating Tiles', id: 'floating-tiles', image: '/images/template7.jpg', hint: 'interactive tiles' },
        { name: 'Retro 90s OS', id: 'retro-90s-os', image: '/images/template8.jpg', hint: 'retro interface' },
        { name: 'Dynamic Timeline', id: 'dynamic-timeline', image: '/images/template9.jpg', hint: 'timeline resume' },
        { name: 'Video Hero Intro', id: 'video-hero-intro', image: '/images/template10.jpg', hint: 'video background' },
      ];

      const allTemplates = [...resumeTemplates, ...portfolioTemplates];

      const items = allTemplates.map((template) => ({
        content: (
            <Card className="w-full h-full overflow-hidden bg-background">
                <CardContent className="p-0">
                    <Image
                        src={template.image}
                        alt={template.name}
                        width={400}
                        height={566}
                        className="w-full h-full object-cover"
                        data-ai-hint={template.hint}
                    />
                </CardContent>
            </Card>
        )
      }));

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
             <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <h1 className="text-4xl md:text-6xl font-bold font-headline my-12 text-center">Template Marketplace</h1>
            <div className="w-full h-[70vh] perspective-1000">
                <InfiniteScroll
                    items={items}
                    isTilted={true}
                    tiltDirection='left'
                    autoplay={true}
                    autoplaySpeed={0.1}
                    autoplayDirection="down"
                    pauseOnHover={true}
                    itemMinHeight={400}
                    width="25rem"
                    maxHeight='100%'
                />
            </div>
        </div>
    )
}
