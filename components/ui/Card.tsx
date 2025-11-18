import React from 'react';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, icon: Icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 p-6 transition-all hover:shadow-xl hover:shadow-slate-300/50',
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-6 w-6" />
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

