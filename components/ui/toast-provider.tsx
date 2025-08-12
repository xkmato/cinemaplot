'use client';

import { createContext, ReactNode, useContext, useState } from "react";
import { Toast, ToastProps } from "./toast";

interface ToastContextType {
    showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
    showSuccess: (title: string, description?: string) => void;
    showError: (title: string, description?: string) => void;
    showInfo: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastProps = {
            ...toast,
            id,
            onClose: removeToast,
        };

        setToasts(prev => [...prev, newToast]);
    };

    const showSuccess = (title: string, description?: string) => {
        showToast({ type: 'success', title, description });
    };

    const showError = (title: string, description?: string) => {
        showToast({ type: 'error', title, description });
    };

    const showInfo = (title: string, description?: string) => {
        showToast({ type: 'info', title, description });
    };

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
