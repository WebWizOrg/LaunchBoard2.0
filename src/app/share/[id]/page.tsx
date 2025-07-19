// src/app/share/[id]/page.tsx
'use client';

import { useEffect, useState, ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';

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
            ...data,
            styling: { ...data.styling, backgroundBlur: 0 },
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
    import('@/app/builder/page').then(mod => {
        setBuilderModule(mod);
    });
  }, []);

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
  
  if (!builderModule) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
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

  const OriginalBuilder = builderModule.default;
  const builderProto = OriginalBuilder.prototype;
  
  // This is a workaround to call the class method from the builder component instance
  // without having to instantiate the class here. We create a mock context for it.
  const renderSectionComponent = (section, templateContext) => {
    const mockThis = {
        state: { 
            resumeData, 
            isPreviewing: true, 
            theme: theme || 'light' 
        },
        props: {}, // Not needed for this method
        // Mock any methods it might call to prevent errors
        handleContentChange: () => {},
        handleListItemChange: () => {},
        addListItem: () => {},
        removeListItem: () => {},
        handleAvatarUpload: () => {},
        handleImageUpload: () => {},
    };

    return builderProto.renderSectionComponent.call(mockThis, section, { ...templateContext, isPublicView: true });
  }

  const renderTemplate = (isPublicView = false) => {
      const mockThis = {
          styling,
          resumeData,
          isPreviewing: true,
          renderSectionComponent,
      };
      return builderProto.renderTemplate.call(mockThis, isPublicView);
  }


  return (
    <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden bg-background" style={{ ...resumeStyle, aspectRatio: '1 / 1.4142' }}>
      <div className="absolute inset-0 transition-all" style={resumeBgStyle}></div>
      <div className="relative h-full w-full">
        {renderTemplate(true)}
      </div>
    </div>
  );
}

// This remains the default export for the route
export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <ReadOnlyResume resumeId={id} />
    </div>
  );
}
