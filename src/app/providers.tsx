'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={5 * 60}
    >
      {children}
      <Toaster />
    </SessionProvider>
  );
}