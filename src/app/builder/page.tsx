
// src/app/builder/page.tsx
'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
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
  Trash2,
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
import { Slider } from '@/components/ui/slider';

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
  { name: 'Minimalist', image: 'https://placehold.co/150x212.png', hint: 'resume template' },
  { name: 'Modern', image: 'https://placehold.co/150x212.png', hint: 'modern resume' },
  { name: 'Creative', image: 'https://placehold.co/150x212.png', hint: 'creative resume' },
  { name: 'Academic', image: 'https://placehold.co/150x212.png', hint: 'academic resume' },
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
  const baseId = id.split('_')[0];
  const isRemovable = baseId !== 'header';

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
       <div {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical />
       </div>
       {isRemovable && (
         <button onClick={() => onRemove(id)} className="absolute -right-2 -top-2 h-6 w-6 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <X className="h-4 w-4" />
         </button>
       )}
      {children}
    </div>
  );
}

const DroppableCanvas = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'resume-canvas-droppable' });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-4 rounded-lg',
        isOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {children}
    </div>
  );
};


const createNewItem = (itemType) => {
    const common = { id: `${itemType}_item_${Date.now()}` };
    switch (itemType) {
        case 'experience':
            return { ...common, company: '', role: '', dates: '', description: '• ' };
        case 'projects':
            return { ...common, name: '', tech: '', dates: '', description: '• ' };
        case 'education':
            return { ...common, institution: '', degree: '', dates: '', description: '' };
        case 'certifications':
            return { ...common, name: '', issuer: '', date: '' };
        default:
            return { ...common, text: '' };
    }
};

