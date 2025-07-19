// src/app/builder/page.tsx
'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
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
  Minus,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  QrCode,
  Save,
  Share2,
  Sparkles,
  Star,
  Type,
  User,
  Video,
  X,
  Image as ImageIcon,
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAiPoweredResumeRecommendations } from '@/ai/flows/smart-recommendations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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

const initialSections = [
    { id: 'header', icon: <User />, name: 'Header' },
    { id: 'summary', icon: <FileText />, name: 'Summary' },
    { id: 'education', icon: <GraduationCap />, name: 'Education' },
    { id: 'experience', icon: <Briefcase />, name: 'Experience' },
    { id: 'skills', icon: <Sparkles />, name: 'Skills' },
    { id: 'projects', icon: <Code />, name: 'Projects' },
    { id: 'certifications', icon: <Award />, name: 'Certifications' },
    { id: 'languages', icon: <Languages />, name: 'Languages' },
    { id: 'publications', icon: <Book />, name: 'Publications' },
    { id: 'achievements', icon: <Star />, name: 'Achievements' },
    { id: 'cover_letter', icon: <Bot />, name: 'Cover Letter' },
    { id: 'subtitle', icon: <Type />, name: 'Subtitle' },
    { id: 'line_break', icon: <Minus/>, name: 'Line Break' },
];


