import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value: ToastContextType = {
    showToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toasts */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 2000000,
        padding: '16px',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ 
            position: 'relative',
            marginTop: index > 0 ? '8px' : '0',
            pointerEvents: 'auto',
          }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};