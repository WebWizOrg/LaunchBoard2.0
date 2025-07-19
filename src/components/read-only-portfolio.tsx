
// src/components/read-only-portfolio.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Mail, Linkedin, ArrowRight, User, FileText, Code, Briefcase, Newspaper, Sparkles, Quote, Phone, ImageIcon, Heart, MessageSquare, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultPortfolioData } from '@/app/portfolio/builder/page';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ReadOnlySection } from '@/components/portfolio-templates';

export function ReadOnlyPortfolio({ portfolioId }: { portfolioId: string }) {
  const [portfolioData, setPortfolioData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const portfolioRef = doc(db, 'publishedPortfolios', portfolioId);
        const docSnap = await getDoc(portfolioRef);

        if (docSnap.exists() && docSnap.data().isPublished) {
          const data = docSnap.data();
          setPortfolioData({
            ...defaultPortfolioData,
            ...data,
            styling: { ...defaultPortfolioData.styling, ...data.styling },
          });
          // Increment view count
          await updateDoc(portfolioRef, { views: increment(1) });
        } else {
          setPortfolioData(null); // Will trigger notFound()
        }
      } catch (error) {
        console.error("Error fetching shared portfolio:", error);
        setPortfolioData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [portfolioId]);


  const renderTemplate = () => {
    const styling = portfolioData?.styling || defaultPortfolioData.styling;
    const allSections = portfolioData?.sections || [];

     if (styling.template === 'zen-slide') {
      return (
        <Carousel className="w-full h-screen" opts={{ align: 'start', loop: true }}>
          <CarouselContent className="-ml-0 h-full">
            {allSections.map((section: any) => (
              <CarouselItem key={section.id} className="pl-0">
                <div className="w-full h-full flex items-center justify-center p-6">
                  <ReadOnlySection section={section} portfolioData={portfolioData} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      );
    }

    if (styling.template === 'terminal') {
      return (
        <div className="font-mono bg-black text-green-400 min-h-screen p-4 md:p-8 relative">
           <div className="absolute inset-0 bg-black/20" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 0, 0.1) 1px, rgba(0, 255, 0, 0.1) 2px)`, pointerEvents: 'none' }}></div>
          <div className="relative">
            {allSections.map((section: any) => (
              <ReadOnlySection key={section.id} section={section} portfolioData={portfolioData} />
            ))}
          </div>
        </div>
      );
    }
    
    if (styling.template === 'split-showcase') {
        const sidebarSections = ['about', 'skills', 'contact'];
        const mainSections = ['header', 'projects', 'experience', 'testimonials'];
        
        const sidebarContent = allSections.filter(s => sidebarSections.includes(s.type));
        const mainContent = allSections.filter(s => mainSections.includes(s.type));

        return (
            <div className='flex flex-col md:flex-row min-h-screen'>
                <aside className="w-full md:w-1/3 md:h-screen md:sticky top-0 p-8 md:p-12 flex flex-col gap-8 border-r">
                    {sidebarContent.map((section: any) => (
                        <ReadOnlySection key={section.id} section={section} portfolioData={portfolioData} />
                    ))}
                </aside>
                <main className='w-full md:w-2/3'>
                    {mainContent.map((section: any) => (
                        <ReadOnlySection key={section.id} section={section} portfolioData={portfolioData} />
                    ))}
                </main>
            </div>
        );
    }
    
    if (styling.template === 'magazine-spread') {
      return (
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-6 gap-4">
          {allSections.map((section, index) => {
            const colSpan = (index % 5 === 0 || index % 5 === 3) ? 'md:col-span-3' : 'md:col-span-2';
            const rowSpan = (index % 5 === 0) ? 'md:row-span-2' : 'md:row-span-1';
            return (
              <div key={section.id} className={cn(colSpan, rowSpan, 'min-h-[200px]')}>
                  <div className="h-full w-full p-4 border rounded-lg bg-background/50 flex items-center justify-center">
                    <ReadOnlySection section={section} portfolioData={portfolioData} />
                  </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Default template (modern-dark) and others
    return (
        <div className="bg-[#111827] text-white">
            {portfolioData.sections.map((section: any) => (
                <ReadOnlySection key={section.id} section={section} portfolioData={portfolioData} />
            ))}
        </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!portfolioData) {
    return notFound();
  }
  
  const styling = portfolioData.styling || {};
  const portfolioStyle = {
    '--portfolio-primary-color': styling.primaryColor,
    '--portfolio-background-color': styling.backgroundColor,
    '--portfolio-text-color': styling.textColor,
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--portfolio-background-color)',
    color: 'var(--portfolio-text-color)',
  };

  return (
    <div className="w-full" style={portfolioStyle}>
        {renderTemplate()}
    </div>
  );
}
