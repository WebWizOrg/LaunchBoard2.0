
'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Book,
  Bot,
  Briefcase,
  CheckCircle,
  Code,
  Droplets,
  FileText,
  Font,
  Github,
  GraduationCap,
  GripVertical,
  Languages,
  LayoutTemplate,
  Link as LinkIcon,
  Map,
  Palette,
  QrCode,
  Save,
  Share2,
  Sparkles,
  Star,
  Type,
  User,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const sectionBlocks = {
  Standard: [
    { icon: <User />, name: 'Header' },
    { icon: <FileText />, name: 'Summary' },
    { icon: <GraduationCap />, name: 'Education' },
    { icon: <Briefcase />, name: 'Experience' },
    { icon: <Sparkles />, name: 'Skills' },
    { icon: <Code />, name: 'Projects' },
    { icon: <Award />, name: 'Certifications' },
    { icon: <Languages />, name: 'Languages' },
  ],
  Advanced: [
    { icon: <Book />, name: 'Publications' },
    { icon: <Star />, name: 'Achievements' },
    { icon: <Bot />, name: 'Cover Letter' },
  ],
};

const portfolioWidgets = [
  { icon: <User />, name: 'About Me' },
  { icon: <Code />, name: 'Project Cards' },
  { icon: <LinkIcon />, name: 'Blog Section' },
  { icon: <Github />, name: 'GitHub Integration' },
  { icon: <Video />, name: 'Embedded Videos' },
  { icon: <Map />, name: 'Interactive Map' },
];

const utilityWidgets = [
  { icon: <QrCode />, name: 'QR Code' },
  { icon: <Video />, name: 'Video Intro' },
];

const templates = [
  { name: 'Minimalist', image: 'https://placehold.co/150x212' },
  { name: 'Modern', image: 'https://placehold.co/150x212' },
  { name: 'Creative', image: 'https://placehold.co/150x212' },
  { name: 'Academic', image: 'https://placehold.co/150x212' },
];

const fonts = ['Inter', 'Space Grotesk', 'Roboto', 'Lato', 'Montserrat'];
const colors = ['#4842B3', '#16262E', '#FFB700', '#3498DB', '#E74C3C'];


export default function BuilderPage() {
    const [saveStatus, setSaveStatus] = useState('Saved'); // Saved, Saving, Unsaved

    return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-4rem)] bg-muted/40">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-background">
          <Tabs defaultValue="content" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <TabsContent value="content" className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Resume Sections</h3>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Standard</h4>
                  {sectionBlocks.Standard.map((block) => (
                    <Card key={block.name} className="flex items-center p-2 cursor-grab">
                      <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                      {React.cloneElement(block.icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                      <span className="text-sm font-medium">{block.name}</span>
                    </Card>
                  ))}
                </div>
                 <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Advanced</h4>
                  {sectionBlocks.Advanced.map((block) => (
                    <Card key={block.name} className="flex items-center p-2 cursor-grab">
                     <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                      {React.cloneElement(block.icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                      <span className="text-sm font-medium">{block.name}</span>
                    </Card>
                  ))}
                </div>
                <Separator className="my-4" />
                 <h3 className="mb-4 text-lg font-semibold">Portfolio Widgets</h3>
                  <div className="space-y-2">
                     {portfolioWidgets.map((widget) => (
                        <Card key={widget.name} className="flex items-center p-2 cursor-grab">
                          <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                          {React.cloneElement(widget.icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                          <span className="text-sm font-medium">{widget.name}</span>
                        </Card>
                    ))}
                  </div>
                 <Separator className="my-4" />
                 <h3 className="mb-4 text-lg font-semibold">Utility Widgets</h3>
                  <div className="space-y-2">
                     {utilityWidgets.map((widget) => (
                        <Card key={widget.name} className="flex items-center p-2 cursor-grab">
                          <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                          {React.cloneElement(widget.icon, { className: 'h-5 w-5 mr-3 text-primary' })}
                          <span className="text-sm font-medium">{widget.name}</span>
                        </Card>
                    ))}
                  </div>
              </TabsContent>
              <TabsContent value="templates" className="p-4">
                 <h3 className="mb-4 text-lg font-semibold">Select a Template</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {templates.map(template => (
                        <Card key={template.name} className="overflow-hidden cursor-pointer hover:border-primary">
                            <img src={template.image} alt={template.name} className="w-full h-auto object-cover"/>
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
                        <div key={color} className="h-8 w-8 rounded-full cursor-pointer border-2" style={{ backgroundColor: color }}></div>
                    ))}
                  </div>
                </div>
                 <div>
                  <h3 className="mb-4 text-lg font-semibold">Fonts</h3>
                  <div className="space-y-2">
                    {fonts.map(font => (
                        <Button key={font} variant="outline" className="w-full justify-start">{font}</Button>
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
                <CheckCircle className="h-4 w-4 text-green-500"/>
                <span>{saveStatus}</span>
             </div>
             <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon"> <AlertCircle className="h-5 w-5" /> </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>ATS Compliance: Good</p></TooltipContent>
                </Tooltip>
                 <Button variant="outline" size="sm" onClick={() => setSaveStatus('Saving...')}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                </Button>
                <Button size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
             </div>
           </header>
          <ScrollArea className="flex-1 p-8">
            <Card className="w-full max-w-4xl mx-auto aspect-[8.5/11] shadow-lg">
                <CardContent className="p-8">
                    {/* Real-time resume preview */}
                     <div className="text-center">
                        <h1 className="text-4xl font-bold font-headline">Your Name</h1>
                        <p className="text-muted-foreground">Your Tagline or Role</p>
                    </div>
                    <Separator className="my-6" />
                     <div>
                        <h2 className="text-xl font-bold font-headline mb-2 border-b-2 border-primary inline-block">Summary</h2>
                        <Textarea placeholder="Write a powerful summary to grab attention..."/>
                    </div>
                     <div className="mt-6">
                        <h2 className="text-xl font-bold font-headline mb-2 border-b-2 border-primary inline-block">Experience</h2>
                        <Textarea placeholder="Detail your professional experience..."/>
                    </div>
                </CardContent>
            </Card>
          </ScrollArea>
        </main>
        
        {/* AI Sidebar */}
        <aside className="w-72 border-l bg-background p-4">
             <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bot className="h-6 w-6 text-primary"/>
                        Smart Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Get AI-powered help to improve your resume.
                    </p>
                    <Button className="w-full mt-4">
                        <Sparkles className="mr-2 h-4 w-4"/>
                        Suggest Bullet Points
                    </Button>
                </CardContent>
             </Card>
        </aside>

      </div>
    </TooltipProvider>
    )
}
