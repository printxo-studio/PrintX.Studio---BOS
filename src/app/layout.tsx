import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PRINTXO — Business Operating System (BOS)',
  description: 'Enterprise ERP, MES & TQM System for 3D Printing & Additive Manufacturing',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
