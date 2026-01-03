import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Alert, { AlertType } from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';

interface AlertConfig {
  id: number;
  message: string;
  type: AlertType;
  duration?: number;
}

interface ConfirmConfig {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showConfirm: (
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: 'danger' | 'primary' | 'warning';
    }
  ) => Promise<boolean>;
  showToast: (message: string, type?: AlertType, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [nextId, setNextId] = useState(0);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', duration: number = 5000) => {
      const id = nextId;
      setNextId(prev => prev + 1);
      setAlerts(prev => [...prev, { id, message, type, duration }]);
    },
    [nextId]
  );

  const showSuccess = useCallback(
    (message: string, duration: number = 5000) => {
      showAlert(message, 'success', duration);
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, duration: number = 5000) => {
      showAlert(message, 'error', duration);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, duration: number = 5000) => {
      showAlert(message, 'warning', duration);
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, duration: number = 5000) => {
      showAlert(message, 'info', duration);
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: 'danger' | 'primary' | 'warning';
      }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmConfig({
          isOpen: true,
          message,
          title: options?.title || 'Confirm Action',
          confirmText: options?.confirmText || 'OK',
          cancelText: options?.cancelText || 'Cancel',
          confirmVariant: options?.confirmVariant || 'primary',
          onConfirm: () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  const showToast = useCallback(
    (message: string, type: AlertType = 'info', duration: number = 3000) => {
      showAlert(message, type, duration);
    },
    [showAlert]
  );

  const removeAlert = useCallback((id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showToast,
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id}>
            <Alert
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        confirmVariant={confirmConfig.confirmVariant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={confirmConfig.onCancel}
      />
    </AlertContext.Provider>
  );
};
