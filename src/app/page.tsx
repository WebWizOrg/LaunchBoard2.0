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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Dynamic Resume Builder',
      description:
        'Craft the perfect resume with our intuitive drag-and-drop builder.',
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: 'Customizable Templates',
      description:
        'Choose from a variety of sleek, modern templates to match your style.',
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: 'Share & Export',
      description:
        'Host your resume online with a custom URL or export it as a PDF.',
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Suggestions',
      description:
        'Get smart, AI-driven recommendations to make your resume stand out.',
    },
  ];

  const templates = [
    { name: 'Minimalist',
      image: 'https://placehold.co/400x566.png',
      hint: 'resume template'
    },
    { name: 'Modern',
      image: 'https://placehold.co/400x566.png',
      hint: 'resume modern'
    },
    { name: 'Creative',
      image: 'https://placehold.co/400x566.png',
      hint: 'creative resume'
    },
    { name: 'Academic',
      image: 'https://placehold.co/400x566.png',
      hint: 'academic resume'
    },
     { name: 'Professional',
      image: 'https://placehold.co/400x566.png',
      hint: 'professional resume'
    },
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
              Build. Share. Get Hired.
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

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Our powerful features are designed to make your professional journey seamless and successful.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-card/70 transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
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

        {/* Templates Section */}
        <section id="templates" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Find Your Perfect Look
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Browse our professionally designed templates.
              </p>
            </div>
            <div className="mt-12">
              <Carousel opts={{ align: "start", loop: true, }} className="w-full">
                <CarouselContent>
                  {templates.map((template, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="overflow-hidden group">
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
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-secondary/50">
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
        <section className="py-16 md:py-24 bg-background">
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
