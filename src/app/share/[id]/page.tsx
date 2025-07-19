// src/app/share/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { defaultResumeData } from '@/app/builder/page';

// This component fetches and renders the actual resume content
function ReadOnlyResume({ resumeId }: { resumeId: string }) {
  const [resumeData, setResumeData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [builderModule, setBuilderModule] = useState<any>(null);
  const { theme } = useTheme();
  const { user } = useAuth(); // Using auth to ensure styling context is available

  useEffect(() => {
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
  
  useEffect(() => {
    // This dynamic import is a workaround to use builder page's render logic
    // without creating circular dependencies or restructuring the entire project.
    import('@/app/builder/page').then(mod => {
        // We need to access the prototype of the default export if it's a class component
        if (mod.default && mod.default.prototype && mod.default.prototype.renderTemplate) {
             setBuilderModule({
                renderTemplate: mod.default.prototype.renderTemplate,
                renderSectionComponent: mod.default.prototype.renderSectionComponent
            });
        }
    }).catch(err => console.error("Failed to load builder module", err));
  }, []);

  if (loading || !builderModule) {
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

  // Mock 'this' context for calling prototype methods from the builder component.
  // This is a complex workaround because we can't instantiate the builder page class directly here.
  const mockBuilderInstance = {
      props: { resumeData },
      state: { isPreviewing: true, theme: theme || 'light' },
      resumeData,
      styling,
      isPreviewing: true,
      theme: theme || 'light',
      renderTemplate: function(isPublicView = false) {
          if (!builderModule.renderTemplate) return null;
          // 'this' is bound to mockBuilderInstance
          return builderModule.renderTemplate.call(this, isPublicView);
      },
      renderSectionComponent: (section: any, templateContext = {}) => {
        if (!builderModule.renderSectionComponent) return null;
        const mockedThis = {
          props: {},
          state: {},
          handleContentChange: () => {},
          handleListItemChange: () => {},
          addListItem: () => {},
          removeListItem: () => {},
          handleAvatarUpload: () => {},
          handleImageUpload: () => {},
          cn,
          resumeData,
        };
        return builderModule.renderSectionComponent.call(mockedThis, section, { ...templateContext, isPublicView: true });
      }
  };


  return (
    <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-background" style={resumeStyle}>
      <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
      <div className="relative h-full w-full">
        {mockBuilderInstance.renderTemplate(true)}
      </div>
    </div>
  );
}

// This remains the default export for the route
export default function SharePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <ReadOnlyResume resumeId={params.id} />
    </div>
  );
}
