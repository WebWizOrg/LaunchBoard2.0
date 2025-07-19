// src/app/portfolio/builder/page.tsx
'use client';

import React, { useState, useTransition, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Globe,
  Newspaper,
  Heart,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// Wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  
  return <>{children}</>;
}


const initialSections = [
    { id: 'header', icon: <User />, name: 'Header' },
    { id: 'about', icon: <FileText />, name: 'About Me' },
    { id: 'projects', icon: <Code />, name: 'Projects' },
    { id: 'experience', icon: <Briefcase />, name: 'Experience' },
    { id: 'blog', icon: <Newspaper />, name: 'Blog Posts' },
    { id: 'skills', icon: <Sparkles />, name: 'Skills' },
    { id: 'testimonials', icon: <Quote />, name: 'Testimonials' },
    { id: 'contact', icon: <Phone />, name: 'Contact' },
    { id: 'gallery', icon: <ImageIcon />, name: 'Gallery' },
    { id: 'cta', icon: <Heart />, name: 'Call to Action' },
    { id: 'faq', icon: <MessageSquare />, name: 'FAQ' },
    { id: 'line_break', icon: <Minus/>, name: 'Separator' },
];

const allSectionsMap = new Map(initialSections.map((s) => [s.id, s]));

const templates = [
  { name: 'Modern Dark', id: 'modern-dark', image: 'https://placehold.co/200x150.png', hint: 'dark portfolio' },
  { name: 'Clean Light', id: 'clean-light', image: 'https://placehold.co/200x150.png', hint: 'light portfolio' },
  { name: 'Brutalist', id: 'brutalist', image: 'https://placehold.co/200x150.png', hint: 'brutalist portfolio' },
];

const DraggableSection = ({ id, name, icon }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
  return (
    <Card ref={setNodeRef} {...attributes} {...listeners} className={cn('flex items-center p-2 cursor-grab', isDragging && 'opacity-50 z-50')}>
      <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
      {React.cloneElement(icon, { className: 'h-5 w-5 mr-3 text-primary' })}
      <span className="text-sm font-medium">{name}</span>
    </Card>
  );
};

function SortableSection({ id, children, onRemove, isPreviewing }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : 'auto',
    };
  
    return (
      <div ref={setNodeRef} style={style} className="relative group/section bg-background">
         {!isPreviewing && (
          <>
            <div {...attributes} {...listeners} className="absolute -left-7 top-1/2 -translate-y-1/2 p-1 bg-background border rounded-md shadow-md opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab z-20">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <button onClick={() => onRemove(id)} className="absolute -top-3 -right-3 h-7 w-7 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive opacity-0 group-hover/section:opacity-100 transition-opacity z-20">
              <X className="h-4 w-4" />
            </button>
          </>
         )}
        {children}
      </div>
    );
  }

const DroppableCanvas = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'portfolio-canvas-droppable' });
  return (
    <div ref={setNodeRef} className={cn('min-h-full w-full', isOver && 'outline-dashed outline-2 outline-primary outline-offset-4')}>
      {children}
    </div>
  );
};

const createNewItem = (itemType) => {
    const common = { id: `${itemType}_item_${Date.now()}` };
    switch (itemType) {
        case 'projects': return { ...common, title: 'New Project', description: 'A short description of your project.', image: 'https://placehold.co/600x400.png', hint: 'placeholder image', link: '#' };
        case 'experience': return { ...common, company: 'Company Name', role: 'Your Role', dates: '2022 - Present', description: 'Key achievements and responsibilities.' };
        case 'blog': return { ...common, title: 'My Latest Blog Post', summary: 'A brief summary of what this post is about.', link: '#' };
        case 'skills': return { ...common, name: 'New Skill' };
        case 'testimonials': return { ...common, quote: 'This is an amazing service!', author: 'Happy Client', image: 'https://placehold.co/100x100.png', hint: 'person portrait' };
        case 'gallery': return { ...common, src: 'https://placehold.co/600x400.png', hint: 'placeholder image', alt: 'Gallery image' };
        case 'faq': return { ...common, question: 'What is a frequently asked question?', answer: 'This is the answer to that question.' };
        default: return { ...common, text: '' };
    }
};

