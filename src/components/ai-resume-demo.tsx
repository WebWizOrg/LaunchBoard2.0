'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateAiResumeDemo } from '@/ai/flows/ai-resume-demo';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters.'),
});

function Typewriter({ text }: { text: string }) {
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
      }
    }, 10);
    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="whitespace-pre-wrap font-mono text-sm">{displayText}</p>;
}


export function AiResumeDemo() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
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
        setResult(response.resume);
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
        {(isPending || result) && (
          <div className="mt-6">
            <Card className="bg-background/70">
              <CardContent className="p-6">
                {isPending && (
                  <div className="flex items-center text-muted-foreground">
                    <Bot className="mr-2 h-5 w-5 animate-pulse" />
                    Generating your sample resume...
                  </div>
                )}
                {result && <Typewriter text={result} />}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
