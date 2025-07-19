
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
  Link as LinkIcon,
  Linkedin,
  Minus,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Phone,
  Plus,
  Quote,
  Save,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Twitter,
  Type,
  User,
  X,
  Image as ImageIcon,
  Loader2,
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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    { id: 'contact', icon: <Phone />, name: 'Contact' },
    { id: 'education', icon: <GraduationCap />, name: 'Education' },
    { id: 'experience', icon: <Briefcase />, name: 'Experience' },
    { id: 'skills', icon: <Sparkles />, name: 'Skills' },
    { id: 'projects', icon: <Code />, name: 'Projects' },
    { id: 'certifications', icon: <Award />, name: 'Certifications' },
    { id: 'languages', icon: <Languages />, name: 'Languages' },
    { id: 'publications', icon: <Book />, name: 'Publications' },
    { id: 'achievements', icon: <Star />, name: 'Achievements' },
    { id: 'links', icon: <LinkIcon />, name: 'Links' },
    { id: 'recommendations', icon: <Quote />, name: 'Recommendations' },
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
  { name: 'Minimalist', id: 'minimalist', image: 'https://placehold.co/150x212.png', hint: 'minimalist resume' },
  { name: 'Horizontal Split', id: 'horizontal-split', image: 'https://placehold.co/150x212.png', hint: 'resume template' },
  { name: 'Vertical Split', id: 'vertical-split', image: 'https://placehold.co/150x212.png', hint: 'modern resume' },
  { name: 'Creative', id: 'creative', image: 'https://placehold.co/150x212.png', hint: 'creative resume' },
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

const lightBgColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Cream', value: '#fdf8f0' },
    { name: 'Off-White', value: '#f8f8f8' },
];

