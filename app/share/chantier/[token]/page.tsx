import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectByToken } from '@/lib/api/chantier';
import { ProjectHeader } from '@/components/share/ProjectHeader';
import { ClientInfo } from '@/components/share/ClientInfo';
import { PhotosGrid } from '@/components/share/PhotosGrid';
import { DocumentsList } from '@/components/share/DocumentsList';
import { EmptyState } from '@/components/share/EmptyState';
import { ErrorState } from '@/components/share/ErrorState';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    token: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const project = await getProjectByToken(params.token);

  if (!project) {
    return {
      title: 'Chantier introuvable',
    };
  }

  // Guards pour éviter les erreurs undefined
  const projectName = project.name || 'Chantier';
  const clientName = project.client?.name || 'Client';
  const photos = project.photos || [];

  return {
    title: `Chantier ${projectName} - ${clientName}`,
    description: 'Suivez l\'avancement de votre chantier en temps réel',
    openGraph: {
      title: `Chantier ${projectName}`,
      description: `Suivi du chantier pour ${clientName}`,
      images: photos.length > 0 && photos[0]?.url
        ? [{ url: photos[0].url }]
        : [],
    },
  };
}

export default async function ChantierPage({ params }: PageProps) {
  const project = await getProjectByToken(params.token);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState type="not-found" />
        </div>
      </div>
    );
  }

  // Guards pour éviter les erreurs undefined
  const photos = project.photos || [];
  const devis = project.devis || [];
  const factures = project.factures || [];
  const client = project.client || { name: 'Client' };

  const hasContent =
    photos.length > 0 ||
    devis.length > 0 ||
    factures.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>←</span>
              <span>ArtisanFlow</span>
            </Link>
          </div>
          <ProjectHeader project={project} />
          <ClientInfo client={client} />
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="ArtisanFlow"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-white">
                ArtisanFlow
              </span>
            </Link>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
              Suivi de chantier
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectHeader project={project} />
        <ClientInfo client={client} />

        {/* Photos Section */}
        {photos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              📸 Photos du chantier ({photos.length})
            </h2>
            <PhotosGrid photos={photos} />
          </section>
        )}

        {/* Quotes Section */}
        {devis.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              📄 Devis ({devis.length})
            </h2>
            <DocumentsList
              title="Devis"
              documents={devis}
              type="quote"
            />
          </section>
        )}

        {/* Invoices Section */}
        {factures.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              💰 Factures ({factures.length})
            </h2>
            <DocumentsList
              title="Factures"
              documents={factures}
              type="invoice"
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>Propulsé par ArtisanFlow</p>
            <div className="flex gap-6">
              <Link
                href="/"
                className="hover:text-slate-200 transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/confidentialite"
                className="hover:text-slate-200 transition-colors"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

