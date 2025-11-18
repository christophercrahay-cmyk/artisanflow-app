import React from 'react';
import { User } from 'lucide-react';
import type { Client } from '@/types';

interface ClientInfoProps {
  client: Client;
}

export const ClientInfo: React.FC<ClientInfoProps> = ({ client }) => {
  return (
    <div className="flex items-start gap-3 mb-8 pb-8 border-b border-slate-700">
      <User className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-sm text-slate-400 mb-1">Client</div>
        <div className="text-slate-100 font-medium">
          {client.name}
          {client.city && <span className="text-slate-400"> • {client.city}</span>}
        </div>
      </div>
    </div>
  );
};

