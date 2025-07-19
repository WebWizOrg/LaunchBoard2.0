// src/app/share/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { defaultResumeData } from '@/app/builder/page';
import {
  AlertCircle,
  Award,
  Book,
  Bot,
  Briefcase,
  Code,
  FileText,
  Github,
  GraduationCap,
  ImageIcon,
  Languages,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  Minus,
  Phone,
  Quote,
  Share,
  Sparkles,
  Star,
  Twitter,
  Type,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// This component fetches and renders the actual resume content
function ReadOnlyResume({ resumeId }: { resumeId: string }) {
  const [resumeData, setResumeData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (!resumeId) {
      setLoading(false);
      return;
    }
    const fetchResume = async () => {
      setLoading(true);
      try {
        const resumeRef = doc(db, 'publishedResumes', resumeId);
        const docSnap = await getDoc(resumeRef);

        if (docSnap.exists() && docSnap.data().isPublished) {
          const data = docSnap.data();
          setResumeData({
            ...defaultResumeData,
            ...data,
            styling: { ...defaultResumeData.styling, ...data.styling, backgroundBlur: 0 },
          });
        } else {
          setResumeData(null); // Will trigger notFound()
        }
      } catch (error) {
        console.error("Error fetching shared resume:", error);
        setResumeData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId]);

  // This is a stand-alone render function to avoid depending on the builder page
  const renderSectionComponent = (section: any, styling: any, content: any, isPublicView = true) => {
    const sectionContent = content[section.id] || {};
    
    // Simplified Title Component for public view
    const TitleComponent = ({value, icon: Icon, className, ...props}: any) => {
      const { titleClass } = props; 
      return (
          <div className="flex items-center gap-3 mb-2">
              {Icon && <Icon className="h-6 w-6" style={{ color: props.isAccentBg ? styling.accentTextColor : styling.accentColor }} />}
              <div className={cn("text-xl font-bold w-full", titleClass, className)}>{value}</div>
          </div>
      )
    };

    switch (section.type) {
        case 'header':
            return (
                <div className="flex flex-col items-center gap-2">
                    {sectionContent.showAvatar && (
                        <div className="relative group w-32 h-32">
                            <Image src={sectionContent.avatar || 'https://placehold.co/128x128.png'} alt="Avatar" width={128} height={128} data-ai-hint="placeholder" className="rounded-full object-cover w-32 h-32 border-2" style={{borderColor: styling.accentColor}} />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}>{sectionContent.name}</h1>
                    <p className="text-muted-foreground text-center">{sectionContent.tagline}</p>
                </div>
            );
        case 'summary':
            if (!sectionContent.text) return null;
            return (
              <div className="mt-6">
                <TitleComponent value={sectionContent.title || 'Summary'} icon={FileText} />
                <p className="whitespace-pre-wrap text-sm">{sectionContent.text}</p>
              </div>
            );
        case 'experience':
            if (!sectionContent.items || sectionContent.items.length === 0) return null;
            return (
                <div className="mt-6">
                    <TitleComponent value={sectionContent.title || 'Experience'} icon={Briefcase}/>
                    <div className="space-y-4">
                        {sectionContent.items.map((item: any, index: number) => (
                            <div key={index} className="pl-4 border-l-2 border-border/50">
                                <p className="font-semibold">{item.company}</p>
                                <p>{item.role}</p>
                                <p className="text-sm text-muted-foreground">{item.dates}</p>
                                <p className="whitespace-pre-wrap text-sm mt-1">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'line_break':
            return <Separator className="my-4 bg-border/50" />;
        default:
            return null;
    }
  };
  
  // This is a stand-alone render function to avoid depending on the builder page
  const renderTemplate = (resumeData: DocumentData) => {
    const { sections, content, styling } = resumeData;
    // For simplicity, we'll use a default layout. A more complex implementation
    // would check `styling.template` and render accordingly.
    return (
        <div className="p-8">
            {sections.map((section: any) => (
                <div key={section.id}>
                    {renderSectionComponent(section, styling, content)}
                </div>
            ))}
        </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!resumeData) {
    return notFound();
  }

  const styling = resumeData.styling || {};
  const resumeStyle: React.CSSProperties = {
    '--resume-accent-color': styling.accentColor,
    '--resume-accent-text-color': styling.accentTextColor,
    '--resume-background': theme === 'dark' ? styling.backgroundColorDark : styling.backgroundColorLight,
    '--resume-foreground': theme === 'dark' ? '#f8f8f8' : '#111111',
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--resume-background)',
    color: 'var(--resume-foreground)',
    aspectRatio: '1 / 1.4142'
  };

  const resumeBgStyle: React.CSSProperties = {
    backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: `brightness(${styling.backgroundBrightness}%)`,
  };

  return (
    <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-background" style={resumeStyle}>
      <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
      <div className="relative h-full w-full">
        {renderTemplate(resumeData)}
      </div>
    </div>
  );
}

// This remains the default export for the route. It's now a Server Component.
export default function SharePage({ params }: { params: { id: string } }) {
  // This is now a Server Component, so we can directly pass props.
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <ReadOnlyResume resumeId={params.id} />
    </div>
  );
}
