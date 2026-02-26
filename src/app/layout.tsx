import type { Metadata } from 'next';
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ConfHub - 技術カンファレンス一覧',
    template: '%s | ConfHub',
  },
  description:
    '日本の技術カンファレンスを職種・技術・形式・規模で検索。Googleカレンダー連携対応。',
  openGraph: {
    title: 'Conf Hub',
    description: '技術カンファレンス一覧',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Conf Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conf Hub',
    description: '技術カンファレンス一覧',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "'Noto Sans JP', var(--font-geist-sans), sans-serif" }}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}

      </body>
    </html>
  );
}