export default function BuilderPage() {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeId, setActiveId] = useState(null);
  
  const [resumeData, setResumeData] = useState(() => ({
     sections: [
        {id: 'header_1', type: 'header'},
        {id: 'summary_1', type: 'summary'},
        {id: 'experience_1', type: 'experience'}
     ],
     content: {
        header_1: { name: 'Your Name', tagline: 'Your Tagline or Role', avatar: '' },
        summary_1: { title: 'Summary', text: '' },
        experience_1: {
            title: 'Experience',
            items: [
                { id: 'exp_item_1', company: 'Company Name', role: 'Job Title', dates: 'Month Year - Present', description: '• Your achievements here.' }
            ]
        }
     }
  }));

  const { theme } = useTheme();

  const [styling, setStyling] = useState({
      primaryColor: '#1d4ed8',
      backgroundColorLight: '#ffffff',
      backgroundColorDark: '#1f2937',
      fontFamily: 'var(--font-inter)',
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundBrightness: 100,
  });

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const resumeSectionsIds = resumeData.sections.map(s => s.id);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleStyleChange = (property, value) => {
    setStyling(prev => ({ ...prev, [property]: value }));
  };

  const handleContentChange = (sectionId, field, value) => {
    setResumeData(prev => ({
        ...prev,
        content: {
            ...prev.content,
            [sectionId]: {
                ...prev.content[sectionId],
                [field]: value
            }
        }
    }));
  };

  const handleListItemChange = (sectionId, itemIndex, field, value) => {
      setResumeData(prev => {
          const newItems = [...prev.content[sectionId].items];
          newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
          return {
              ...prev,
              content: {
                  ...prev.content,
                  [sectionId]: {
                      ...prev.content[sectionId],
                      items: newItems
                  }
              }
          };
      });
  };

  const addListItem = (sectionId, itemType) => {
      setResumeData(prev => {
          const newItem = createNewItem(itemType);
          const newItems = [...(prev.content[sectionId].items || []), newItem];
          return {
              ...prev,
              content: {
                  ...prev.content,
                  [sectionId]: {
                      ...prev.content[sectionId],
                      items: newItems
                  }
              }
          };
      });
  };

  const removeListItem = (sectionId, itemIndex) => {
      setResumeData(prev => {
          const newItems = [...prev.content[sectionId].items];
          newItems.splice(itemIndex, 1);
          return {
              ...prev,
              content: {
                  ...prev.content,
                  [sectionId]: {
                      ...prev.content[sectionId],
                      items: newItems
                  }
              }
          };
      });
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

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const headerSectionId = resumeData.sections.find(s => s.type === 'header')?.id;
              if (headerSectionId) {
                  handleContentChange(headerSectionId, 'avatar', reader.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };


  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) return;
  
    const isSidebarItem = allSectionsMap.has(active.id);
    const isCanvasItem = resumeSectionsIds.includes(active.id);
  
    const isDroppingOnCanvas = over.id === 'resume-canvas-droppable';
    const isDroppingOnCanvasItem = resumeSectionsIds.includes(over.id);
  
    if (isSidebarItem && (isDroppingOnCanvas || isDroppingOnCanvasItem)) {
      const newSectionType = active.id;
      const newSectionId = `${newSectionType}_${Date.now()}`;
      const newSectionData = { id: newSectionId, type: newSectionType };
      
      let defaultContent = { title: allSectionsMap.get(newSectionType)?.name || 'New Section' };
      if (newSectionType === 'line_break' || newSectionType === 'subtitle') {
          defaultContent = { text: '' };
      } else if (['experience', 'education', 'projects', 'certifications'].includes(newSectionType)) {
          defaultContent.items = [];
      } else if (newSectionType === 'header') {
          defaultContent.name = 'Your Name';
          defaultContent.tagline = 'Your Role';
          defaultContent.avatar = '';
      }
  
      setResumeData(prev => ({
          sections: [...prev.sections, newSectionData],
          content: { ...prev.content, [newSectionId]: defaultContent }
      }));
    } else if (isCanvasItem && isDroppingOnCanvasItem) {
      if (active.id !== over.id) {
        const activeIndex = resumeData.sections.findIndex(s => s.id === active.id);
        const overIndex = resumeData.sections.findIndex(s => s.id === over.id);
        setResumeData((prev) => ({
          ...prev,
          sections: arrayMove(prev.sections, activeIndex, overIndex),
        }));
      }
    }
  };
  

  const removeSection = (idToRemove) => {
    setResumeData(prev => {
        const newContent = { ...prev.content };
        delete newContent[idToRemove];
        return {
            sections: prev.sections.filter(section => section.id !== idToRemove),
            content: newContent
        };
    });
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
    const content = resumeData.content[section.id] || {};
  
    switch (section.type) {
      case 'header':
        return (
          <div className="text-center flex flex-col items-center gap-4">
              <div className="relative group w-32 h-32">
                  <Image
                      src={content.avatar || 'https://placehold.co/128x128.png'}
                      alt="Avatar"
                      width={128}
                      height={128}
                      data-ai-hint="placeholder"
                      className="rounded-full object-cover w-32 h-32 border-2 border-primary/50"
                  />
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-8 w-8" />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
            <Input
              value={content.name}
              onChange={(e) => handleContentChange(section.id, 'name', e.target.value)}
              className="text-4xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
              style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
            />
            <Input
              value={content.tagline}
              onChange={(e) => handleContentChange(section.id, 'tagline', e.target.value)}
              className="text-muted-foreground p-0 border-0 h-auto text-center focus-visible:ring-0 bg-transparent"
            />
          </div>
        );
      case 'summary':
      case 'cover_letter':
          return (
              <div className="mt-6">
                  <Input value={content.title} onChange={(e) => handleContentChange(section.id, 'title', e.target.value)} className="text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent inline-block w-auto mb-2" style={{ borderBottom: '2px solid var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))' }} />
                  <Textarea value={content.text} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`Content for ${content.title}...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />
              </div>
          );
      case 'experience':
      case 'projects':
      case 'education':
      case 'certifications':
        const itemType = section.type.slice(0, -1);
        return (
            <div className="mt-6">
                 <Input value={content.title} onChange={(e) => handleContentChange(section.id, 'title', e.target.value)} className="text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent inline-block w-auto mb-2" style={{ borderBottom: '2px solid var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))' }} />
                 <div className="space-y-4">
                     {(content.items || []).map((item, index) => (
                         <div key={item.id} className="relative group/item pl-4 border-l-2 border-border/50">
                             <button onClick={() => removeListItem(section.id, index)} className="absolute top-0 -right-2 h-5 w-5 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-3 w-3" /></button>
                             {section.type === 'education' && (
                                 <>
                                     <Input placeholder="Institution Name" value={item.institution} onChange={(e) => handleListItemChange(section.id, index, 'institution', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     <Input placeholder="Degree or Field of Study" value={item.degree} onChange={(e) => handleListItemChange(section.id, index, 'degree', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                 </>
                             )}
                             {section.type === 'experience' && (
                                 <>
                                     <Input placeholder="Company Name" value={item.company} onChange={(e) => handleListItemChange(section.id, index, 'company', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     <Input placeholder="Your Role" value={item.role} onChange={(e) => handleListItemChange(section.id, index, 'role', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                 </>
                             )}
                             {section.type === 'projects' && (
                                  <>
                                     <Input placeholder="Project Name" value={item.name} onChange={(e) => handleListItemChange(section.id, index, 'name', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     <Input placeholder="Tech Stack" value={item.tech} onChange={(e) => handleListItemChange(section.id, index, 'tech', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-sm text-muted-foreground" />
                                 </>
                             )}
                              {section.type === 'certifications' && (
                                 <>
                                     <Input placeholder="Certification Name" value={item.name} onChange={(e) => handleListItemChange(section.id, index, 'name', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     <Input placeholder="Issuing Organization" value={item.issuer} onChange={(e) => handleListItemChange(section.id, index, 'issuer', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                 </>
                             )}
                             <Input placeholder="Dates (e.g., 2020 - 2024)" value={item.dates} onChange={(e) => handleListItemChange(section.id, index, 'dates', e.target.value)} className="text-sm text-muted-foreground border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                             {section.type !== 'certifications' && <Textarea placeholder="Description or key achievements..." value={item.description} onChange={(e) => handleListItemChange(section.id, index, 'description', e.target.value)} className="text-sm mt-1 bg-transparent border-0 focus-visible:ring-0 p-0" />}
                         </div>
                     ))}
                     <Button variant="outline" size="sm" className="mt-2" onClick={() => addListItem(section.id, itemType)}>
                         <Plus className="h-4 w-4 mr-2" /> Add Entry
                     </Button>
                 </div>
            </div>
        );
       case 'skills':
       case 'languages':
       case 'achievements':
       case 'publications':
        return (
          <div className="mt-6">
             <Input
                value={content.title}
                onChange={(e) => handleContentChange(section.id, 'title', e.target.value)}
                className="text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent inline-block w-auto mb-2"
                style={{ borderBottom: '2px solid var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
            />
            <Textarea value={content.text} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`e.g., Python, JavaScript, Public Speaking...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />
          </div>
        );
       case 'subtitle':
            return (
                <div className="mt-4">
                    <Input 
                        value={content.text}
                        onChange={(e) => handleContentChange(section.id, 'text', e.target.value)}
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
            <h2 className="text-xl font-bold mb-2 border-b-2 inline-block" style={{borderColor: 'var(--resume-primary)', fontFamily: 'var(--resume-font-headline, var(--font-headline))'}}>{content?.title}</h2>
             <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground">
              This is a placeholder for the {content?.title} section.
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
  };

  const resumeBgStyle = {
    backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: `blur(${styling.backgroundBlur}px) brightness(${styling.backgroundBrightness}%)`,
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
                      <button key={template.name} className="block text-left group">
                      <Card className="overflow-hidden cursor-pointer group-hover:border-primary transition-all border-2 border-transparent group-focus:border-primary group-focus:ring-2 group-focus:ring-primary/50">
                        <Image src={template.image} alt={template.name} width={150} height={212} className="w-full h-auto object-cover" data-ai-hint={template.hint} />
                        <p className="p-2 text-sm text-center font-medium bg-card">{template.name}</p>
                      </Card>
                      </button>
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
                      {styling.backgroundImage && (
                          <div className="mt-4 space-y-4">
                              <div>
                                  <Label htmlFor="bgBlur" className="text-sm">Blur</Label>
                                  <Slider id="bgBlur" min={0} max={20} step={1} value={[styling.backgroundBlur]} onValueChange={(val) => handleStyleChange('backgroundBlur', val[0])} />
                              </div>
                              <div>
                                  <Label htmlFor="bgBrightness" className="text-sm">Brightness</Label>
                                  <Slider id="bgBrightness" min={20} max={100} step={5} value={[styling.backgroundBrightness]} onValueChange={(val) => handleStyleChange('backgroundBrightness', val[0])} />
                              </div>
                          </div>
                      )}
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
              <div className="w-full max-w-4xl mx-auto">
                <Card className="w-full aspect-[8.5/11] shadow-lg transition-colors duration-300 relative overflow-hidden" id="resume-preview-wrapper" style={resumeStyle}>
                    <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
                    <CardContent id="resume-preview" className="p-8 text-foreground relative h-full">
                    <DroppableCanvas>
                      <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                          {resumeData.sections.map((section) => (
                             <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                              {renderSection(section)}
                            </SortableResumeSection>
                          ))}
                      </SortableContext>
                    </DroppableCanvas>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </main>
          <DragOverlay>
            {activeId && allSectionsMap.has(activeId) ? (
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
