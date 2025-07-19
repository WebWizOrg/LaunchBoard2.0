// src/app/builder/page.tsx
'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Eye,
  FileText,
  Github,
  GraduationCap,
  GripVertical,
  Languages,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
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
  Share,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { doc, getDoc, setDoc, onSnapshot, DocumentData, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { debounce } from 'lodash';


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
  DialogDescription,
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
import { rewriteResumeText } from '@/ai/flows/rewrite-resume-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
    { id: 'socials', icon: <Share />, name: 'Socials' },
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
    { id: 'image', icon: <ImageIcon />, name: 'Image' },
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
  { name: 'Horizontal Split', id: 'horizontal-split', image: 'https://placehold.co/150x212.png', hint: 'resume template' },
  { name: 'Vertical Split', id: 'vertical-split', image: 'https://placehold.co/150x212.png', hint: 'modern resume' },
  { name: 'Classic', id: 'classic', image: 'https://placehold.co/150x212.png', hint: 'classic resume' },
  { name: 'ATS-Friendly', id: 'ats-friendly', image: 'https://placehold.co/150x212.png', hint: 'ATS resume' },
  { name: 'Creative', id: 'creative', image: 'https://placehold.co/150x212.png', hint: 'creative resume' },
  { name: 'Student', id: 'student', image: 'https://placehold.co/150x212.png', hint: 'student resume' },
  { name: 'Developer', id: 'developer', image: 'https://placehold.co/150x212.png', hint: 'developer resume' },
  { name: 'Minimal CV', id: 'minimal-cv', image: 'https://placehold.co/150x212.png', hint: 'minimal cv' },
  { name: 'Two-Column Balanced', id: 'two-column-balanced', image: 'https://placehold.co/150x212.png', hint: 'two column resume' },
  { name: 'Showcase First', id: 'showcase-first', image: 'https://placehold.co/150x212.png', hint: 'portfolio resume' },
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
  { name: 'Arial', family: 'Arial, sans-serif' },
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

function SortableResumeSection({ id, children, onRemove, isPreviewing }) {
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
       {!isPreviewing && <div {...attributes} {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical />
       </div>}
       {!isPreviewing && isRemovable && (
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
        case 'skills':
            return { ...common, skill: 'New Skill', level: 50 };
        case 'socials':
            return { ...common, platform: 'linkedin', username: ''};
        default:
            return { ...common, text: '' };
    }
};

const defaultResumeData = {
  name: 'Untitled Resume',
  isPublished: false,
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
  },
  styling: {
    template: 'minimalist',
    accentColor: '#4842B3',
    accentTextColor: '#ffffff',
    backgroundColorLight: '#ffffff',
    backgroundColorDark: '#1a202c',
    fontFamily: 'var(--font-inter)',
    backgroundImage: '',
    accentPattern: '',
    backgroundBlur: 0,
    backgroundBrightness: 100,
  }
};

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const { user } = useAuth();
  
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeId, setActiveId] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [resumeData, setResumeData] = useState<DocumentData | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave) => {
      if (!user || !resumeId) return;
      setSaveStatus('Saving...');
      const resumeRef = doc(db, 'users', user.uid, 'resumes', resumeId);
      setDoc(resumeRef, dataToSave, { merge: true }).then(() => {
        setSaveStatus('Saved');
        if (dataToSave.isPublished) {
            const publicResumeRef = doc(db, 'publishedResumes', resumeId);
            setDoc(publicResumeRef, {...dataToSave, ownerId: user.uid});
        }
      }).catch(error => {
        console.error("Error saving document: ", error);
        setSaveStatus('Error');
      });
    }, 1000),
    [user, resumeId]
  );
  
  useEffect(() => {
    if (resumeData && isDataLoaded) {
      debouncedSave(resumeData);
    }
  }, [resumeData, debouncedSave, isDataLoaded]);

  useEffect(() => {
    if (!user || !resumeId) {
      if (!user) setIsDataLoaded(true); // Don't block loading if logged out
      return;
    };

    const resumeRef = doc(db, 'users', user.uid, 'resumes', resumeId);
    
    const unsubscribe = onSnapshot(resumeRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setResumeData({
          ...defaultResumeData,
          ...data,
          styling: { ...defaultResumeData.styling, ...data.styling },
        });
      } else {
        console.log("No such document! Creating one.");
        const newResumeData = { ...defaultResumeData, updatedAt: new Date() };
        setResumeData(newResumeData);
        setDoc(resumeRef, newResumeData);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Error fetching document:", error);
      setIsDataLoaded(true); // Stop loading on error
    });

    return () => unsubscribe();
  }, [user, resumeId]);

  const handlePublishChange = async (isPublished: boolean) => {
    if (!resumeId || !resumeData) return;
    
    updateResumeData(prev => ({ ...prev, isPublished }));

    const publicResumeRef = doc(db, 'publishedResumes', resumeId);
    if (isPublished) {
        toast({ title: 'Publishing resume...' });
        await setDoc(publicResumeRef, {...resumeData, isPublished: true, ownerId: user.uid });
        toast({ title: 'Resume published!', description: 'Anyone with the link can now view it.' });
    } else {
        toast({ title: 'Unpublishing resume...' });
        await deleteDoc(publicResumeRef);
        toast({ title: 'Resume unpublished.' });
    }
  };


  const { theme } = useTheme();

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [textToRewrite, setTextToRewrite] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const resumeSectionsIds = resumeData?.sections.map(s => s.id) || [];
  const styling = resumeData?.styling || defaultResumeData.styling;

  const sensors = useSensors(useSensor(PointerSensor));

  const updateResumeData = (updater) => {
    setResumeData(prev => {
      if (!prev) return null;
      const newState = updater(prev);
      return { ...newState, updatedAt: new Date() };
    });
  };

  const handleStyleChange = (property, value) => {
    updateResumeData(prev => ({ 
      ...prev, 
      styling: { ...prev.styling, [property]: value } 
    }));
  };
  
  const handleNameChange = (newName: string) => {
    updateResumeData(prev => ({...prev, name: newName}));
  }

  const handleContentChange = (sectionId, field, value) => {
    updateResumeData(prev => ({
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
      updateResumeData(prev => {
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
      updateResumeData(prev => {
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
      updateResumeData(prev => {
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

  const handleImageUpload = (sectionId, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleContentChange(sectionId, 'src', reader.result as string);
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

      if (['experience', 'education', 'projects', 'certifications', 'links', 'recommendations', 'skills', 'socials'].includes(newSectionType)) {
          defaultContent.items = [];
      } else if (newSectionType === 'header') {
          defaultContent = { name: 'Your Name', tagline: 'Your Role', avatar: '', showAvatar: true, links: [] };
      } else if (newSectionType === 'contact') {
          defaultContent = { title: 'Contact', phone: '', email: '', address: '' };
      } else if (newSectionType === 'image') {
          defaultContent = { title: 'Image', src: '', width: 100 };
      } else {
        defaultContent.text = '';
      }
  
      const overIndex = isDroppingOnCanvasItem ? resumeData.sections.findIndex(s => s.id === over.id) : resumeData.sections.length;
      
      updateResumeData(prev => {
        const newSections = [...prev.sections];
        newSections.splice(overIndex, 0, newSectionData);
        return {
            ...prev,
            sections: newSections,
            content: { ...prev.content, [newSectionId]: defaultContent }
        };
      });

    } else if (isCanvasItem && isDroppingOnCanvasItem) {
      if (active.id !== over.id) {
        const activeIndex = resumeData.sections.findIndex(s => s.id === active.id);
        const overIndex = resumeData.sections.findIndex(s => s.id === over.id);
        updateResumeData((prev) => ({
          ...prev,
          sections: arrayMove(prev.sections, activeIndex, overIndex),
        }));
      }
    }
  };
  

  const removeSection = (idToRemove) => {
    updateResumeData(prev => {
        const newContent = { ...prev.content };
        delete newContent[idToRemove];
        return {
            ...prev,
            sections: prev.sections.filter(section => section.id !== idToRemove),
            content: newContent
        };
    });
  };

  const handleGetSuggestions = () => {
    if (!textToRewrite.trim()) {
      toast({
        title: 'Text is empty',
        description: 'Please enter some text to get suggestions.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      setAiSuggestions([]);
      try {
        const headerSection = resumeData.sections.find(s => s.type === 'header');
        const jobTitle = headerSection ? resumeData.content[headerSection.id]?.tagline : undefined;

        const response = await rewriteResumeText({
          textToRewrite: textToRewrite,
          jobTitle,
        });
        setAiSuggestions(response.suggestions);
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
      // Temporarily switch to preview mode for PDF generation
      const wasPreviewing = isPreviewing;
      setIsPreviewing(true);

      // Allow state to update and re-render
      setTimeout(() => {
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
          
          // Restore original preview state
          setIsPreviewing(wasPreviewing);
        });
      }, 100);
    }
  };
  
    const renderSectionComponent = (section, templateContext = {}) => {
        const content = resumeData.content[section.id] || {};
        const { isAccentBg = false, isPublicView = false } = templateContext;
        const isEditable = !isPreviewing && !isPublicView;

        if ((isPreviewing || isPublicView) && !isEditable) {
            if (section.type === 'summary' && !content.text) return null;
            if (section.type === 'experience' && (!content.items || content.items.length === 0)) return null;
            if (section.type === 'projects' && (!content.items || content.items.length === 0)) return null;
        }

        const TitleComponent = ({value, icon: Icon, className, ...props}) => {
            const { titleClass } = props; // Extract titleClass to avoid passing to DOM
            return (
                <div className="flex items-center gap-3 mb-2">
                    {Icon && <Icon className="h-6 w-6" style={{ color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }} />}
                    {!isEditable ? (
                        <div className={cn("text-xl font-bold w-full", titleClass, className)}>{value}</div>
                    ) : (
                        <Input 
                            value={value || ''} 
                            onChange={(e) => handleContentChange(section.id, 'title', e.target.value)} 
                            className={cn("text-xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent w-full", titleClass, className)} 
                            style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: isAccentBg ? 'var(--resume-accent-text-color)' : 'var(--resume-accent-color)' }}
                        />
                    )}
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
                                style={{borderColor: 'var(--resume-accent-color)'}}
                            />
                            {isEditable &&
                            <>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="h-8 w-8" />
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </>
                            }
                        </div>
                    )}
                    {!isEditable ? (
                        <>
                            <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}>{content.name}</h1>
                            <p className="text-muted-foreground text-center">{content.tagline}</p>
                        </>
                    ) : (
                        <>
                          <Input
                            value={content.name || ''}
                            onChange={(e) => handleContentChange(section.id, 'name', e.target.value)}
                            className="text-4xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
                            style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
                          />
                          <Input
                            value={content.tagline || ''}
                            onChange={(e) => handleContentChange(section.id, 'tagline', e.target.value)}
                            className="text-muted-foreground p-0 border-0 h-auto text-center focus-visible:ring-0 bg-transparent"
                          />
                        </>
                    )}

                   {isEditable && <div className="flex items-center justify-center gap-2 mt-2">
                        <Label htmlFor={`show-avatar-${section.id}`}>Show Avatar</Label>
                        <Switch
                            id={`show-avatar-${section.id}`}
                            checked={content.showAvatar}
                            onCheckedChange={(checked) => handleContentChange(section.id, 'showAvatar', checked)}
                        />
                   </div>}
                </div>
              );
            case 'contact':
              return (
                <div className="mt-6">
                  <TitleComponent value={content.title || ''} icon={Phone} titleClass={templateContext.titleClass} />
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        {!isEditable ? <p className="text-sm">{content.email}</p> : <Input placeholder="Email Address" value={content.email || ''} onChange={(e) => handleContentChange(section.id, 'email', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        {!isEditable ? <p className="text-sm">{content.phone}</p> : <Input placeholder="Phone Number" value={content.phone || ''} onChange={(e) => handleContentChange(section.id, 'phone', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        {!isEditable ? <p className="text-sm">{content.address}</p> : <Input placeholder="Your Address" value={content.address || ''} onChange={(e) => handleContentChange(section.id, 'address', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                      </div>
                  </div>
                </div>
              );
            case 'socials':
                return (
                    <div className="mt-6">
                        <TitleComponent value={content.title || ''} icon={Share} titleClass={templateContext.titleClass} />
                        <div className="space-y-2">
                            {(content.items || []).map((item, index) => (
                                <div key={item.id} className="relative group/item flex items-center gap-2">
                                     {isEditable && <button onClick={() => removeListItem(section.id, index)} className="h-5 w-5 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-3 w-3" /></button>}
                                    {!isEditable ? (
                                        <div className="flex items-center gap-2 text-sm">
                                            {item.platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                                            {item.platform === 'github' && <Github className="h-4 w-4" />}
                                            {item.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                                            <p>{item.username}</p>
                                        </div>
                                    ) : (
                                        <>
                                         <Select value={item.platform} onValueChange={(val) => handleListItemChange(section.id, index, 'platform', val)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                <SelectItem value="github">GitHub</SelectItem>
                                                <SelectItem value="twitter">Twitter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="Username or Profile URL" value={item.username || ''} onChange={(e) => handleListItemChange(section.id, index, 'username', e.target.value)} className="text-sm border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                        </>
                                    )}
                                </div>
                            ))}
                            {isEditable && <Button variant="outline" size="sm" className="mt-2" onClick={() => addListItem(section.id, 'socials')}>
                                <Plus className="h-4 w-4 mr-2" /> Add Social Link
                            </Button>}
                        </div>
                    </div>
                );
          case 'summary':
          case 'cover_letter':
              return (
                  <div className="mt-6">
                      <TitleComponent value={content.title || ''} icon={section.type === 'summary' ? FileText : Bot} titleClass={templateContext.titleClass} />
                      {!isEditable ? <p className="whitespace-pre-wrap text-sm">{content.text}</p> : <Textarea value={content.text || ''} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`Content for ${content.title}...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />}
                  </div>
              );
          case 'recommendations':
            return (
                <div className="mt-6">
                     <TitleComponent value={content.title || ''} icon={Quote} titleClass={templateContext.titleClass}/>
                     <div className="space-y-4">
                         {(content.items || []).map((item, index) => (
                             <div key={item.id} className="relative group/item pl-4 border-l-2 border-border/50">
                                 {isEditable && <button onClick={() => removeListItem(section.id, index)} className="absolute top-0 -right-2 h-5 w-5 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-3 w-3" /></button>}
                                 {!isEditable ? <blockquote className="text-sm italic">"{item.text}"</blockquote> : <Textarea placeholder="Recommendation text..." value={item.text || ''} onChange={(e) => handleListItemChange(section.id, index, 'text', e.target.value)} className="text-sm mt-1 bg-transparent border-0 focus-visible:ring-0 p-0 italic" />}
                                 {!isEditable ? <cite className="block text-right font-semibold not-italic mt-2">&mdash; {item.author}</cite> : <Input placeholder="Author Name, Title @ Company" value={item.author || ''} onChange={(e) => handleListItemChange(section.id, index, 'author', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-right font-semibold" />}
                             </div>
                         ))}
                         {isEditable && <Button variant="outline" size="sm" className="mt-2" onClick={() => addListItem(section.id, 'recommendations')}>
                             <Plus className="h-4 w-4 mr-2" /> Add Recommendation
                         </Button>}
                     </div>
                </div>
            );
          case 'experience':
          case 'projects':
          case 'education':
          case 'certifications':
          case 'links':
            const itemTypeMap = {
                experience: {icon: Briefcase, type: 'experience'},
                projects: {icon: Code, type: 'projects'},
                education: {icon: GraduationCap, type: 'education'},
                certifications: {icon: Award, type: 'certifications'},
                links: {icon: LinkIcon, type: 'links'}
            };
            const itemConfig = itemTypeMap[section.type];
            return (
                <div className="mt-6">
                     <TitleComponent value={content.title || ''} icon={itemConfig.icon} titleClass={templateContext.titleClass}/>
                     <div className="space-y-4">
                         {(content.items || []).map((item, index) => (
                             <div key={item.id} className="relative group/item pl-4 border-l-2 border-border/50">
                                 {isEditable && <button onClick={() => removeListItem(section.id, index)} className="absolute top-0 -right-2 h-5 w-5 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-3 w-3" /></button>}
                                 
                                 {!isEditable ? (
                                    <>
                                        {section.type === 'education' && <>
                                            <p className="font-semibold">{item.institution}</p>
                                            <p>{item.degree}</p>
                                        </>}
                                        {section.type === 'experience' && <>
                                            <p className="font-semibold">{item.company}</p>
                                            <p>{item.role}</p>
                                        </>}
                                        {section.type === 'projects' && <>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.tech}</p>
                                        </>}
                                        {section.type === 'certifications' && <>
                                            <p className="font-semibold">{item.name}</p>
                                            <p>{item.issuer}</p>
                                        </>}
                                        {section.type === 'links' && <a href={item.url} target="_blank" rel="noreferrer" className="font-semibold underline">{item.text}</a>}
                                        <p className="text-sm text-muted-foreground">{item.dates || item.date}</p>
                                        {['experience', 'projects', 'education'].includes(section.type) && <p className="whitespace-pre-wrap text-sm mt-1">{item.description}</p>}
                                    </>
                                 ) : (
                                    <>
                                     {section.type === 'education' && (
                                         <>
                                             <Input placeholder="Institution Name" value={item.institution || ''} onChange={(e) => handleListItemChange(section.id, index, 'institution', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                             <Input placeholder="Degree or Field of Study" value={item.degree || ''} onChange={(e) => handleListItemChange(section.id, index, 'degree', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                         </>
                                     )}
                                     {section.type === 'experience' && (
                                         <>
                                             <Input placeholder="Company Name" value={item.company || ''} onChange={(e) => handleListItemChange(section.id, index, 'company', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                             <Input placeholder="Your Role" value={item.role || ''} onChange={(e) => handleListItemChange(section.id, index, 'role', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                         </>
                                     )}
                                     {section.type === 'projects' && (
                                          <>
                                             <Input placeholder="Project Name" value={item.name || ''} onChange={(e) => handleListItemChange(section.id, index, 'name', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                             <Input placeholder="Tech Stack" value={item.tech || ''} onChange={(e) => handleListItemChange(section.id, index, 'tech', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-sm text-muted-foreground" />
                                         </>
                                     )}
                                      {section.type === 'certifications' && (
                                         <>
                                             <Input placeholder="Certification Name" value={item.name || ''} onChange={(e) => handleListItemChange(section.id, index, 'name', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                             <Input placeholder="Issuing Organization" value={item.issuer || ''} onChange={(e) => handleListItemChange(section.id, index, 'issuer', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                         </>
                                     )}
                                     {section.type === 'links' && (
                                         <div className="flex items-center gap-2">
                                            <Input placeholder="Link Text" value={item.text || ''} onChange={(e) => handleListItemChange(section.id, index, 'text', e.target.value)} className="font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                            <Input placeholder="URL" value={item.url || ''} onChange={(e) => handleListItemChange(section.id, index, 'url', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                         </div>
                                     )}
                                     <Input placeholder="Dates (e.g., 2020 - 2024)" value={item.dates || item.date || ''} onChange={(e) => handleListItemChange(section.id, index, section.type === 'certifications' ? 'date' : 'dates', e.target.value)} className="text-sm text-muted-foreground border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                     {['experience', 'projects', 'education'].includes(section.type) && <Textarea placeholder="Description or key achievements..." value={item.description || ''} onChange={(e) => handleListItemChange(section.id, index, 'description', e.target.value)} className="text-sm mt-1 bg-transparent border-0 focus-visible:ring-0 p-0" />}
                                     </>
                                 )}
                             </div>
                         ))}
                         {isEditable && <Button variant="outline" size="sm" className="mt-2" onClick={() => addListItem(section.id, itemConfig.type)}>
                             <Plus className="h-4 w-4 mr-2" /> Add Entry
                         </Button>}
                     </div>
                </div>
            );
           case 'skills':
            return (
              <div className="mt-6">
                 <TitleComponent 
                    value={content.title || ''} 
                    icon={Sparkles}
                    titleClass={templateContext.titleClass}
                />
                 {templateContext.variant === 'creative' && !isEditable ? (
                     <div className="space-y-4">
                         {(content.items || []).map((item) => (
                             <div key={item.id} className="flex items-center gap-4">
                                <p className="w-1/3">{item.skill}</p>
                                <Progress value={item.level} />
                             </div>
                         ))}
                     </div>
                 ) : templateContext.variant === 'creative' && isEditable ? (
                     <div className="space-y-4">
                         {(content.items || []).map((item, index) => (
                             <div key={item.id} className="relative group/item flex items-center gap-4">
                                <Input value={item.skill || ''} onChange={(e) => handleListItemChange(section.id, index, 'skill', e.target.value)} className="w-1/3 border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />
                                <Slider value={[item.level]} onValueChange={(val) => handleListItemChange(section.id, index, 'level', val[0])} className="flex-1" />
                                <button onClick={() => removeListItem(section.id, index)} className="h-5 w-5 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-3 w-3" /></button>
                             </div>
                         ))}
                         <Button variant="outline" size="sm" className="mt-2" onClick={() => addListItem(section.id, 'skills')}>
                             <Plus className="h-4 w-4 mr-2" /> Add Skill
                         </Button>
                     </div>
                 ) : !isEditable ? (
                    <p className="text-sm">{content.text}</p>
                 ) : (
                    <Textarea value={content.text || ''} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`e.g., Python, JavaScript, Public Speaking...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />
                 )}
              </div>
            );
           case 'languages':
           case 'achievements':
           case 'publications':
            const textIconMap = {
                languages: Languages,
                achievements: Star,
                publications: Book,
            };
            return (
              <div className="mt-6">
                 <TitleComponent 
                    value={content.title || ''} 
                    icon={textIconMap[section.type]}
                    titleClass={templateContext.titleClass}
                />
                {!isEditable ? <p className="whitespace-pre-wrap text-sm">{content.text}</p> : <Textarea value={content.text || ''} onChange={(e) => handleContentChange(section.id, 'text', e.target.value)} placeholder={`Content for ${content.title}...`} className="bg-transparent border-0 focus-visible:ring-0 p-0" />}
              </div>
            );
            case 'image':
              return (
                  <div className="mt-6">
                      {isEditable && <TitleComponent value={content.title || ''} icon={ImageIcon} titleClass={templateContext.titleClass} />}
                      <div className="relative group w-full" style={{ width: `${content.width}%`}}>
                          <Image
                              src={content.src || 'https://placehold.co/600x400.png'}
                              alt={content.title || "Uploaded image"}
                              width={600}
                              height={400}
                              data-ai-hint="placeholder"
                              className="w-full h-auto object-cover border-2"
                          />
                          {isEditable && 
                            <>
                                <label htmlFor={`image-upload-${section.id}`} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="h-8 w-8" />
                                </label>
                                <input id={`image-upload-${section.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(section.id, e)} />
                            </>
                          }
                      </div>
                      {isEditable && <div className="mt-2">
                        <Label htmlFor={`image-width-${section.id}`}>Width</Label>
                        <Slider id={`image-width-${section.id}`} value={[content.width]} onValueChange={(val) => handleContentChange(section.id, 'width', val[0])} min={10} max={100} />
                      </div>}
                  </div>
              );
           case 'subtitle':
                return (
                    <div className="mt-4">
                        {!isEditable ? (
                            <h3 className="text-lg font-semibold">{content.text}</h3>
                        ) : (
                            <Input 
                                value={content.text || ''}
                                onChange={(e) => handleContentChange(section.id, 'text', e.target.value)}
                                placeholder="Subtitle"
                                className="text-lg font-semibold p-0 border-0 h-auto focus-visible:ring-0 bg-transparent"
                            />
                        )}
                    </div>
                );
            case 'line_break':
                return <Separator className="my-4 bg-border/50" />;
          default:
            return null;
        }
    };

    const renderTemplate = (isPublicView = false) => {

        if (styling.template === 'classic') {
          const headerSection = resumeData.sections.find(s => s.type === 'header');
          const headerContent = headerSection ? resumeData.content[headerSection.id] : {};
          const contactSection = resumeData.sections.find(s => s.type === 'contact');
          const contactContent = contactSection ? resumeData.content[contactSection.id] : {};
          const socialsSection = resumeData.sections.find(s => s.type === 'socials');
          const socialsContent = socialsSection ? resumeData.content[socialsSection.id] : {};
          const socialItems = socialsContent?.items || [];
          const githubItem = socialItems.find(i => i.platform === 'github');
          const linkedinItem = socialItems.find(i => i.platform === 'linkedin');
          const isEditable = !isPreviewing && !isPublicView;

          return (
            <div className="p-10 space-y-6">
              {/* Header */}
              <header className="text-center space-y-2">
                {!isEditable ? (
                    <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: 'var(--resume-accent-color)' }}>{headerContent.name}</h1>
                ) : (
                    <Input
                        value={headerContent.name || ''}
                        onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)}
                        className="text-4xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
                        style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: 'var(--resume-accent-color)' }}
                    />
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4"/>
                    {!isEditable ? <p>{contactContent.email}</p> : <Input placeholder="Email Address" value={contactContent.email || ''} onChange={(e) => handleContentChange(contactSection.id, 'email', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4"/>
                    {!isEditable ? <p>{contactContent.phone}</p> : <Input placeholder="Phone Number" value={contactContent.phone || ''} onChange={(e) => handleContentChange(contactSection.id, 'phone', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                  </div>
                   <div className="flex items-center gap-1">
                    <Github className="h-4 w-4"/>
                    {!isEditable ? <p>{githubItem?.username}</p> : <Input placeholder="github.com/your-profile" value={githubItem?.username || ''} onChange={(e) => handleListItemChange(socialsSection.id, socialItems.findIndex(i => i.id === githubItem?.id), 'username', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                  </div>
                   <div className="flex items-center gap-1">
                    <Linkedin className="h-4 w-4"/>
                    {!isEditable ? <p>{linkedinItem?.username}</p> : <Input placeholder="linkedin.com/in/your-profile" value={linkedinItem?.username || ''} onChange={(e) => handleListItemChange(socialsSection.id, socialItems.findIndex(i => i.id === linkedinItem?.id), 'username', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0" />}
                  </div>
                </div>
              </header>

              <Separator className="bg-border/30" />

              <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                  {resumeData.sections.filter(s => s.type !== 'header' && s.type !== 'contact' && s.type !== 'socials').map((section) => (
                     <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                      {renderSectionComponent(section, { isPublicView })}
                    </SortableResumeSection>
                  ))}
                </SortableContext>
            </div>
          );
        }

        if (styling.template === 'ats-friendly') {
            const leftSections = ['skills', 'contact', 'certifications', 'languages', 'links'];
            const rightSections = ['summary', 'experience', 'education', 'projects', 'achievements', 'recommendations', 'publications'];
            
            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const headerContent = headerSection ? resumeData.content[headerSection.id] : {};
            const isEditable = !isPreviewing && !isPublicView;

            return (
                <div className='p-8'>
                    <header className="text-center mb-6">
                        {!isEditable ? (
                            <>
                                <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}>{headerContent.name}</h1>
                                <p className="text-muted-foreground">{headerContent.tagline}</p>
                            </>
                        ) : (
                            <>
                            <Input
                                value={headerContent.name || ''}
                                onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)}
                                className="text-3xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent"
                                style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}
                            />
                            <Input
                                value={headerContent.tagline || ''}
                                onChange={(e) => handleContentChange(headerSection.id, 'tagline', e.target.value)}
                                className="text-center p-0 border-0 h-auto focus-visible:ring-0 bg-transparent text-muted-foreground"
                            />
                            </>
                        )}
                    </header>
                    <div className="flex gap-8">
                        <div className="w-[30%]">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {leftContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                    {renderSectionComponent(section, { isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                        <div className="w-[70%]">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {rightContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                {renderSectionComponent(section, { isPublicView })}
                                </SortableResumeSection>
                            ))}
                            </SortableContext>
                        </div>
                    </div>
                </div>
            )
        }

        if (styling.template === 'creative') {
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const headerContent = headerSection ? resumeData.content[headerSection.id] : {};
            const leftSections = ['contact', 'skills', 'links'];
            const rightSections = ['summary', 'experience', 'education', 'projects'];
            
            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));
            const isEditable = !isPreviewing && !isPublicView;

            return (
                <div className='p-8'>
                    <header className="flex items-center gap-6 mb-8">
                         {headerContent.showAvatar && (
                            <div className="relative group w-36 h-36 flex-shrink-0">
                                <Image src={headerContent.avatar || 'https://placehold.co/144x144.png'} alt="Avatar" width={144} height={144} data-ai-hint="placeholder" className="rounded-full object-cover w-36 h-36 border-4" style={{borderColor: 'var(--resume-accent-color)'}}/>
                                {isEditable && <>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"> <ImageIcon className="h-8 w-8" /> </label>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </>}
                            </div>
                        )}
                        <div>
                             {!isEditable ? (
                                <>
                                    <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}>{headerContent.name}</h1>
                                    <p className="text-2xl text-muted-foreground">{headerContent.tagline}</p>
                                </>
                             ) : (
                                <>
                                 <Input value={headerContent.name || ''} onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)} className="text-5xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }}/>
                                 <Input value={headerContent.tagline || ''} onChange={(e) => handleContentChange(headerSection.id, 'tagline', e.target.value)} className="text-2xl p-0 border-0 h-auto focus-visible:ring-0 bg-transparent text-muted-foreground" />
                                </>
                             )}
                        </div>
                    </header>
                    <div className="flex gap-8">
                        <div className="w-[30%]">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {leftContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                        {renderSectionComponent(section, { variant: 'creative', isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                        <div className="w-[70%]">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {rightContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                    {renderSectionComponent(section, { variant: 'creative', isPublicView })}
                                </SortableResumeSection>
                            ))}
                            </SortableContext>
                        </div>
                    </div>
                </div>
            )
        }
        
        if (styling.template === 'student') {
             const headerSection = resumeData.sections.find(s => s.type === 'header');
             const headerContent = headerSection ? resumeData.content[headerSection.id] : {};
             const contactSection = resumeData.sections.find(s => s.type === 'contact');
             const contactContent = contactSection ? resumeData.content[contactSection.id] : {};
             const socialsSection = resumeData.sections.find(s => s.type === 'socials');
             const socialsContent = socialsSection ? resumeData.content[socialsSection.id] : {};
             const isEditable = !isPreviewing && !isPublicView;

             return (
                 <div className="p-10 space-y-4">
                     <header className="text-center space-y-1">
                         {!isEditable ? (
                            <h1 className="text-4xl font-bold" style={{fontFamily: 'var(--resume-font-headline, var(--font-headline))'}}>{headerContent.name}</h1>
                         ) : (
                            <Input value={headerContent.name || ''} onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)} className="text-4xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent" style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))' }} />
                         )}
                         <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                             {!isEditable ? (
                                <>
                                    <p>{contactContent.email}</p>
                                    <p>{contactContent.phone}</p>
                                    <p>{(socialsContent?.items || []).find(i => i.platform === 'linkedin')?.username}</p>
                                </>
                             ): (
                                <>
                                 <Input placeholder="Email" value={contactContent.email || ''} onChange={(e) => handleContentChange(contactSection.id, 'email', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-center" />
                                 <Input placeholder="Phone" value={contactContent.phone || ''} onChange={(e) => handleContentChange(contactSection.id, 'phone', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-center" />
                                 <Input placeholder="LinkedIn" value={(socialsContent?.items || []).find(i => i.platform === 'linkedin')?.username || ''} onChange={(e) => handleListItemChange(socialsSection.id, (socialsContent?.items || []).findIndex(i => i.platform === 'linkedin'), 'username', e.target.value)} className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-center" />
                                </>
                             )}
                         </div>
                     </header>
                     <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                         {resumeData.sections.filter(s => !['header', 'contact', 'socials'].includes(s.type)).map((section) => (
                             <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                 {renderSectionComponent(section, { titleClass: 'text-blue-700', isPublicView })}
                             </SortableResumeSection>
                         ))}
                     </SortableContext>
                 </div>
             )
        }
        
        if (styling.template === 'developer') {
            const leftSections = ['contact', 'skills', 'languages', 'links'];
            const rightSections = ['summary', 'experience', 'projects', 'education'];
            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const headerContent = headerSection ? resumeData.content[headerSection.id] : {};
            const isEditable = !isPreviewing && !isPublicView;

            return (
                <div className='flex h-full font-mono'>
                    <div className='w-[30%] bg-muted/30 p-6'>
                        {headerSection && 
                            <div className="mb-6 text-center">
                                {headerContent.showAvatar && <Image src={headerContent.avatar || 'https://placehold.co/128x128.png'} alt="Avatar" width={128} height={128} data-ai-hint="placeholder" className="rounded-full object-cover w-32 h-32 mx-auto mb-4 border-2 border-primary" />}
                                {!isEditable ? (
                                    <>
                                        <h1 className="text-2xl font-bold">{headerContent.name}</h1>
                                        <p className="text-muted-foreground">{headerContent.tagline}</p>
                                    </>
                                ) : (
                                    <>
                                        <Input value={headerContent.name || ''} onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)} className="text-2xl font-bold h-auto p-0 border-0 text-center focus-visible:ring-0 bg-transparent" />
                                        <Input value={headerContent.tagline || ''} onChange={(e) => handleContentChange(headerSection.id, 'tagline', e.target.value)} className="text-center p-0 border-0 h-auto focus-visible:ring-0 bg-transparent text-muted-foreground" />
                                    </>
                                )}
                            </div>
                        }
                        <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {leftContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                {renderSectionComponent(section, { isPublicView })}
                                </SortableResumeSection>
                            ))}
                        </SortableContext>
                    </div>
                    <div className='w-[70%] p-6'>
                         <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {rightContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                {renderSectionComponent(section, { isPublicView })}
                                </SortableResumeSection>
                            ))}
                        </SortableContext>
                    </div>
                </div>
            )
        }

        if (styling.template === 'minimal-cv') {
             const isEditable = !isPreviewing && !isPublicView;
             return (
                 <div className="p-12">
                     <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                         {resumeData.sections.map((section) => (
                             <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                 {renderSectionComponent(section, { titleClass: 'text-2xl font-bold', isPublicView })}
                                 {!isPreviewing && <Separator className="my-6"/>}
                             </SortableResumeSection>
                         ))}
                     </SortableContext>
                 </div>
             )
        }

        
        if (styling.template === 'vertical-split') {
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const headerContent = headerSection ? resumeData.content[headerSection.id] : {};

            const leftSections = ['summary', 'contact', 'links', 'skills', 'languages', 'certifications'];
            const rightSections = ['experience', 'education', 'projects', 'publications', 'achievements', 'recommendations'];
            
            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));
            const isEditable = !isPreviewing && !isPublicView;

            return (
                <div className='flex flex-col h-full'>
                    <div className="h-[15%] p-6 flex flex-row items-center justify-center gap-6" style={{ backgroundColor: 'var(--resume-accent-color)', color: 'var(--resume-accent-text-color)' }}>
                         {headerContent.showAvatar && (
                            <div className="relative group w-36 h-36 flex-shrink-0">
                                <Image
                                    src={headerContent.avatar || 'https://placehold.co/144x144.png'}
                                    alt="Avatar"
                                    width={144}
                                    height={144}
                                    data-ai-hint="placeholder"
                                    className="rounded-full object-cover w-36 h-36 border-4 border-current"
                                />
                                {isEditable && <>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="h-8 w-8" />
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </>}
                            </div>
                        )}
                        <div className="flex-grow flex flex-col justify-center">
                            {!isEditable ? (
                                <>
                                    <h1 className="text-5xl font-bold text-left" style={{fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: 'var(--resume-accent-text-color)'}}>{headerContent.name}</h1>
                                    <p className="text-2xl opacity-80 text-left mt-2" style={{color: 'var(--resume-accent-text-color)'}}>{headerContent.tagline}</p>
                                </>
                            ) : (
                                <>
                                     <Input
                                        value={headerContent.name || ''}
                                        onChange={(e) => handleContentChange(headerSection.id, 'name', e.target.value)}
                                        className="text-5xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent text-left"
                                        style={{ fontFamily: 'var(--resume-font-headline, var(--font-headline))', color: 'var(--resume-accent-text-color)' }}
                                    />
                                    <Input
                                        value={headerContent.tagline || ''}
                                        onChange={(e) => handleContentChange(headerSection.id, 'tagline', e.target.value)}
                                        className="text-2xl p-0 border-0 h-auto focus-visible:ring-0 bg-transparent opacity-80 text-left mt-2"
                                        style={{color: 'var(--resume-accent-text-color)'}}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="h-[85%] flex bg-muted/30">
                        <div className="w-[30%] p-6">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {leftContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                    {renderSectionComponent(section, { isAccentBg: false, isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                        <div className="w-[70%] p-6 bg-background">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {rightContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                {renderSectionComponent(section, { isAccentBg: false, isPublicView })}
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
            const rightContent = resumeData.sections.filter(s => !leftSections.includes(s.type) && s.type !== 'line_break' && s.type !== 'subtitle' && s.type !== 'cover_letter');
            const isEditable = !isPreviewing && !isPublicView;
            
            return (
                <div className="flex h-full">
                    <div className="w-[30%] p-6 relative" style={{ backgroundColor: 'var(--resume-accent-color)', color: 'var(--resume-accent-text-color)' }}>
                        {styling.accentPattern && (
                             <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{backgroundImage: `url(${styling.accentPattern})`}}></div>
                        )}
                       <div className="relative">
                           <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                              {leftContent.map((section) => (
                                 <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                  {renderSectionComponent(section, { isAccentBg: true, isPublicView })}
                                </SortableResumeSection>
                              ))}
                            </SortableContext>
                        </div>
                    </div>
                    <div className="w-[70%] p-6">
                        <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                          {rightContent.map((section) => (
                             <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                              {renderSectionComponent(section, { isAccentBg: false, titleClass: "text-[color:var(--resume-accent-color)]", isPublicView })}
                            </SortableResumeSection>
                          ))}
                        </SortableContext>
                    </div>
                </div>
            );
        }

        if (styling.template === 'two-column-balanced') {
            const leftSections = ['header', 'contact', 'skills', 'languages', 'links', 'certifications'];
            const rightSections = ['summary', 'experience', 'projects', 'achievements', 'recommendations', 'cover_letter'];
            const publicationsSection = resumeData.sections.find(s => s.type === 'publications');

            const leftContent = resumeData.sections.filter(s => leftSections.includes(s.type));
            const rightContent = resumeData.sections.filter(s => rightSections.includes(s.type));
            const isEditable = !isPreviewing && !isPublicView;

            return (
                <div className="p-8">
                    <div className="flex gap-8">
                        <div className="w-[30%]">
                            <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {leftContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                        {renderSectionComponent(section, { isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                        <div className="w-[70%]">
                             <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {rightContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                        {renderSectionComponent(section, { isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                    {publicationsSection && (
                        <div className="mt-8">
                             <SortableResumeSection key={publicationsSection.id} id={publicationsSection.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                {renderSectionComponent(publicationsSection, { isPublicView })}
                            </SortableResumeSection>
                        </div>
                    )}
                </div>
            );
        }

        if (styling.template === 'showcase-first') {
            const sidebarSections = ['skills', 'certifications', 'languages', 'links'];
            const mainSections = ['projects', 'achievements', 'experience', 'education'];
            const footerSections = ['summary', 'contact'];
            
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            const sidebarContent = resumeData.sections.filter(s => sidebarSections.includes(s.type));
            const mainContent = resumeData.sections.filter(s => mainSections.includes(s.type));
            const footerContent = resumeData.sections.filter(s => footerSections.includes(s.type));
            const isEditable = !isPreviewing && !isPublicView;


            return (
                <div className="p-8">
                    {headerSection && (
                        <SortableResumeSection key={headerSection.id} id={headerSection.id} onRemove={removeSection} isPreviewing={!isEditable}>
                            {renderSectionComponent(headerSection, { isPublicView })}
                        </SortableResumeSection>
                    )}
                    <div className="flex flex-row-reverse gap-8 mt-8">
                        <aside className="w-[30%]">
                             <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {sidebarContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                        {renderSectionComponent(section, { isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </aside>
                        <main className="w-[70%]">
                             <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                                {mainContent.map((section) => (
                                    <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                        {renderSectionComponent(section, { isPublicView })}
                                    </SortableResumeSection>
                                ))}
                            </SortableContext>
                        </main>
                    </div>
                     <footer className="mt-8 border-t pt-4">
                        <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                            {footerContent.map((section) => (
                                <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                                    {renderSectionComponent(section, { isPublicView })}
                                </SortableResumeSection>
                            ))}
                        </SortableContext>
                    </footer>
                </div>
            );
        }

        // Default template
        const isEditable = !isPreviewing && !isPublicView;
        return (
            <div className="p-8">
                <SortableContext items={resumeSectionsIds} strategy={verticalListSortingStrategy} disabled={!isEditable}>
                  {resumeData.sections.map((section) => (
                     <SortableResumeSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={!isEditable}>
                      {renderSectionComponent(section, { isPublicView })}
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
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--resume-background)',
    color: 'var(--resume-foreground)'
  };

  const resumeBgStyle = {
    backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: `blur(${styling.backgroundBlur}px) brightness(${styling.backgroundBrightness}%)`,
  };

  if (!isDataLoaded || !resumeData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                    <Select onValueChange={handleFontChange} value={styling.fontFamily}>
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
                <Input value={resumeData.name} onChange={(e) => handleNameChange(e.target.value)} className="text-sm font-semibold h-8 border-0 focus-visible:ring-1 bg-transparent" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-24">
                  {saveStatus === 'Saving...' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saveStatus === 'Saved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {saveStatus === 'Error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                  <span>{saveStatus}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(true)}>
                            <Bot className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Smart Suggestions</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={isPreviewing ? "secondary" : "ghost"} size="icon" onClick={() => setIsPreviewing(!isPreviewing)}> <Eye className="h-5 w-5" /> </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{isPreviewing ? "Exit Preview" : "Preview"}</p></TooltipContent>
                </Tooltip>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Your Resume</DialogTitle>
                       <DialogDescription>
                            Anyone with this link will be able to view your resume. Make sure to publish it first.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="publish-switch"
                            checked={resumeData.isPublished}
                            onCheckedChange={handlePublishChange}
                          />
                          <Label htmlFor="publish-switch">
                            {resumeData.isPublished ? 'Published' : 'Unpublished'}
                          </Label>
                        </div>
                        <Label htmlFor="share-link">Shareable Link</Label>
                        <div className="flex gap-2">
                            <Input id="share-link" defaultValue={`${window.location.origin}/share/${resumeId}`} readOnly />
                            <Button onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/share/${resumeId}`);
                                toast({ title: "Copied to clipboard!" });
                            }}>
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
                    <div className={cn("w-full shadow-lg transition-colors duration-300 relative overflow-hidden", isPreviewing && "border")} id="resume-preview-wrapper" style={{ ...resumeStyle, aspectRatio: 1 / 1.4142 }}>
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
          <aside className={cn("border-l bg-background transition-all duration-300 ease-in-out", isAiPanelOpen ? "w-80" : "w-0")}>
            <div className={cn("h-full transition-all flex flex-col", isAiPanelOpen ? 'opacity-100 p-4' : 'opacity-0 p-0 overflow-hidden')}>
                <Card className="flex-1 flex flex-col">
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
                <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-rewrite-input">Text to improve</Label>
                      <Textarea 
                        id="ai-rewrite-input"
                        placeholder="Paste a bullet point or paragraph from your resume here..."
                        value={textToRewrite}
                        onChange={(e) => setTextToRewrite(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <Button className="w-full mt-auto" onClick={handleGetSuggestions} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Rewrite
                    </Button>
                     {aiSuggestions.length > 0 && (
                        <Separator />
                     )}
                     <ScrollArea className="flex-1">
                        <div className="space-y-4">
                          {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="text-sm p-3 border rounded-lg bg-muted/50 relative group">
                              <p>{suggestion}</p>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                  navigator.clipboard.writeText(suggestion);
                                  toast({ title: "Copied to clipboard!"});
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                     </ScrollArea>
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