const darkBgColors = [
    { name: 'Ash', value: '#2d3748' },
    { name: 'Dark Blue', value: '#1a202c' },
    { name: 'Black', value: '#111111' },
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
    <div ref={setNodeRef} style={style} className="relative group">
       <div {...attributes} {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
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
        'h-full w-full',
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
        case 'links':
            return { ...common, text: 'Social Link', url: '' };
        case 'recommendations':
            return { ...common, author: '', text: '' };
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
        header_1: { name: 'Your Name', tagline: 'Your Tagline or Role', avatar: '', showAvatar: true, links: [] },
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
      template: 'minimalist',
      accentColor: '#FFB700',
      accentTextColor: '#ffffff',
      backgroundColorLight: '#ffffff',
      backgroundColorDark: '#1a202c',
      fontFamily: 'var(--font-inter)',
      backgroundImage: '',
      accentPattern: '',
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
          const newItems = [...(prev.content[sectionId]?.items || []), newItem];
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
  
    const handleAccentPatternUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleStyleChange('accentPattern', reader.result as string);
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

      if (['experience', 'education', 'projects', 'certifications', 'links', 'recommendations'].includes(newSectionType)) {
          defaultContent.items = [];
      } else if (newSectionType === 'header') {
          defaultContent = { name: 'Your Name', tagline: 'Your Role', avatar: '', showAvatar: true, links: [] };
      } else if (newSectionType === 'contact') {
          defaultContent = { title: 'Contact', phone: '', email: '', address: '' };
      } else {
        defaultContent.text = '';
      }
  
      const overIndex = isDroppingOnCanvasItem ? resumeData.sections.findIndex(s => s.id === over.id) : resumeData.sections.length;
      const newSections = [...resumeData.sections];
      newSections.splice(overIndex, 0, newSectionData);

      setResumeData(prev => ({
          sections: newSections,
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
  
    const renderSectionComponent = (section, templateContext = {}) => {
        const content = resumeData.content[section.id] || {};
        const { isAccentBg } = templateContext;

        const TitleInput = ({value, onChange, ...props}) => (
             <Input 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent inline-block w-auto mb-2" 
                style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', ...props.style }}
             />
        );

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
                                style={{borderColor: 'var(--resume-accent-color)'}}
                            />
                            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="h-8 w-8" />
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                    )}
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
                   <div className="flex items-center justify-center gap-2 mt-2">
                        <Label htmlFor={`show-avatar-${section.id}`}>Show Avatar</Label>
                        <Switch
                            id={`show-avatar-${section.id}`}
                            checked={content.showAvatar}
                            onCheckedChange={(checked) => handleContentChange(section.id, 'showAvatar', checked)}
                        />
                   </div>
                </div>
              );
            case 'contact':
              return (
                <div className="mt-6">
                  <TitleInput value={content.title} onChange={(val) => handleContentChange(section.id, 'title', val)} style={{ color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }} />
                  <div className="space-y-1">
                      <Input placeholder="Phone Number" value={content.phone} onChange={(e) => handleContentChange(section.id, 'phone', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                      <Input placeholder="Email Address" value={content.email} onChange={(e) => handleContentChange(section.id, 'email', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                      <Input placeholder="Your Address" value={content.address} onChange={(e) => handleContentChange(section.id, 'address', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                  </div>
                </div>
              );
          case 'summary':
          case 'cover_letter':
              return (
                  <div className="mt-6">
                      <TitleInput value={content.title} onChange={(val) => handleContentChange(section.id, 'title', val)} style={{ color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }}/>
                      <Textarea value={content.text} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`Content for ${content.title}...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />
                  </div>
              );
          case 'recommendations':
          case 'experience':
          case 'projects':
          case 'education':
          case 'certifications':
          case 'links':
            const itemType = section.type === 'links' ? 'links' : section.type.slice(0, -1);
            return (
                <div className="mt-6">
                     <TitleInput value={content.title} onChange={(val) => handleContentChange(section.id, 'title', val)} style={{ color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }}/>
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
                                 {section.type === 'links' && (
                                     <div className="flex items-center gap-2">
                                        <Input placeholder="Link Text" value={item.text} onChange={(e) => handleListItemChange(section.id, index, 'text', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                        <Input placeholder="URL" value={item.url} onChange={(e) => handleListItemChange(section.id, index, 'url', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     </div>
                                 )}
                                  {section.type === 'recommendations' && (
                                     <>
                                         <Textarea placeholder="Recommendation text..." value={item.text} onChange={(e) => handleListItemChange(section.id, index, 'text', e.target.value)} className="text-sm mt-1 bg-transparent border-0 focus-visible:ring-0 p-0 italic" />
                                         <Input placeholder="Author Name, Title @ Company" value={item.author} onChange={(e) => handleListItemChange(section.id, index, 'author', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-right font-semibold" />
                                     </>
                                 )}
                                 <Input placeholder="Dates (e.g., 2020 - 2024)" value={item.dates} onChange={(e) => handleListItemChange(section.id, index, 'dates', e.target.value)} className="text-sm text-muted-foreground border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                 {['experience', 'projects', 'education'].includes(section.type) && <Textarea placeholder="Description or key achievements..." value={item.description} onChange={(e) => handleListItemChange(section.id, index, 'description', e.target.value)} className="text-sm mt-1 bg-transparent border-0 focus-visible:ring-0 p-0" />}
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
                 <TitleInput 
                    value={content.title} 
                    onChange={(val) => handleContentChange(section.id, 'title', val)}
                    style={{ color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }}
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

    const renderTemplate = () => {
        if (styling.template === 'vertical-split') {
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const headerContent = headerSection ? resumeData.content[headerSection.id] : {};

            const leftSections = ['summary', 'contact', 'links', 'skills', 'languages', 'certifications'];
            const rightSections = ['experience', 'education', 'projects', 'publications', 'achievements', 'recommendations'];
            
            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));

            return (
                <div className='flex flex-col h-full'>
                    <div className="h-[20%] p-6 flex items-center gap-6" style={{ backgroundColor: 'var(--resume-accent-color)', color: 'var(--resume-accent-text-color)' }}>
                         {headerContent.showAvatar && (
                            <div className="relative group w-32 h-32 flex-shrink-0">
                                <Image
                                    src={headerContent.avatar || 'https://placehold.co/128x128.png'}
                                    alt="Avatar"
                                    width={128}
                                    height={128}
                                    data-ai-hint="placeholder"
                                    className="rounded-full object-cover w-32 h-32 border-2 border-current"
                                />
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="h-8 w-8" />
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                        )}
                        <div>
                             <Input
                                value={headerContent.name}
                                onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)}
                                className="text-4xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                                style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: 'var(--resume-accent-text-color)' }}
                            />
                            <Input
                                value={headerContent.tagline}
                                onChange={(e) => handleContentChange(headerSection.id, 'tagline', e.target.value)}
                                className="p-0 border-0 h-auto focus-visible:ring-0 bg-transparent opacity-80"
                                style={{color: 'var(--resume-accent-text-color)'}}
                            />
                        </div>
                    </div>
                    <div className="h-[80%] flex">
                        <div className="w-[30%] p-6">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                                {leftContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                                    {renderSectionComponent(section, { isAccentBg: false })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                        <div className="w-[70%] p-6">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                            {rightContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                                {renderSectionComponent(section, { isAccentBg: false })}
                                </SortableResumeSection>
                            ))}
                            </SortableContext>
                        </div>
                    </div>
                </div>
            )
        }

        if (styling.template === 'horizontal-split') {
            const leftSections = ['header', 'summary', 'contact', 'links', 'skills', 'languages', 'certifications', 'achievements'];
            const rightSections = ['experience', 'education', 'projects', 'publications', 'recommendations'];

            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => ![...leftSections, 'line_break', 'subtitle', 'cover_letter'].includes(s.type));
            
            return (
                <div className="flex h-full">
                    <div className="w-[30%] p-6 relative" style={{ backgroundColor: 'var(--resume-accent-color)', color: 'var(--resume-accent-text-color)' }}>
                        {styling.accentPattern && (
                             <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{backgroundImage: `url(${styling.accentPattern})`}}></div>
                        )}
                       <div className="relative">
                           <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                              {leftContent.map((section) => (
                                 <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                                  {renderSectionComponent(section, { isAccentBg: true })}
                                </SortableResumeSection>
                              ))}
                            </SortableContext>
                        </div>
                    </div>
                    <div className="w-[70%] p-6">
                        <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                          {rightContent.map((section) => (
                             <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                              {renderSectionComponent(section, { isAccentBg: false })}
                            </SortableResumeSection>
                          ))}
                        </SortableContext>
                    </div>
                </div>
            );
        }

        // Default template
        return (
            <div className="p-8">
                <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy}>
                  {resumeData.sections.map((section) => (
                     <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection}>
                      {renderSectionComponent(section)}
                    </SortableResumeSection>
                  ))}
                </SortableContext>
            </div>
        );
    };

  const resumeStyle = {
    '--resume-accent-color': styling.accentColor,
    '--resume-accent-text-color': styling.accentTextColor,
    '--resume-background': theme === 'dark' ? styling.backgroundColorDark : styling.backgroundColorLight,
    '--resume-foreground': theme === 'dark' ? '#f8f8f8' : '#111111',
    '--resume-font-family': styling.fontFamily,
    '--resume-font-headline': styling.fontFamily,
    fontFamily: 'var(--resume-font-family)',
    backgroundColor: 'var(--resume-background)',
    color: 'var(--resume-foreground)'
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
                      <button key={template.id} onClick={() => handleStyleChange('template', template.id)} className={cn("block text-left group", styling.template === template.id && "ring-2 ring-primary")}>
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
                                <Label htmlFor="accentColor">Accent</Label>
                                <Input id="accentColor" type="color" value={styling.accentColor} onChange={(e) => handleStyleChange('accentColor', e.target.value)} className="w-24 p-1 h-8" />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="accentTextColor">Accent Text</Label>
                                <Input id="accentTextColor" type="color" value={styling.accentTextColor} onChange={(e) => handleStyleChange('accentTextColor', e.target.value)} className="w-24 p-1 h-8" />
                            </div>
                        </div>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Background (Light Mode)</h3>
                       <RadioGroup value={styling.backgroundColorLight} onValueChange={(val) => handleStyleChange('backgroundColorLight', val)} className="space-y-2">
                          {lightBgColors.map(color => (
                            <div key={color.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={color.value} id={`light-${color.name}`} />
                                <Label htmlFor={`light-${color.name}`} className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border" style={{backgroundColor: color.value}}></div>
                                    {color.name}
                                </Label>
                            </div>
                          ))}
                       </RadioGroup>
                    </div>

                     <div>
                      <h3 className="mb-4 text-lg font-semibold">Background (Dark Mode)</h3>
                       <RadioGroup value={styling.backgroundColorDark} onValueChange={(val) => handleStyleChange('backgroundColorDark', val)} className="space-y-2">
                          {darkBgColors.map(color => (
                            <div key={color.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={color.value} id={`dark-${color.name}`} />
                                <Label htmlFor={`dark-${color.name}`} className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border" style={{backgroundColor: color.value}}></div>
                                    {color.name}
                                </Label>
                            </div>
                          ))}
                       </RadioGroup>
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
                  <div>
                        <h3 className="mb-4 text-lg font-semibold">Accent Pattern</h3>
                        <Input id="accentPattern" type="file" accept="image/*" onChange={handleAccentPatternUpload} className="text-sm" />
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
                    <Button variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(true)}> <Bot className="h-5 w-5" /> </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Smart Suggestions</p></TooltipContent>
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
                <div className="w-full max-w-4xl mx-auto flex justify-center">
                    <div className="w-full shadow-lg transition-colors duration-300 relative overflow-hidden" id="resume-preview-wrapper" style={{ ...resumeStyle, aspectRatio: 1 / 1.4142 }}>
                        <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
                        <DroppableCanvas>
                            <div id="resume-preview" className="text-foreground relative h-full w-full">
                                {renderTemplate()}
                            </div>
                        </DroppableCanvas>
                    </div>
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
          <aside className={cn("border-l bg-background transition-all duration-300 ease-in-out", isAiPanelOpen ? "w-72" : "w-0")}>
            <div className={cn("h-full transition-all", isAiPanelOpen ? 'opacity-100 p-4' : 'opacity-0 p-0 overflow-hidden')}>
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
            </div>
          </aside>
        </div>
      </TooltipProvider>
    </DndContext>
    </ClientOnly>
  );
}
