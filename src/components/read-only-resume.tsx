// src/components/read-only-resume.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { defaultResumeData } from '@/app/builder/page';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
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

// This component fetches and renders the actual resume content
export function ReadOnlyResume({ resumeId }: { resumeId: string }) {
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
          // Increment view count
          await updateDoc(resumeRef, { views: increment(1) });
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

  const renderSectionComponent = (section: any, templateContext: any = {}) => {
        const content = resumeData?.content[section.id] || {};
        const { isAccentBg = false, isPublicView = true } = templateContext;
        const isEditable = !isPublicView; // Always false here

        if (!isEditable) {
            if (section.type === 'summary' && !content.text) return null;
            if (['experience', 'projects', 'education', 'certifications', 'links', 'recommendations', 'skills', 'socials', 'publications'].includes(section.type) && (!content.items || content.items.length === 0) && !content.text) return null;
        }

        const TitleComponent = ({value, icon: Icon, className, ...props}: {value: string, icon: React.ElementType, className?: string, titleClass?: string}) => {
            const { titleClass } = props; 
            return (
                <div className="flex items-center gap-3 mb-2">
                    {Icon && <Icon className="h-6 w-6" style={{ color: isAccentBg ? resumeData?.styling.accentTextColor : resumeData?.styling.accentColor }} />}
                    <div className={cn("text-xl font-bold w-full", titleClass, className)}>{value}</div>
                </div>
            )
        };

        switch (section.type) {
            case 'header':
              return (
                <div className="flex flex-col items-center gap-2">
                    {content.showAvatar && (
                        <div className="relative group w-32 h-32">
                            <Image
                                src={content.avatar || 'https://placehold.co/128x128.png'}
                                alt="Avatar"
                                width={128}
                                height={128}
                                data-ai-hint="placeholder"
                                className="rounded-full object-cover w-32 h-32 border-2"
                                style={{borderColor: resumeData?.styling.accentColor}}
                            />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}>{content.name}</h1>
                    <p className="text-muted-foreground text-center">{content.tagline}</p>
                </div>
              );
            case 'contact':
              return (
                <div className="mt-6">
                  <TitleComponent value={content.title || 'Contact'} icon={Phone} titleClass={templateContext.titleClass} />
                  <div className="space-y-2 text-sm">
                      {content.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/><p>{content.email}</p></div>}
                      {content.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/><p>{content.phone}</p></div>}
                      {content.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0"/><p>{content.address}</p></div>}
                  </div>
                </div>
              );
            case 'socials':
                if (!content.items || content.items.length === 0) return null;
                return (
                    <div className="mt-6">
                        <TitleComponent value={content.title || 'Socials'} icon={Share} titleClass={templateContext.titleClass} />
                        <div className="space-y-2">
                            {content.items.map((item: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    {item.platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                                    {item.platform === 'github' && <Github className="h-4 w-4" />}
                                    {item.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                                    <p>{item.username}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
          case 'summary':
          case 'cover_letter':
              if (!content.text) return null;
              return (
                  <div className="mt-6">
                      <TitleComponent value={content.title} icon={section.type === 'summary' ? FileText : Bot} titleClass={templateContext.titleClass} />
                      <p className="whitespace-pre-wrap text-sm">{content.text}</p>
                  </div>
              );
          case 'recommendations':
             if (!content.items || content.items.length === 0) return null;
            return (
                <div className="mt-6">
                     <TitleComponent value={content.title} icon={Quote} titleClass={templateContext.titleClass}/>
                     <div className="space-y-4">
                         {content.items.map((item: any, index: number) => (
                             <div key={index} className="pl-4 border-l-2 border-border/50">
                                 <blockquote className="text-sm italic">"{item.text}"</blockquote>
                                 <cite className="block text-right font-semibold not-italic mt-2">&mdash; {item.author}</cite>
                             </div>
                         ))}
                     </div>
                </div>
            );
          case 'experience':
          case 'projects':
          case 'education':
          case 'certifications':
          case 'links':
            if (!content.items || content.items.length === 0) return null;
            const itemTypeMap: {[key: string]: {icon: React.ElementType}} = { experience: {icon: Briefcase}, projects: {icon: Code}, education: {icon: GraduationCap}, certifications: {icon: Award}, links: {icon: LinkIcon}};
            const itemConfig = itemTypeMap[section.type];
            return (
                <div className="mt-6">
                     <TitleComponent value={content.title} icon={itemConfig.icon} titleClass={templateContext.titleClass}/>
                     <div className="space-y-4">
                         {content.items.map((item: any, index: number) => (
                             <div key={index} className="pl-4 border-l-2 border-border/50">
                                {section.type === 'education' && <><p className="font-semibold">{item.institution}</p><p>{item.degree}</p></>}
                                {section.type === 'experience' && <><p className="font-semibold">{item.company}</p><p>{item.role}</p></>}
                                {section.type === 'projects' && <><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.tech}</p></>}
                                {section.type === 'certifications' && <><p className="font-semibold">{item.name}</p><p>{item.issuer}</p></>}
                                {section.type === 'links' && <a href={item.url} target="_blank" rel="noreferrer" className="font-semibold underline">{item.text}</a>}
                                <p className="text-sm text-muted-foreground">{item.dates || item.date}</p>
                                {['experience', 'projects', 'education'].includes(section.type) && <p className="whitespace-pre-wrap text-sm mt-1">{item.description}</p>}
                             </div>
                         ))}
                     </div>
                </div>
            );
           case 'skills':
            if ((!content.items || content.items.length === 0) && !content.text) return null;
            return (
              <div className="mt-6">
                 <TitleComponent value={content.title} icon={Sparkles} titleClass={templateContext.titleClass}/>
                 {templateContext.variant === 'creative' ? (
                     <div className="space-y-4">
                         {content.items.map((item: any, index: number) => (
                             <div key={index} className="flex items-center gap-4">
                                <p className="w-1/3">{item.skill}</p>
                                <Progress value={item.level} style={{accentColor: resumeData?.styling.accentColor}} />
                             </div>
                         ))}
                     </div>
                 ) : (<p className="text-sm">{content.text}</p>)}
              </div>
            );
           case 'languages':
           case 'achievements':
           case 'publications':
            if(!content.text) return null;
            const textIconMap: {[key: string]: React.ElementType} = { languages: Languages, achievements: Star, publications: Book };
            return (
              <div className="mt-6">
                 <TitleComponent value={content.title} icon={textIconMap[section.type]} titleClass={templateContext.titleClass} />
                <p className="whitespace-pre-wrap text-sm">{content.text}</p>
              </div>
            );
            case 'image':
              if(!content.src) return null;
              return (
                  <div className="mt-6">
                      <div className="w-full" style={{ width: `${content.width}%`}}>
                          <Image src={content.src} alt={content.title || "Uploaded image"} width={600} height={400} className="w-full h-auto object-cover border-2" />
                      </div>
                  </div>
              );
           case 'subtitle':
                if(!content.text) return null;
                return <h3 className="text-lg font-semibold mt-4">{content.text}</h3>;
            case 'line_break':
                return <Separator className="my-4 bg-border/50" />;
          default:
            return null;
        }
    };
  
  const renderTemplate = (resumeDataToRender: DocumentData) => {
    const { sections, styling } = resumeDataToRender;
    const templateId = styling.template;

    if (templateId === 'classic') {
          const headerSection = sections.find((s: any) => s.type === 'header');
          const headerContent = headerSection ? resumeDataToRender.content[headerSection.id] : {};
          const contactSection = sections.find((s: any) => s.type === 'contact');
          const contactContent = contactSection ? resumeDataToRender.content[contactSection.id] : {};
          const socialsSection = sections.find((s: any) => s.type === 'socials');
          const socialItems = socialsSection ? (resumeDataToRender.content[socialsSection.id]?.items || []) : [];
          const githubItem = socialItems.find((i: any) => i.platform === 'github');
          const linkedinItem = socialItems.find((i: any) => i.platform === 'linkedin');

          return (
            <div className="p-10 space-y-6">
              <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: styling.accentColor }}>{headerContent.name}</h1>
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {contactContent.email && <div className="flex items-center gap-1"><Mail className="h-4 w-4"/><p>{contactContent.email}</p></div>}
                  {contactContent.phone && <div className="flex items-center gap-1"><Phone className="h-4 w-4"/><p>{contactContent.phone}</p></div>}
                  {githubItem?.username && <div className="flex items-center gap-1"><Github className="h-4 w-4"/><p>{githubItem.username}</p></div>}
                  {linkedinItem?.username && <div className="flex items-center gap-1"><Linkedin className="h-4 w-4"/><p>{linkedinItem.username}</p></div>}
                </div>
              </header>
              <Separator className="bg-border/30" />
              {sections.filter((s: any) => s.type !== 'header' && s.type !== 'contact' && s.type !== 'socials').map((section: any) => <div key={section.id}>{renderSectionComponent(section)}</div>)}
            </div>
          );
    }
    
    // Default/Fallback template renderer
    return (
        <div className="p-8">
            {sections.map((section: any) => (
                <div key={section.id}>
                    {renderSectionComponent(section)}
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
    '--font-headline': styling.fontFamily,
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--resume-background)',
    color: 'var(--resume-foreground)',
    aspectRatio: '1 / 1.4142',
    margin: 'auto'
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
      <div className="relative h-full w-full overflow-auto">
        {renderTemplate(resumeData)}
      </div>
    </div>
  );
}
