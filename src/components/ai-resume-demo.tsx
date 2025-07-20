
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateAiResumeDemo } from '@/ai/flows/ai-resume-demo';
import { ReadOnlyResume } from '@/components/read-only-resume';
import { DocumentData } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters.'),
});

function Typewriter({ text, onComplete }: { text: string; onComplete: () => void }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        onComplete();
      }
    }, 10);
    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <p className="whitespace-pre-wrap font-mono text-sm">{displayText}</p>;
}


export function AiResumeDemo() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DocumentData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await generateAiResumeDemo({ jobTitle: values.jobTitle });
        
        // This is a mock structure that matches what ReadOnlyResume expects
        const demoResumeData = {
            name: response.name,
            isPublished: true,
            sections: [
                {id: 'header_1', type: 'header'},
                {id: 'contact_1', type: 'contact'},
                {id: 'summary_1', type: 'summary'},
                {id: 'experience_1', type: 'experience'},
                {id: 'education_1', type: 'education'},
                {id: 'skills_1', type: 'skills'},
                {id: 'languages_1', type: 'languages'},
                {id: 'certifications_1', type: 'certifications'},
                {id: 'publications_1', type: 'publications'},
            ],
            content: {
                header_1: { name: response.name, tagline: values.jobTitle, showAvatar: true, avatar: '' },
                contact_1: { title: 'Contact', email: response.email, phone: response.phone, address: response.address },
                summary_1: { title: 'Summary', text: response.summary },
                experience_1: { title: 'Experience', items: response.experience },
                education_1: { title: 'Education', items: response.education },
                skills_1: { title: 'Skills', text: response.skills.join(', ') },
                languages_1: { title: 'Languages', text: response.languages },
                certifications_1: { title: 'Certifications', items: response.certifications },
                publications_1: { title: 'Publications', text: response.publications },
            },
            styling: {
                template: 'vertical-split', // Use a specific template
                accentColor: '#4842B3',
                accentTextColor: '#ffffff',
                backgroundColorLight: '#ffffff',
                backgroundColorDark: '#1a202c',
                fontFamily: 'var(--font-inter)',
            }
        };
        setResult(demoResumeData);

      } catch (error) {
        console.error('Error generating AI resume demo:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate AI resume. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input 
                      placeholder="e.g., 'Software Engineer', 'Product Manager'" 
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="h-12 w-full md:w-auto text-base" size="lg">
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate
            </Button>
          </form>
        </Form>
        <div className="mt-6">
            <Card className="bg-background/70 min-h-[400px]">
              <CardContent className="p-0">
                {isPending && (
                  <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground p-6">
                    <Bot className="mr-4 h-8 w-8 animate-pulse" />
                    <div className="text-lg">Generating your sample resume...</div>
                  </div>
                )}
                {result && <ReadOnlyResume resumeData={result} />}
              </CardContent>
            </Card>
          </div>
      </CardContent>
    </Card>
  );
}
