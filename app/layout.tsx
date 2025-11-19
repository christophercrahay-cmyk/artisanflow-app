import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "ArtisanFlow - Devis en 20 secondes avec l'IA",
    template: '%s | ArtisanFlow',
  },
  description:
    "L'application mobile qui fait gagner 2h par jour aux artisans du bâtiment. Devis IA instantanés, suivi client en temps réel, mode hors ligne complet.",
  keywords: [
    'artisan',
    'devis',
    'électricien',
    'plombier',
    'application mobile',
    'IA',
    'facturation',
  ],
  authors: [{ name: 'ArtisanFlow' }],
  creator: 'ArtisanFlow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://artisanflow.fr',
    title: "ArtisanFlow - Devis en 20 secondes avec l'IA",
    description:
      "L'application mobile pour artisans : devis IA, suivi client, mode offline",
    siteName: 'ArtisanFlow',
    images: [
      {
        url: 'https://artisanflow.fr/opengraph-image.svg',
        width: 1200,
        height: 630,
        alt: 'ArtisanFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ArtisanFlow - Devis en 20 secondes avec l'IA",
    description:
      "L'application mobile pour artisans : devis IA, suivi client, mode offline",
    images: ['https://artisanflow.fr/opengraph-image.svg'],
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

