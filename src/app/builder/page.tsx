// src/app/builder/page.tsx
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle,
  Award,
  Book,
  Bot,
  Briefcase,
  CheckCircle,
  Code,
  Copy,
  Download,
  FileText,
  Github,
  GraduationCap,
  GripVertical,
  Languages,
  Loader2,
  Link as LinkIcon,
  MapPin,
  Palette,
  QrCode,
  Save,
  Share2,
  Sparkles,
  Star,
  User,
  Video,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAiPoweredResumeRecommendations } from '@/ai/flows/smart-recommendations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Wrapper to prevent hydration errors with dnd-kit
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

const initialSections = {
  Standard: [
    { id: 'header', icon: <User />, name: 'Header' },
    { id: 'summary', icon: <FileText />, name: 'Summary' },
    { id: 'education', icon: <GraduationCap />, name: 'Education' },
    { id: 'experience', icon: <Briefcase />, name: 'Experience' },
    { id: 'skills', icon: <Sparkles />, name: 'Skills' },
    { id: 'projects', icon: <Code />, name: 'Projects' },
    { id: 'certifications', icon: <Award />, name: 'Certifications' },
    { id: 'languages', icon: <Languages />, name: 'Languages' },
  ],
  Advanced: [
    { id: 'publications', icon: <Book />, name: 'Publications' },
    { id: 'achievements', icon: <Star />, name: 'Achievements' },
    { id: 'cover_letter', icon: <Bot />, name: 'Cover Letter' },
  ],
};

const allSectionsMap = new Map(
  [...initialSections.Standard, ...initialSections.Advanced].map((s) => [
    s.id,
    s,
  ])
);

const templates = [
  { name: 'Minimalist', image: 'https://placehold.co/150x212' },
  { name: 'Modern', image: 'https://placehold.co/150x212' },
  { name: 'Creative', image: 'https://placehold.co/150x212' },
  { name: 'Academic', image: 'https://placehold.co/150x212' },
];

const fonts = [
  { name: 'Inter', family: 'var(--font-inter)' },
  { name: 'Space Grotesk', family: 'var(--font-space-grotesk)' },
  { name: 'Roboto', family: 'var(--font-roboto)' },
  { name: 'Lato', family: 'var(--font-lato)' },
  { name: 'Montserrat', family: 'var(--font-montserrat)' },
];

const colors = [
  { name: 'Default', value: '244 46% 48%' },
  { name: 'Emerald', value: '145 63% 42%' },
  { name: 'Rose', value: '346 78% 52%' },
  { name: 'Amber', value: '45 93% 47%' },
  { name: 'Slate', value: '215 28% 17%' },
];

function DraggableSection({ id, name, icon }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center p-2 cursor-grab',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
      {React.cloneElement(icon, { className: 'h-5 w-5 mr-3 text-primary' })}
      <span className="text-sm font-medium">{name}</span>
    </Card>
  );
}

function SortableResumeSection({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
       <GripVertical className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
      {children}
    </div>
  );
}

