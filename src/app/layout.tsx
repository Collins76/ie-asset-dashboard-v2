import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import AuthProvider from '@/components/ui/AuthProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grid Intelligence Dashboard | Distribution Transformers',
  description: 'Real-time monitoring and analytics for 20,000+ distribution transformers across Ikeja Electric network',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#0F172A] text-white font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
