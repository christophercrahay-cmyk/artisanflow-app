import React from 'react';
import { cn } from '@/lib/utils/cn';

interface GradientBlurProps {
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const GradientBlur: React.FC<GradientBlurProps> = ({
  className,
  position = 'center',
}) => {
  const positions = {
    top: 'top-0 left-1/2 -translate-x-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2',
    left: 'left-0 top-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={cn(
        'absolute w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl pointer-events-none',
        positions[position],
        className
      )}
      aria-hidden="true"
    />
  );
};

