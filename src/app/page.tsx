
// src/app/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  Star,
  FileText,
  Palette,
  Share2,
  Bot,
  Upload,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AiResumeDemo } from '@/components/ai-resume-demo';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BeforeAfterSlider } from '@/components/before-after-slider';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleUploadClick = () => {
    if (user) {
      router.push('/builder');
    } else {
      router.push('/login');
    }
  };

  const templates = [
    { name: 'Horizontal Split', id: 'horizontal-split', image: '/images/resume(1).png', hint: 'resume template' },
    { name: 'Vertical Split', id: 'vertical-split', image: '/images/resume(2).png', hint: 'modern resume' },
    { name: 'Classic', id: 'classic', image: '/images/resume(3).png', hint: 'classic resume' },
    { name: 'ATS-Friendly', id: 'ats-friendly', image: '/images/resume(4).png', hint: 'ATS resume' },
    { name: 'Creative', id: 'creative', image: '/images/resume(5).png', hint: 'creative resume' },
    { name: 'Student', id: 'student', image: '/images/resume(6).png', hint: 'student resume' },
    { name: 'Developer', id: 'developer', image: '/images/resume(7).png', hint: 'developer resume' },
    { name: 'Minimal CV', id: 'minimal-cv', image: '/images/resume(8).png', hint: 'minimal cv' },
    { name: 'Two-Column Balanced', id: 'two-column-balanced', image: '/images/resume(9).png', hint: 'two column resume' },
    { name: 'Showcase First', id: 'showcase-first', image: '/images/resume(10).png', hint: 'portfolio resume' },
  ];

  const testimonials = [
    {
      name: 'Sarah L.',
      title: 'Software Engineer at TechCorp',
      avatar: 'https://placehold.co/48x48.png',
      hint: 'woman portrait',
      text: 'Launchboard helped me create a professional resume in minutes. The AI suggestions were a game-changer and I landed my dream job!',
    },
    {
      name: 'Michael B.',
      title: 'UX Designer',
      avatar: 'https://placehold.co/48x48.png',
      hint: 'man portrait',
      text: 'The templates are beautiful and so easy to customize. I finally have a portfolio that truly represents my work. Highly recommended!',
    },
    {
      name: 'Jessica P.',
      title: 'Recent Graduate',
      avatar: 'https://placehold.co/48x48.png',
      hint: 'person smiling',
      text: 'As a student, building a resume was daunting. Launchboard made it simple and fun. The online hosting is a huge plus for applications.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-background overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.7),rgba(255,255,255,0))]"></div>
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <Badge variant="outline" className="py-1 px-4 rounded-full bg-accent/10 border-accent/30 text-accent font-medium">
              Now with AI-Powered Suggestions
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline mt-6 tracking-tighter">
              Verified. Amplified. Launched.
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-muted-foreground">
              The ultimate platform to create stunning resumes and portfolios that impress recruiters and land you your dream job.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#ai-demo">Try the AI Demo <ChevronRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section id="video-intro" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                See Launchboard in Action
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Watch our quick introduction to see how you can build a stunning portfolio in minutes.
              </p>
            </div>
            <div className="max-w-4xl mx-auto mt-12 shadow-2xl rounded-lg overflow-hidden border">
              <div className="relative aspect-video">
                  <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/QouVw36A_38" // Placeholder video
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                  ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* AI Resume Demo Section */}
        <section id="ai-demo" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Experience the Magic of AI
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Don't know where to start? Let our AI generate a sample resume for you in seconds.
              </p>
            </div>
            <div className="max-w-4xl mx-auto mt-12">
              <AiResumeDemo />
            </div>
          </div>
        </section>

        {/* Watermark Showcase Section */}
        <section id="watermark" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Protect Your Work with Watermarks
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Automatically add a personalized watermark to your uploaded images to protect your creative assets.
              </p>
            </div>
            <div className="max-w-3xl mx-auto mt-12">
              <BeforeAfterSlider
                  before={
                      <Image
                          src="https://placehold.co/800x600.png"
                          alt="Before"
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                          data-ai-hint="artistic photo"
                      />
                  }
                  after={
                      <div className="relative">
                           <Image
                              src="https://placehold.co/800x600.png"
                              alt="After"
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover"
                              data-ai-hint="artistic photo"
                           />
                           <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs p-2 rounded-sm pointer-events-none z-20">
                               <p className="font-semibold">Your Name</p>
                               <p className="text-white/80">your.email@example.com</p>
                           </div>
                      </div>
                  }
              />
            </div>
          </div>
        </section>


        {/* Marketplace Section */}
        <section id="marketplace" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Find Your Perfect Look in our Marketplace
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Browse our professionally designed templates.
              </p>
            </div>
             <div className="mt-12">
               <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-6xl mx-auto"
              >
                <CarouselContent className="-ml-4">
                  {templates.map((template, index) => (
                    <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="overflow-hidden group w-full h-auto">
                            <CardContent className="p-0">
                              <Image
                                src={template.image}
                                alt={template.name}
                                width={400}
                                height={566}
                                data-ai-hint={template.hint}
                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </CardContent>
                            <CardFooter className="p-4 bg-card/80 backdrop-blur-sm">
                              <h3 className="font-semibold">{template.name}</h3>
                            </CardFooter>
                          </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10" />
              </Carousel>
            </div>
             <div className="text-center mt-12">
                <Button size="lg" variant="outline" onClick={handleUploadClick}>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Template
                </Button>
                {!user && <p className="text-sm text-muted-foreground mt-2">You must be logged in to upload a template.</p>}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Loved by Professionals Worldwide
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Hear what our users have to say about their success with Launchboard.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 mt-12">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint}/>
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.title}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">"{testimonial.text}"</p>
                    <div className="flex mt-4 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative rounded-lg bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 overflow-hidden">
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
                <div className="absolute top-8 left-8 w-24 h-24 bg-white/5 rounded-full"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">
                  Ready to Launch Your Career?
                </h2>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-primary-foreground/80">
                  Join thousands of successful professionals. Create your standout resume and portfolio today.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
