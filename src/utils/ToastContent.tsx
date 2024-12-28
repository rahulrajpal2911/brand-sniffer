import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

// Define the context interface
interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

// Define the options for the Toast
export interface ToastOptions {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

// Create the Toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Custom hook to use the Toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ToastProvider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<Toast>(null);

  const showToast = (options: ToastOptions) => {
    toastRef.current?.show(options);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};
