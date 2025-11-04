import { useState, useCallback } from 'react';
import { PendingCapture } from '../types/capture';

/**
 * Génère un ID unique simple
 */
function generateId(): string {
  return `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook pour gérer les captures en attente d'association à un chantier
 */
export function usePendingCapture() {
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);

  const createPendingCapture = useCallback((
    type: PendingCapture['type'],
    data: Omit<PendingCapture, 'id' | 'type' | 'createdAt'>
  ) => {
    const capture: PendingCapture = {
      id: generateId(),
      type,
      createdAt: new Date(),
      ...data,
    } as PendingCapture;
    
    setPendingCapture(capture);
    return capture;
  }, []);

  const clearPendingCapture = useCallback(() => {
    setPendingCapture(null);
  }, []);

  return {
    pendingCapture,
    createPendingCapture,
    clearPendingCapture,
  };
}

