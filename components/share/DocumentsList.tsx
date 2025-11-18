import React from 'react';
import { Download, FileText } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import type { Quote, Invoice } from '@/types';

interface DocumentsListProps {
  title: string;
  documents: (Quote | Invoice)[];
  type: 'quote' | 'invoice';
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  title,
  documents,
  type,
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">
          {type === 'quote' ? '📄' : '💰'}
        </div>
        <p className="text-slate-400">
          Aucun {type === 'quote' ? 'devis' : 'facture'} pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-slate-400" />
                <span className="font-semibold text-slate-100">
                  {type === 'quote' ? 'Devis' : 'Facture'} {doc.numero}
                </span>
                {type === 'quote' && 'status' in doc && (
                  <Badge
                    variant={doc.status === 'signed' ? 'green' : 'blue'}
                  >
                    {doc.status === 'signed' ? '✅ Signé' : '📝 Brouillon'}
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {formatPrice(doc.amount_ttc)}
              </div>
              <div className="text-sm text-slate-400">
                {formatDate(doc.created_at)}
              </div>
            </div>
            <a
              href={doc.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Télécharger PDF</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

