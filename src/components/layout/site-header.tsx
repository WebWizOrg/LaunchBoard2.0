// src/components/layout/site-header.tsx
"use client";

import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, Rocket, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [lastResumeId, setLastResumeId] = useState<string | null>(null);
  const [lastPortfolioId, setLastPortfolioId] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && !loading) {
      const getMostRecentDocs = async () => {
        // Fetch last resume
        const resumeQuery = query(collection(db, `users/${user.uid}/resumes`), orderBy("updatedAt", "desc"), limit(1));
        const resumeSnapshot = await getDocs(resumeQuery);
        if (!resumeSnapshot.empty) {
          setLastResumeId(resumeSnapshot.docs[0].id);
        } else {
          setLastResumeId(null);
        }
        
        // Fetch last portfolio
        const portfolioQuery = query(collection(db, `users/${user.uid}/portfolios`), orderBy("updatedAt", "desc"), limit(1));
        const portfolioSnapshot = await getDocs(portfolioQuery);
        if (!portfolioSnapshot.empty) {
            setLastPortfolioId(portfolioSnapshot.docs[0].id);
        } else {
            setLastPortfolioId(null);
        }
      };
      getMostRecentDocs();
    }
  }, [user, loading, pathname]); // Re-check when path changes to update active doc

  const resumeBuilderHref = lastResumeId ? `/builder?id=${lastResumeId}` : '/dashboard';
  
  // Custom navigation handler for portfolio builder
  const handlePortfolioBuilderClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
        router.push('/login');
        return;
    }

    if (lastPortfolioId) {
        router.push(`/portfolio/builder?id=${lastPortfolioId}`);
    } else {
        // Create a new portfolio and then navigate
        try {
            const collectionRef = collection(db, `users/${user.uid}/portfolios`);
            const newDocRef = await addDoc(collectionRef, {
                name: 'My First Portfolio',
                isPublished: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                sections: [],
                content: {},
                styling: {}
            });
            router.push(`/portfolio/builder?id=${newDocRef.id}`);
        } catch (error) {
            console.error("Error creating new portfolio:", error);
            // Fallback to dashboard if creation fails
            router.push('/dashboard');
        }
    }
  };


  const navLinks = [
    { name: "Resume Builder", href: resumeBuilderHref },
    // { name: "Portfolio Builder", href: "/portfolio/builder", onClick: handlePortfolioBuilderClick },
    { name: "Marketplace", href: "/#marketplace" },
    { name: "Dashboard", href: "/dashboard" },
  ]

  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/share') || pathname.startsWith('/portfolio/share')) {
      return null;
  }
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              LAUNCHBOARD
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={link.onClick}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Nav */}
          <div className="md:hidden">
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Menu className="h-5 w-5" />
                          <span className="sr-only">Toggle Menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation links for the site.</SheetDescription>
                      </SheetHeader>
                      <Link href="/" className="flex items-center space-x-2 mb-6">
                        <Rocket className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline">LAUNCHBOARD</span>
                      </Link>
                      <nav className="flex flex-col space-y-3">
                          {navLinks.map(link => (
                              <Link
                                key={link.name}
                                href={link.href}
                                onClick={link.onClick}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                              >
                                  {link.name}
                              </Link>
                          ))}
                      </nav>
                  </SheetContent>
              </Sheet>
          </div>
          
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                         <Avatar className="h-8 w-8">
                           <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                           <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                         </Avatar>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  !(pathname.startsWith('/builder') || pathname.startsWith('/portfolio/builder')) && (
                    <>
                      <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                        Log in
                      </Link>
                      <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "bg-primary hover:bg-primary/90 text-primary-foreground")}>
                        Sign Up
                      </Link>
                    </>
                  )
                )}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
