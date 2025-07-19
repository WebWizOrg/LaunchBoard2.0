// src/components/read-only-portfolio.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Mail, Linkedin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultPortfolioData } from '@/app/portfolio/builder/page';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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

  const renderSectionComponent = (section: any) => {
    const content = portfolioData.content[section.id] || {};

    const SectionWrapper = ({children, id}: {children: React.ReactNode, id: string}) => <section id={id} className="w-full px-8 py-12 md:px-16 md:py-20">{children}</section>;
    const Title = ({children}: {children: React.ReactNode}) => <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 text-center">{children}</h2>;

    switch (section.type) {
        case 'header': return (
            <header className="w-full h-[60vh] flex items-center justify-center text-center px-8" style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}>
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl">{content.title}</h1>
                    <p className="max-w-[700px] mx-auto text-lg md:text-xl">{content.tagline}</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild size="lg"><a href={content.buttonLink}>{content.buttonText}</a></Button>
                    </div>
                </div>
            </header>
        );
        case 'about': return (
            <SectionWrapper id="about">
                <div className="container mx-auto grid items-center gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{content.title}</h2>
                        <p className="text-muted-foreground">{content.text}</p>
                    </div>
                    <Image src={content.image || "https://placehold.co/400x400.png"} width={400} height={400} alt="About Me" className="mx-auto rounded-lg" data-ai-hint={content.hint || 'person portrait'}/>
                </div>
            </SectionWrapper>
        );
        case 'projects': return (
            <SectionWrapper id="projects">
                <div className="container mx-auto">
                    <Title>{content.title}</Title>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {(content.items || []).map((item: any, index: number) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <Image src={item.image || "https://placehold.co/600x400.png"} width={600} height={400} alt={item.title} className="rounded-md mb-4" data-ai-hint={item.hint || 'project screenshot'}/>
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                    <p className="text-muted-foreground mt-2">{item.description}</p>
                                    <Button asChild variant="link" className="mt-4 p-0"><a href={item.link}>View Project <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        );
        case 'contact': return (
            <SectionWrapper id="contact">
                <div className="container mx-auto max-w-2xl text-center">
                    <Title>{content.title}</Title>
                    <p className="text-muted-foreground">{content.text}</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button asChild><a href={`mailto:${content.email || ''}`}><Mail className="mr-2 h-4 w-4" /> Email Me</a></Button>
                        <Button asChild variant="secondary"><a href={content.linkedin || '#'} target="_blank"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</a></Button>
                    </div>
                </div>
            </SectionWrapper>
        );
        case 'line_break':
                return <Separator className="my-12" />;
        default: return (
            <SectionWrapper id={section.type}>
                <div className="container mx-auto">
                    <Title>{content.title || section.type}</Title>
                    <div className="text-center text-muted-foreground">
                        <p>{content.text}</p>
                    </div>
                </div>
            </SectionWrapper>
        );
    }
  };

  return (
    <div className="w-full" style={portfolioStyle}>
      {portfolioData.sections.map((section: any) => (
          <div key={section.id}>
              {renderSectionComponent(section)}
          </div>
      ))}
    </div>
  );
}