const allSectionsMap = new Map(
  initialSections.map((s) => [
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
  { name: 'Poppins', family: 'var(--font-poppins)' },
  { name: 'Open Sans', family: 'var(--font-open-sans)' },
  { name: 'Merriweather', family: 'var(--font-merriweather)' },
  { name: 'Playfair Display', family: 'var(--font-playfair-display)' },
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

function SortableResumeSection({ id, children, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
       <div {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical />
       </div>
       {id !== 'header' && (
         <button onClick={() => onRemove(id)} className="absolute -right-2 -top-2 h-6 w-6 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" />
         </button>
       )}
      {children}
    </div>
  );
}


export default function BuilderPage() {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeId, setActiveId] = useState(null);
  const [resumeData, setResumeData] = useState({
     sections: [
        {id: 'header', title: 'Header'},
        {id: 'summary', title: 'Summary'},
        {id: 'experience', title: 'Experience'}
     ],
     content: {}
  });

  const { theme } = useTheme();

  const [styling, setStyling] = useState({
      primaryColor: '#1d4ed8',
      backgroundColorLight: '#ffffff',
      backgroundColorDark: '#111827',
      fontFamily: 'var(--font-inter)',
      backgroundImage: '',
  });

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const resumeSectionsIds = resumeData.sections.map(s => s.id);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleStyleChange = (property, value) => {
    setStyling(prev => ({ ...prev, [property]: value }));
  };

  const handleFontChange = (fontFamily) => {
    handleStyleChange('fontFamily', fontFamily);
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleStyleChange('backgroundImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
  
    // This is the ID of the droppable container for the resume canvas
    const resumeCanvasDroppableId = 'resume-canvas-droppable';
    
    const isSidebarItem = allSectionsMap.has(active.id);
    // Check if dropping over the droppable container OR any existing item on the canvas
    const isOverCanvas = over.id === resumeCanvasDroppableId || resumeSectionsIds.includes(over.id);
  
    if (isSidebarItem && isOverCanvas) {
      // Adding a new item from the sidebar
      const newSection = allSectionsMap.get(active.id);
      // Generate a unique ID for the new section to allow multiple instances
      const newSectionData = { id: `${newSection.id}_${Date.now()}`, title: newSection.name };
      
      const overIndex = resumeData.sections.findIndex(s => s.id === over.id);
      
      setResumeData((prev) => {
        const newSections = [...prev.sections];
        if (overIndex !== -1) {
          // If dropped on an existing section, insert after it
          newSections.splice(overIndex + 1, 0, newSectionData);
        } else {
          // If dropped on the container itself or empty space, add to the end
          newSections.push(newSectionData);
        }
        return { ...prev, sections: newSections };
      });
    } else if (resumeSectionsIds.includes(active.id)) {
      // Reordering an existing item on the canvas
      const activeIndex = resumeData.sections.findIndex(s => s.id === active.id);
      const overIndex = resumeData.sections.findIndex(s => s.id === over.id);
  
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setResumeData((prev) => ({
          ...prev,
          sections: arrayMove(prev.sections, activeIndex, overIndex),
        }));
      }
    }
  };

  const removeSection = (idToRemove) => {
    setResumeData(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== idToRemove)
    }));
  };

  const updateSectionTitle = (id, newTitle) => {
    setResumeData(prev => ({
        ...prev,
        sections: prev.sections.map(section => 
            section.id === id ? { ...section, title: newTitle } : section
        )
    }));
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
      html2canvas(resumeElement, { scale: 2, backgroundColor: null, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth;
        let height = width / ratio;
        if (height > pdfHeight) {
            height = pdfHeight;
            width = height * ratio;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('resume.pdf');
      });
    }
  };


  const renderSection = (section) => {
    const baseId = section.id.split('_')[0];
    switch (baseId) {
      case 'header':
        return (
          <div className="text-center">
            <Input
              defaultValue="Your Name"
              className="text-4xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
              style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
            />
            <Input
              defaultValue="Your Tagline or Role"
              className="text-muted-foreground p-0 border-0 h-auto text-center focus-visible:ring-0 bg-transparent"
            />
          </div>
        );
       case 'summary':
       case 'experience':
       case 'skills':
       case 'projects':
       case 'certifications':
       case 'languages':
       case 'publications':
       case 'achievements':
       case 'cover_letter':
        return (
          <div className="mt-6">
             <Input
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent inline-block w-auto mb-2"
                style={{ borderBottom: '2px solid var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
            />
            <Textarea placeholder={`Content for ${section.title}...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />
          </div>
        );
       case 'subtitle':
            return (
                <div className="mt-4">
                    <Input 
                        placeholder="Subtitle"
                        className="text-lg font-semibold p-0 border-0 h-auto focus-visible:ring-0 bg-transparent"
                    />
                </div>
            );
        case 'line_break':
            return <Separator className="my-4 bg-border/50" />;
      default:
        return (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 border-b-2 inline-block" style={{borderColor: 'var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))'}}>{section?.title}</h2>
             <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground">
              This is a placeholder for the {section?.title} section.
            </div>
          </div>
        );
    }
  };

  const resumeStyle = {
    '--resume-primary': styling.primaryColor,
    '--resume-background': theme === 'dark' ? styling.backgroundColorDark : styling.backgroundColorLight,
    '--resume-font-family': styling.fontFamily,
    '--resume-font-headline': styling.fontFamily,
    fontFamily: 'var(--resume-font-family)',
    backgroundColor: 'var(--resume-background)',
    backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <ClientOnly>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-4rem)] bg-muted/40">
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
                   <SortableContext items={initialSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {initialSections.map((block) => (
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
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="primaryColor">Primary Color</Label>
                                <Input id="primaryColor" type="color" value={styling.primaryColor} onChange={(e) => handleStyleChange('primaryColor', e.target.value)} className="w-24 p-1 h-8" />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="bgColorLight">Background (Light)</Label>
                                <Input id="bgColorLight" type="color" value={styling.backgroundColorLight} onChange={(e) => handleStyleChange('backgroundColorLight', e.target.value)} className="w-24 p-1 h-8" />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="bgColorDark">Background (Dark)</Label>
                                <Input id="bgColorDark" type="color" value={styling.backgroundColorDark} onChange={(e) => handleStyleChange('backgroundColorDark', e.target.value)} className="w-24 p-1 h-8" />
                            </div>
                        </div>
                    </div>
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Fonts</h3>
                    <Select onValueChange={handleFontChange} defaultValue={styling.fontFamily}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                            {fonts.map(font => (
                                <SelectItem key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                                    {font.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div>
                      <h3 className="mb-4 text-lg font-semibold">Background Image</h3>
                      <Input id="bgImage" type="file" accept="image/*" onChange={handleBackgroundImageUpload} className="text-sm" />
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
                <Card className="w-full aspect-[8.5/11] shadow-lg transition-colors duration-300" id="resume-preview" style={resumeStyle}>
                  <CardContent className="p-8 text-foreground">
                    <SortableContext id="resume-canvas-droppable" items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {resumeData.sections.map((section) => (
                           <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                            {renderSection(section)}
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
            {activeId && allSectionsMap.has(activeId.split('_')[0]) ? (
              <Card
                className='flex items-center p-2 cursor-grabbing opacity-80'
              >
                <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                {React.cloneElement(allSectionsMap.get(activeId.split('_')[0]).icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                <span className="text-sm font-medium">{allSectionsMap.get(activeId.split('_')[0]).name}</span>
              </Card>
            ) : null}
          </DragOverlay>

          {/* AI Sidebar */}
          <aside className={cn("border-l bg-background transition-all duration-300 ease-in-out", isAiPanelOpen ? "w-72 p-4" : "w-0 p-0")}>
            {isAiPanelOpen ? (
                <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        Smart Suggestions
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(false)}>
                        <PanelRightClose />
                    </Button>
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
            ) : (
                <div className="flex items-center h-full p-2">
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(true)}>
                                <PanelRightOpen />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Open Smart Suggestions</p></TooltipContent>
                    </Tooltip>
                </div>
            )}
          </aside>
        </div>
      </TooltipProvider>
    </DndContext>
    </ClientOnly>
  );
}
