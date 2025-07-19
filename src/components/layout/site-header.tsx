"use client";

import Link from "next/link"
import { usePathname } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Rocket } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname();
  const navLinks = [
    { name: "Builder", href: "/builder" },
    { name: "Marketplace", href: "/#marketplace" },
    { name: "Testimonials", href: "/#testimonials" },
  ]
  // In a real app, you'd get this from a session provider
  const isLoggedIn = false 

  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return null;
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
                      <Link href="/" className="flex items-center space-x-2 mb-6">
                        <Rocket className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline">LAUNCHBOARD</span>
                      </Link>
                      <nav className="flex flex-col space-y-3">
                          {navLinks.map(link => (
                              <Link
                                key={link.name}
                                href={link.href}
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
            {isLoggedIn ? (
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
                Dashboard
              </Link>
            ) : (
               !pathname.startsWith('/builder') && (
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
