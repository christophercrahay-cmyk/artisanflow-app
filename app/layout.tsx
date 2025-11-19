import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://artisanflow.fr'),
  title: {
    default: "ArtisanFlow – Devis en 20 secondes avec l'IA",
    template: '%s | ArtisanFlow',
  },
  description:
    "Application pour artisans : créez devis et factures en 20 secondes, gérez vos chantiers, vos photos, vos clients et vos signatures électroniques. Simple, rapide, puissant.",
  keywords: [
    'artisan',
    'devis',
    'électricien',
    'plombier',
    'application mobile',
    'IA',
    'facturation',
    'chantier',
    'signature électronique',
    'gestion chantier',
  ],
  authors: [{ name: 'ArtisanFlow' }],
  creator: 'ArtisanFlow',
  publisher: 'ArtisanFlow',
  alternates: {
    canonical: 'https://artisanflow.fr/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://artisanflow.fr/',
    title: "ArtisanFlow – Devis en 20 secondes avec l'IA",
    description:
      "Créez vos devis et factures en 20 secondes avec l'IA. Gérez vos chantiers, signatures et photos en un seul endroit.",
    siteName: 'ArtisanFlow',
    images: [
      {
        url: 'https://artisanflow.fr/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ArtisanFlow – Devis en 20 secondes avec l\'IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ArtisanFlow – Devis instantanés avec l'IA",
    description:
      "Application pour artisans : devis instantanés, chantiers, photos et signatures électroniques.",
    images: ['https://artisanflow.fr/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  other: {
    'theme-color': '#0A1A2F',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