const defaultPortfolioData = {
  name: 'Untitled Portfolio',
  isPublished: false,
  sections: [
    {id: 'header_1', type: 'header'},
    {id: 'about_1', type: 'about'},
    {id: 'projects_1', type: 'projects'}
  ],
  content: {
    header_1: { title: 'Your Name', tagline: 'Welcome to My Portfolio', buttonText: 'Contact Me', buttonLink: '#contact' },
    about_1: { title: 'About Me', text: 'I am a passionate creator, developer, and designer...', image: 'https://placehold.co/400x400.png', hint: 'person portrait' },
    projects_1: { title: 'My Projects', items: [createNewItem('projects')] }
  },
  styling: {
    template: 'modern-dark',
    primaryColor: '#3b82f6',
    backgroundColor: '#111827',
    textColor: '#f9fafb',
    fontFamily: 'var(--font-inter)',
  }
};

export default function PortfolioBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const portfolioId = searchParams.get('id');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeId, setActiveId] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [portfolioData, setPortfolioData] = useState<DocumentData | null>(null);

  // Hooks are now called unconditionally
  const sensors = useSensors(useSensor(PointerSensor));

  const debouncedSave = useCallback(
    debounce((dataToSave) => {
      if (!user || !portfolioId) return;
      setSaveStatus('Saving...');
      const portfolioRef = doc(db, 'users', user.uid, 'portfolios', portfolioId);
      setDoc(portfolioRef, dataToSave, { merge: true }).then(() => {
        setSaveStatus('Saved');
      }).catch(error => {
        console.error("Error saving document: ", error);
        setSaveStatus('Error');
      });
    }, 1000),
    [user, portfolioId]
  );
  
  useEffect(() => {
    if (portfolioData && isDataLoaded) {
      debouncedSave(portfolioData);
    }
  }, [portfolioData, debouncedSave, isDataLoaded]);

  useEffect(() => {
    if (!user) return;
    if (!portfolioId) {
        router.push('/dashboard');
        return;
    }

    const portfolioRef = doc(db, 'users', user.uid, 'portfolios', portfolioId);
    
    const unsubscribe = onSnapshot(portfolioRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPortfolioData({ ...defaultPortfolioData, ...data, styling: { ...defaultPortfolioData.styling, ...data.styling } });
      } else {
        const newPortfolioData = { ...defaultPortfolioData, updatedAt: new Date() };
        setPortfolioData(newPortfolioData);
        setDoc(portfolioRef, newPortfolioData);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Error fetching document:", error);
      setIsDataLoaded(true);
    });

    return () => unsubscribe();
  }, [user, portfolioId, router]);

  // Conditional rendering check is now after all hooks
  if (!isDataLoaded || !portfolioData) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const updatePortfolioData = (updater) => {
    setPortfolioData(prev => {
      if (!prev) return null;
      const newState = updater(prev);
      return { ...newState, updatedAt: new Date() };
    });
  };

  const handleStyleChange = (property, value) => {
    updatePortfolioData(prev => ({ ...prev, styling: { ...prev.styling, [property]: value } }));
  };
  
  const handleNameChange = (newName: string) => {
    updatePortfolioData(prev => ({...prev, name: newName}));
  }

  const handleContentChange = (sectionId, field, value) => {
    updatePortfolioData(prev => ({ ...prev, content: { ...prev.content, [sectionId]: { ...prev.content[sectionId], [field]: value }}}));
  };

  const handleListItemChange = (sectionId, itemIndex, field, value) => {
      updatePortfolioData(prev => {
          const newItems = [...prev.content[sectionId].items];
          newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
          return { ...prev, content: { ...prev.content, [sectionId]: { ...prev.content[sectionId], items: newItems }}};
      });
  };

  const addListItem = (sectionId, itemType) => {
      updatePortfolioData(prev => {
          const newItem = createNewItem(itemType);
          const newItems = [...(prev.content[sectionId]?.items || []), newItem];
          return { ...prev, content: { ...prev.content, [sectionId]: { ...prev.content[sectionId], items: newItems }}};
      });
  };

  const removeListItem = (sectionId, itemIndex) => {
      updatePortfolioData(prev => {
          const newItems = [...prev.content[sectionId].items];
          newItems.splice(itemIndex, 1);
          return { ...prev, content: { ...prev.content, [sectionId]: { ...prev.content[sectionId], items: newItems }}};
      });
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) return;
  
    const isSidebarItem = allSectionsMap.has(active.id);
    const isCanvasItem = portfolioData?.sections.some(s => s.id === active.id);
    const isDroppingOnCanvas = over.id === 'portfolio-canvas-droppable';
    const isDroppingOnCanvasItem = portfolioData?.sections.some(s => s.id === over.id);
  
    if (isSidebarItem && (isDroppingOnCanvas || isDroppingOnCanvasItem)) {
      const newSectionType = active.id;
      const newSectionId = `${newSectionType}_${Date.now()}`;
      const newSectionData = { id: newSectionId, type: newSectionType };
      
      let defaultContent = { title: allSectionsMap.get(newSectionType)?.name || 'New Section' };
      if (['projects', 'experience', 'blog', 'skills', 'testimonials', 'gallery', 'faq'].includes(newSectionType)) {
          defaultContent.items = [];
      } else {
        defaultContent.text = '';
      }
  
      const overIndex = isDroppingOnCanvasItem ? portfolioData.sections.findIndex(s => s.id === over.id) : portfolioData.sections.length;
      
      updatePortfolioData(prev => {
        const newSections = [...prev.sections];
        newSections.splice(overIndex, 0, newSectionData);
        return { ...prev, sections: newSections, content: { ...prev.content, [newSectionId]: defaultContent }};
      });

    } else if (isCanvasItem && isDroppingOnCanvasItem) {
      if (active.id !== over.id) {
        const activeIndex = portfolioData.sections.findIndex(s => s.id === active.id);
        const overIndex = portfolioData.sections.findIndex(s => s.id === over.id);
        updatePortfolioData((prev) => ({ ...prev, sections: arrayMove(prev.sections, activeIndex, overIndex) }));
      }
    }
  };

  const removeSection = (idToRemove) => {
    updatePortfolioData(prev => {
        const newContent = { ...prev.content };
        delete newContent[idToRemove];
        return { ...prev, sections: prev.sections.filter(section => section.id !== idToRemove), content: newContent };
    });
  };

  const handlePublishChange = async (isPublished: boolean) => {
    if (!portfolioId || !portfolioData) return;
    updatePortfolioData(prev => ({ ...prev, isPublished }));
    const publicPortfolioRef = doc(db, 'publishedPortfolios', portfolioId);
    if (isPublished) {
        toast({ title: 'Publishing portfolio...' });
        await setDoc(publicPortfolioRef, {...portfolioData, isPublished: true, ownerId: user.uid });
        toast({ title: 'Portfolio published!', description: 'Anyone with the link can now view it.' });
    } else {
        toast({ title: 'Unpublishing portfolio...' });
        await deleteDoc(publicPortfolioRef);
        toast({ title: 'Portfolio unpublished.' });
    }
  };

  const renderSectionComponent = (section, isPublicView = false) => {
    const content = portfolioData.content[section.id] || {};
    const isEditable = !isPreviewing && !isPublicView;

    // A simple container for sections, more styling can be added via templates
    const SectionWrapper = ({children, id}) => <section id={id} className="w-full px-8 py-12 md:px-16 md:py-20">{children}</section>;
    const Title = ({children}) => <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 text-center">{children}</h2>;

    switch (section.type) {
        case 'header': return (
            <header className="w-full h-[60vh] flex items-center justify-center text-center px-8" style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}>
                <div className="space-y-4">
                    {isEditable ? <Input value={content.title || ''} onChange={e => handleContentChange(section.id, 'title', e.target.value)} className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl bg-transparent border-0 text-center h-auto p-0" /> : <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl">{content.title}</h1>}
                    {isEditable ? <Input value={content.tagline || ''} onChange={e => handleContentChange(section.id, 'tagline', e.target.value)} className="max-w-[700px] mx-auto text-lg md:text-xl text-center bg-transparent border-0 h-auto p-0" /> : <p className="max-w-[700px] mx-auto text-lg md:text-xl">{content.tagline}</p>}
                    <div className="flex gap-4 justify-center">
                        {isEditable ? <Input value={content.buttonText || ''} onChange={e => handleContentChange(section.id, 'buttonText', e.target.value)} placeholder="Button Text" /> : <Button asChild size="lg"><a href={content.buttonLink}>{content.buttonText}</a></Button>}
                    </div>
                </div>
            </header>
        );
        case 'about': return (
            <SectionWrapper id="about">
                <div className="container mx-auto grid items-center gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        {isEditable ? <Input value={content.title || ''} onChange={e => handleContentChange(section.id, 'title', e.target.value)} className="text-3xl font-bold tracking-tighter sm:text-4xl bg-transparent border-0 h-auto p-0" /> : <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{content.title}</h2>}
                        {isEditable ? <Textarea value={content.text || ''} onChange={e => handleContentChange(section.id, 'text', e.target.value)} className="text-muted-foreground bg-transparent border-0 p-0" rows={6} /> : <p className="text-muted-foreground">{content.text}</p>}
                    </div>
                    <Image src={content.image || "https://placehold.co/400x400.png"} width={400} height={400} alt="About Me" className="mx-auto rounded-lg" data-ai-hint={content.hint || 'person portrait'}/>
                </div>
            </SectionWrapper>
        );
        case 'projects': return (
            <SectionWrapper id="projects">
                <div className="container mx-auto">
                    {isEditable ? <Input value={content.title || ''} onChange={e => handleContentChange(section.id, 'title', e.target.value)} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 text-center bg-transparent border-0 h-auto p-0"/> : <Title>{content.title}</Title>}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {(content.items || []).map((item, index) => (
                            <Card key={item.id} className="group/item relative">
                                {isEditable && <button onClick={() => removeListItem(section.id, index)} className="absolute top-2 right-2 h-6 w-6 bg-background border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity z-10"><X className="h-4 w-4" /></button>}
                                <CardContent className="p-4">
                                    <Image src={item.image || "https://placehold.co/600x400.png"} width={600} height={400} alt={item.title} className="rounded-md mb-4" data-ai-hint={item.hint || 'project screenshot'}/>
                                    {isEditable ? <Input value={item.title || ''} onChange={e => handleListItemChange(section.id, index, 'title', e.target.value)} className="text-xl font-bold bg-transparent border-0 h-auto p-0" /> : <h3 className="text-xl font-bold">{item.title}</h3>}
                                    {isEditable ? <Textarea value={item.description || ''} onChange={e => handleListItemChange(section.id, index, 'description', e.target.value)} className="text-muted-foreground mt-2 bg-transparent border-0 p-0" rows={3} /> : <p className="text-muted-foreground mt-2">{item.description}</p>}
                                    {isEditable ? <Input value={item.link || ''} onChange={e => handleListItemChange(section.id, index, 'link', e.target.value)} className="mt-4" placeholder="Link URL" /> : <Button asChild variant="link" className="mt-4 p-0"><a href={item.link}>View Project <ArrowRight className="ml-2 h-4 w-4" /></a></Button>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {isEditable && <div className="text-center mt-8"><Button onClick={() => addListItem(section.id, 'projects')}><Plus className="mr-2 h-4 w-4"/> Add Project</Button></div>}
                </div>
            </SectionWrapper>
        );
        case 'contact': return (
            <SectionWrapper id="contact">
                <div className="container mx-auto max-w-2xl text-center">
                    {isEditable ? <Input value={content.title || ''} onChange={e => handleContentChange(section.id, 'title', e.target.value)} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 bg-transparent border-0 h-auto p-0 text-center"/> : <Title>{content.title}</Title>}
                    {isEditable ? <Textarea value={content.text || ''} onChange={e => handleContentChange(section.id, 'text', e.target.value)} className="text-muted-foreground mt-2 bg-transparent border-0 p-0 text-center" rows={3} /> : <p className="text-muted-foreground">{content.text}</p>}
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
                    <Title>
                        {isEditable ? <Input value={content.title || section.type} onChange={e => handleContentChange(section.id, 'title', e.target.value)} className="bg-transparent border-0 h-auto p-0 text-center" /> : (content.title || section.type)}
                    </Title>
                    <div className="text-center text-muted-foreground">
                        {isEditable ? <Textarea value={content.text || ''} onChange={e => handleContentChange(section.id, 'text', e.target.value)} placeholder="Content for this section..." /> : <p>{content.text}</p>}
                    </div>
                </div>
            </SectionWrapper>
        );
    }
  };
  
  const portfolioSectionsIds = portfolioData?.sections.map(s => s.id) || [];
  const styling = portfolioData?.styling || defaultPortfolioData.styling;

  const portfolioStyle = {
    '--portfolio-primary-color': styling.primaryColor,
    '--portfolio-background-color': styling.backgroundColor,
    '--portfolio-text-color': styling.textColor,
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--portfolio-background-color)',
    color: 'var(--portfolio-text-color)',
  };

  return (
    <ClientOnly>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <TooltipProvider>
          <div className="flex h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="w-80 border-r bg-background flex flex-col">
              <Tabs defaultValue="content" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                  <TabsContent value="content" className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">Sections</h3>
                    <SortableContext items={initialSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {initialSections.map((block) => <DraggableSection key={block.id} {...block} />)}
                      </div>
                    </SortableContext>
                  </TabsContent>
                  <TabsContent value="marketplace" className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">Templates</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {templates.map(template => (
                        <Card key={template.id} onClick={() => handleStyleChange('template', template.id)} className={cn("overflow-hidden cursor-pointer", styling.template === template.id && "ring-2 ring-primary")}>
                          <Image src={template.image} alt={template.name} width={200} height={150} className="w-full h-auto object-cover" data-ai-hint={template.hint} />
                          <p className="p-2 text-sm text-center font-medium bg-card">{template.name}</p>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="design" className="p-4 space-y-6">
                      <div>
                          <h3 className="mb-4 text-lg font-semibold">Colors</h3>
                          <div className="space-y-4">
                              <div className="flex items-center justify-between"><Label>Primary</Label><Input type="color" value={styling.primaryColor} onChange={(e) => handleStyleChange('primaryColor', e.target.value)} className="w-24 p-1 h-8" /></div>
                              <div className="flex items-center justify-between"><Label>Background</Label><Input type="color" value={styling.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="w-24 p-1 h-8" /></div>
                              <div className="flex items-center justify-between"><Label>Text</Label><Input type="color" value={styling.textColor} onChange={(e) => handleStyleChange('textColor', e.target.value)} className="w-24 p-1 h-8" /></div>
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
                  <Input value={portfolioData.name} onChange={(e) => handleNameChange(e.target.value)} className="text-sm font-semibold h-8 border-0 focus-visible:ring-1 bg-transparent" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-24">
                    {saveStatus === 'Saving...' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saveStatus === 'Saved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {saveStatus === 'Error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span>{saveStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip><TooltipTrigger asChild><Button variant={isPreviewing ? "secondary" : "ghost"} size="icon" onClick={() => setIsPreviewing(!isPreviewing)}> <Eye className="h-5 w-5" /> </Button></TooltipTrigger><TooltipContent><p>{isPreviewing ? "Exit Preview" : "Preview"}</p></TooltipContent></Tooltip>
                  
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm"><Share2 className="mr-2 h-4 w-4" />Share</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader><DialogTitle>Share Your Portfolio</DialogTitle><DialogDescription>Anyone with this link will be able to view your portfolio. Make sure to publish it first.</DialogDescription></DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="flex items-center space-x-2"><Switch id="publish-switch" checked={portfolioData.isPublished} onCheckedChange={handlePublishChange} /><Label htmlFor="publish-switch">{portfolioData.isPublished ? 'Published' : 'Unpublished'}</Label></div>
                          <Label htmlFor="share-link">Shareable Link</Label>
                          <div className="flex gap-2"><Input id="share-link" defaultValue={`${window.location.origin}/portfolio/share/${portfolioId}`} readOnly /><Button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/portfolio/share/${portfolioId}`); toast({ title: "Copied to clipboard!" });}}><Copy className="h-4 w-4"/></Button></div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </header>
              <ScrollArea className="flex-1 bg-muted">
                  <div className={cn("mx-auto transition-all", isPreviewing ? 'w-full' : 'w-[90%] max-w-7xl py-8')}>
                      <div className={cn("shadow-lg overflow-hidden", isPreviewing ? 'h-full' : 'rounded-lg border')} style={portfolioStyle}>
                        <DroppableCanvas>
                            <SortableContext items={portfolioSectionsIds} strategy={verticalListSortingStrategy} disabled={isPreviewing}>
                              {portfolioData.sections.length > 0 ? portfolioData.sections.map((section) => (
                                  <SortableSection key={section.id} id={section.id} onRemove={removeSection} isPreviewing={isPreviewing}>
                                      {renderSectionComponent(section)}
                                  </SortableSection>
                              )) : (
                                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                                      <p>Drag sections from the left panel to start building your portfolio.</p>
                                  </div>
                              )}
                            </SortableContext>
                        </DroppableCanvas>
                      </div>
                  </div>
              </ScrollArea>
            </main>
            <DragOverlay>
              {activeId && allSectionsMap.has(activeId) ? (
                <Card className='flex items-center p-2 cursor-grabbing opacity-80'><GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />{React.cloneElement(allSectionsMap.get(activeId).icon, { className: 'h-5 w-5 mr-3 text-primary' })}<span className="text-sm font-medium">{allSectionsMap.get(activeId).name}</span></Card>
              ) : null}
            </DragOverlay>

          </div>
        </TooltipProvider>
      </DndContext>
    </ClientOnly>
  );
}
