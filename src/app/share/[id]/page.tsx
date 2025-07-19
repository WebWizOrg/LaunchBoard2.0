// src/app/share/[id]/page.tsx
import { ReadOnlyResume } from '@/components/read-only-resume';

// This is a Server Component, which can receive params directly.
export default function SharePage({ params }: { params: { id: string } }) {
  // We pass the id as a plain string prop to the Client Component.
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4 sm:p-8">
      <ReadOnlyResume resumeId={params.id} />
    </div>
  );
}
