'use client';

import './globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Note: metadata is not supported in 'use client' components
// If needed, create a separate server component for metadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
