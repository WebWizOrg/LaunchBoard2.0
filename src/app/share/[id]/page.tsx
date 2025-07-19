// src/app/share/[id]/page.tsx
import { ReadOnlyResume } from '@/components/read-only-resume';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

// This is a Server Component, which can receive params directly.
export default function SharePage({ params }: { params: { id: string } }) {
  // We pass the id as a plain string prop to the Client Component.
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <ReadOnlyResume resumeId={params.id} />
      </div>
       <div className="mt-4">
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
