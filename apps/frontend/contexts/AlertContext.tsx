import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Alert, { AlertType } from '../components/Alert';

interface AlertConfig {
  id: number;
  message: string;
  type: AlertType;
  duration?: number;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
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
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            style={{ 
              marginTop: index > 0 ? '8px' : '0',
              position: 'relative',
              top: `${index * 10}px`
            }}
          >
            <Alert
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