export default function BuilderPage() {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeId, setActiveId] = useState(null);
  const [resumeSections, setResumeSections] = useState(['header', 'summary', 'experience']);
  const [activeColor, setActiveColor] = useState(colors[0].value);
  const [activeFont, setActiveFont] = useState(fonts[0].family);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleColorChange = (colorValue) => {
    document.documentElement.style.setProperty('--primary', colorValue);
    setActiveColor(colorValue);
  };

  const handleFontChange = (fontFamily) => {
    document.documentElement.style.setProperty('--font-body', fontFamily);
    document.documentElement.style.setProperty('--font-headline', fontFamily);
    setActiveFont(fontFamily);
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    // Check if dragging from sidebar to canvas
    const isSidebarItem = allSectionsMap.has(active.id);
    const isOverCanvas = over.id === 'resume-canvas-container' || over.id === 'resume-canvas' || resumeSections.includes(over.id);

    if (isSidebarItem && isOverCanvas && !resumeSections.includes(active.id)) {
        const overIndex = over.id ? resumeSections.indexOf(over.id as string) : -1;
        if (overIndex !== -1) {
            setResumeSections((items) => {
                const newItems = [...items];
                newItems.splice(overIndex + 1, 0, active.id as string);
                return newItems;
            });
        } else {
            setResumeSections((items) => [...items, active.id as string]);
        }
    } else {
        // Reordering within the canvas
        const activeIndex = resumeSections.indexOf(active.id as string);
        const overIndex = resumeSections.indexOf(over.id as string);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            setResumeSections((items) => arrayMove(items, activeIndex, overIndex));
        }
    }
  };


  const handleGetSuggestions = () => {
    startTransition(async () => {
      try {
        const response = await getAiPoweredResumeRecommendations({ jobTitle: 'Software Engineer', industry: 'Technology' });
        toast({
            title: 'AI Suggestions Ready!',
            description: (
              <ul className="list-disc pl-5">
                {response.bulletPoints.slice(0, 3).map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
            )
        });
      } catch (error) {
        console.error('Error getting AI suggestions:', error);
        toast({
          title: 'Error',
          description: 'Failed to get AI suggestions. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

   const exportAsPDF = () => {
    const resumeElement = document.getElementById('resume-preview');
    if (resumeElement) {
      html2canvas(resumeElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfWidth / ratio : height);
        pdf.save('resume.pdf');
      });
    }
  };


  const renderSection = (id) => {
    switch (id) {
      case 'header':
        return (
          <div className="text-center">
            <Input
              defaultValue="Your Name"
              className="text-4xl font-bold font-headline h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
            />
            <Input
              defaultValue="Your Tagline or Role"
              className="text-muted-foreground p-0 border-0 h-auto text-center focus-visible:ring-0 bg-transparent"
            />
          </div>
        );
      case 'summary':
        return (
          <div>
            <h2 className="text-xl font-bold font-headline mb-2 border-b-2 border-primary inline-block">Summary</h2>
            <Textarea placeholder="Write a powerful summary to grab attention..." className="bg-transparent border-0 focus-visible:ring-0 p-0" />
          </div>
        );
      case 'experience':
        return (
          <div className="mt-6">
            <h2 className="text-xl font-bold font-headline mb-2 border-b-2 border-primary inline-block">Experience</h2>
            <Textarea placeholder="Detail your professional experience..." className="bg-transparent border-0 focus-visible:ring-0 p-0"/>
          </div>
        );
      default:
        const section = allSectionsMap.get(id);
        return (
          <div className="mt-6">
            <h2 className="text-xl font-bold font-headline mb-2 border-b-2 border-primary inline-block">{section?.name}</h2>
            <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground">
              {section?.name} section content goes here.
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setResumeSections(rs => rs.filter(s => s !== id))}>
                <X className="mr-2 h-4 w-4"/> Remove
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <ClientOnly>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TooltipProvider>
        <div className="flex h-screen bg-muted/40" style={{ fontFamily: activeFont }}>
          {/* Sidebar */}
          <aside className="w-80 border-r bg-background">
            <Tabs defaultValue="content" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1">
                <TabsContent value="content" className="p-4">
                  <h3 className="mb-4 text-lg font-semibold">Resume Sections</h3>
                   <SortableContext items={[...initialSections.Standard, ...initialSections.Advanced].map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Standard</h4>
                      {initialSections.Standard.map((block) => (
                        <DraggableSection key={block.id} {...block} />
                      ))}
                    </div>
                  
                  <Separator className="my-4" />
                   
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Advanced</h4>
                      {initialSections.Advanced.map((block) => (
                         <DraggableSection key={block.id} {...block} />
                      ))}
                    </div>
                  </SortableContext>
                </TabsContent>
                <TabsContent value="marketplace" className="p-4">
                  <h3 className="mb-4 text-lg font-semibold">Select a Template</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map(template => (
                      <Card key={template.name} className="overflow-hidden cursor-pointer hover:border-primary">
                        <img src={template.image} alt={template.name} className="w-full h-auto object-cover" />
                        <p className="p-2 text-sm text-center font-medium">{template.name}</p>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="design" className="p-4 space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <Tooltip key={color.name}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleColorChange(color.value)}
                              className="h-8 w-8 rounded-full cursor-pointer border-2"
                              style={{
                                backgroundColor: `hsl(${color.value})`,
                                borderColor: activeColor === color.value ? `hsl(${color.value})` : 'transparent',
                              }}
                            ></button>
                          </TooltipTrigger>
                          <TooltipContent><p>{color.name}</p></TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Fonts</h3>
                    <div className="space-y-2">
                      {fonts.map(font => (
                        <Button
                          key={font.name}
                          variant={activeFont === font.family ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => handleFontChange(font.family)}
                          style={{ fontFamily: font.family }}
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>

          {/* Main Canvas */}
          <main className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-2 border-b bg-background">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{saveStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon"> <AlertCircle className="h-5 w-5" /> </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>ATS Compliance: Good</p></TooltipContent>
                </Tooltip>
                <Button variant="outline" size="sm" onClick={() => { setSaveStatus('Saving...'); setTimeout(() => setSaveStatus('Saved'), 1000)}}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Share Your Resume</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="share-link">Shareable Link</Label>
                        <div className="flex gap-2">
                            <Input id="share-link" defaultValue="https://launchboard.dev/share/your-unique-id" readOnly />
                            <Button onClick={() => navigator.clipboard.writeText('https://launchboard.dev/share/your-unique-id')}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
                 <Button size="sm" variant="outline" onClick={exportAsPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
              </div>
            </header>
            <ScrollArea className="flex-1 p-8" id="resume-canvas-container">
              <div id="resume-canvas" className="w-full max-w-4xl mx-auto">
                <Card className="w-full aspect-[8.5/11] shadow-lg" id="resume-preview">
                  <CardContent className="p-8">
                    <SortableContext items={resumeSections} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {resumeSections.map((id) => (
                           <SortableResumeSection key={id} id={id}>
                            {renderSection(id)}
                          </SortableResumeSection>
                        ))}
                      </div>
                    </SortableContext>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </main>
          <DragOverlay>
            {activeId && allSectionsMap.get(activeId) ? (
              <Card
                className='flex items-center p-2 cursor-grabbing opacity-80'
              >
                <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                {React.cloneElement(allSectionsMap.get(activeId).icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                <span className="text-sm font-medium">{allSectionsMap.get(activeId).name}</span>
              </Card>
            ) : null}
          </DragOverlay>

          {/* AI Sidebar */}
          <aside className="w-72 border-l bg-background p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-6 w-6 text-primary" />
                  Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered help to improve your resume. Enter a job title and industry for tailored suggestions.
                </p>
                <Button className="w-full mt-4" onClick={handleGetSuggestions} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                  Suggest Bullet Points
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </TooltipProvider>
    </DndContext>
    </ClientOnly>
  );
}
