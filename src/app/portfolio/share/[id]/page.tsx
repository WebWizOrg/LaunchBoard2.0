
// src/app/portfolio/share/[id]/page.tsx
import { ReadOnlyPortfolio } from '@/components/read-only-portfolio';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
             <Link href="/">
                <p className="text-xs">Generated with</p>
                <Rocket className="h-4 w-4 mx-1 text-primary"/>
                <p className="font-semibold text-xs">LAUNCHBOARD</p>
            </Link>
          </Button>
       </div>
    </div>
  );
}
