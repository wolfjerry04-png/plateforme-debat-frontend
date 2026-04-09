import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import InitAuth from '@/components/layout/InitAuth';
import Chatbot from '@/components/chatbot/Chatbot';
import I18nProvider from '@/components/layout/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Debat Haiti — Les idées en face à face',
  description: 'Plateforme de débats, formations à l\'argumentation et tournois.',
  manifest: '/manifest.json',
  themeColor: '#F4F0E9',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Debat Haiti' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F4F0E9" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: `function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:'fr',includedLanguages:'fr,ht,en',autoDisplay:false},'google_translate_element');}` }} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="google_translate_element" style={{ display: 'none' }} suppressHydrationWarning />
        <I18nProvider>
          <InitAuth />
          <Navbar />
          <main style={{ minHeight: '100vh', background: 'var(--page)', overflowX: 'hidden' }}>
            {children}
          </main>
          <Chatbot />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--ink)',
                color: 'var(--page)',
                fontFamily: "'Helvetica Neue',Arial,sans-serif",
                fontSize: '13px',
                borderRadius: '0',
                border: '1px solid var(--line2)',
                boxShadow: 'none',
              },
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
