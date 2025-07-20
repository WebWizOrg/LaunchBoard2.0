
// src/app/portfolio/share/[id]/page.tsx
import { ReadOnlyPortfolio } from '@/components/read-only-portfolio';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// This is a Server Component, which can receive params directly.
export default function SharePortfolioPage({ params }: { params: { id: string } }) {
  // We pass the id as a plain string prop to the Client Component.
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40">
      <div className="w-full">
        <ReadOnlyPortfolio portfolioId={params.id} />
      </div>
       <div className="mt-4 mb-4">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
             <Link href="/" className="flex items-center gap-2">
                <p className="text-xs">Powered by</p>
                <Image src="/logo.png" alt="LaunchPad Logo" width={100} height={26} />
            </Link>
          </Button>
       </div>
    </div>
  );
}
