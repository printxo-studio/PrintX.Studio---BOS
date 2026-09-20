import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PRINTXO — Business Operating System (BOS)',
  description: 'Enterprise ERP, MES & TQM System for 3D Printing & Additive Manufacturing',
  icons: {
    icon: [
      { url: '/logo-icon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3' },
    ],
    shortcut: '/logo-icon.png?v=3',
    apple: '/logo-icon.png?v=3',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo-icon.png?v=3" />
        <link rel="shortcut icon" href="/logo-icon.png?v=3" />
        <link rel="apple-touch-icon" href="/logo-icon.png?v=3" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
