// src/app/builder/layout.tsx
import { Toaster } from '@/components/ui/toaster';

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
