
"use client";

import Link from "next/link";
import { Rocket, Twitter, Github, Linkedin } from "lucide-react";
import { usePathname } from 'next/navigation';
import Image from 'next/image';


export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/builder') || pathname.startsWith('/portfolio/builder')) {
    return null;
  }
  
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center space-x-2 mb-4">
               <Image src="/images/image[1].png" alt="LaunchPad Logo" width={150} height={40} />
            </Link>
            <p className="text-sm text-muted-foreground">Verified. Amplified. Launched.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/builder" className="text-muted-foreground hover:text-foreground">Resume Builder</Link></li>
              <li><Link href="/portfolio/builder" className="text-muted-foreground hover:text-foreground">Portfolio Builder</Link></li>
              <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground">Marketplace</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LaunchPad. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            <Link href="#" aria-label="GitHub"><Github className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            <Link href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
