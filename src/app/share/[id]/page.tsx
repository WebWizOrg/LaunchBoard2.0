// src/app/share/[id]/page.tsx
'use client';

import { useEffect, useState, ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import BuilderPage from '@/app/builder/page';
import { useTheme } from 'next-themes';

export default function SharePage({ params }: { params: { id: string } }) {
  const [resumeData, setResumeData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const resumeRef = doc(db, 'publishedResumes', params.id);
        const docSnap = await getDoc(resumeRef);

        if (docSnap.exists() && docSnap.data().isPublished) {
          const data = docSnap.data();
          setResumeData({
            ...data,
            styling: { ...data.styling, backgroundBlur: 0 },
          });
        } else {
          setResumeData(null); // Triggers notFound() later
        }
      } catch (error) {
        console.error("Error fetching shared resume:", error);
        setResumeData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [params.id]);

  useEffect(() => {
    // Force light theme for consistency in shared view, but can be changed by user
    // setTheme('light');
  }, [setTheme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!resumeData) {
    return notFound();
  }

  const styling = resumeData.styling || {};
  const resumeStyle = {
    '--resume-accent-color': styling.accentColor,
    '--resume-accent-text-color': styling.accentTextColor,
    '--resume-background': theme === 'dark' ? styling.backgroundColorDark : styling.backgroundColorLight,
    '--resume-foreground': theme === 'dark' ? '#f8f8f8' : '#111111',
    fontFamily: styling.fontFamily,
    backgroundColor: 'var(--resume-background)',
    color: 'var(--resume-foreground)',
  };

  const resumeBgStyle = {
    backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: `brightness(${styling.backgroundBrightness}%)`,
  };

  // This is a workaround to render the builder's template logic
  // in a read-only context. We'll dynamically create a component
  // that has access to the resume data but none of the editing functions.
  const ReadOnlyResume: ComponentType<any> = () => {
    const [builderModule, setBuilderModule] = useState<any>(null);

    useEffect(() => {
        // Dynamically import the builder page to access its renderTemplate function
        import('@/app/builder/page').then(mod => {
            setBuilderModule(mod);
        });
    }, []);

    if (!builderModule) return <Loader2 className="h-8 w-8 animate-spin" />;

    // Create a mock instance of the BuilderPage to call its renderTemplate method
    // This is a bit of a hack, but it reuses the complex template rendering logic
    // without duplicating it.
    const mockBuilderInstance = {
        state: { resumeData, isPreviewing: true, theme },
        props: {},
        context: {},
        refs: {},
        updater: {
            enqueueSetState: () => {},
            enqueueReplaceState: () => {},
            isMounted: () => true
        },
        // Provide dummy functions for all the handlers
        handleStyleChange: () => {},
        handleNameChange: () => {},
        handleContentChange: () => {},
        handleListItemChange: () => {},
        addListItem: () => {},
        removeListItem: () => {},
        renderSectionComponent: (section, context) => {
            // Re-bind the renderSectionComponent to our mock context
            return builderModule.default.prototype.renderSectionComponent.call({
                ...mockBuilderInstance,
                props: { resumeData, isPreviewing: true }
            }, section, { ...context, isPublicView: true });
        }
    };

    // Temporarily patch the prototype to access internal methods
    const OriginalBuilder = builderModule.default;
    const builderProto = OriginalBuilder.prototype;
    const boundRenderTemplate = builderProto.renderTemplate.bind({ ...mockBuilderInstance, renderSectionComponent: mockBuilderInstance.renderSectionComponent, resumeData, styling, isPreviewing: true });
    
    return boundRenderTemplate(true);
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden" style={{ ...resumeStyle, aspectRatio: '1 / 1.4142' }}>
         <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
         <div className="relative h-full w-full">
            <ReadOnlyResume />
         </div>
      </div>
    </div>
  );
}
