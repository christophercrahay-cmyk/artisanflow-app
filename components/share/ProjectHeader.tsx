import React from 'react';
import { MapPin } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const fullAddress = [
    project.address,
    project.postal_code,
    project.city,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
        {project.name}
      </h1>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm text-slate-400 mb-1">Adresse</div>
            <div className="text-slate-100 font-medium">{fullAddress}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

