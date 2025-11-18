import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AppToast, { ToastType } from '../components/ui/AppToast';
import { setToastContext } from '../components/Toast';

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (params: { type: ToastType; message: string; duration?: number }) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: 'info',
    message: '',
  });
  const [duration, setDuration] = useState(3500);

  // Exposer le contexte au module Toast.js pour compatibilité
  useEffect(() => {
    const context = {
      showToast: ({ type, message, duration: toastDuration = 3500 }: { type: ToastType; message: string; duration?: number }) => {
        setDuration(toastDuration);
        setToast({
          visible: true,
          type,
          message,
        });
      },
    };
    setToastContext(context);
  }, []);

  const showToast = useCallback(
    ({ type, message, duration: toastDuration = 3500 }: { type: ToastType; message: string; duration?: number }) => {
      setDuration(toastDuration);
      setToast({
        visible: true,
        type,
        message,
      });
    },
    []
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'error', message, duration });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'success', message, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'info', message, duration });
    },
    [showToast]
  );

  const handleHide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo }}>
      {children}
      <AppToast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onHide={handleHide}
        duration={duration}
      />
    </ToastContext.Provider>
  );
};

