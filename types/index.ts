export interface Project {
  id: string;
  name: string;
  address: string;
  postal_code?: string;
  city?: string;
  client: Client;
  photos: Photo[];
  devis: Quote[];
  factures: Invoice[];
}

export interface Client {
  name: string;
  city?: string;
}

export interface Photo {
  id: string;
  url: string;
  created_at: string;
}

export interface Quote {
  id: string;
  numero: string;
  pdf_url: string;
  amount_ttc: number;
  status: 'draft' | 'signed';
  created_at: string;
}

export interface Invoice {
  id: string;
  numero: string;
  pdf_url: string;
  amount_ttc: number;
  status: string;
  created_at: string;
}

