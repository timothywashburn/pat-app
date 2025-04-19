import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';
import { ToastType } from './Toast';

export interface ToastOptions {
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
    actionLabel?: string;
    onActionPress?: () => void;
}

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
    actionLabel?: string;
    onActionPress?: () => void;
    height?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => string;
    hideToast: (id: string) => void;
    infoToast: (message: string) => string;
    successToast: (message: string) => string;
    errorToast: (message: string) => string;
    warningToast: (message: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((options: ToastOptions) => {
        const id = Date.now().toString();
        const newToast: ToastItem = {
            id,
            message: options.message,
            type: options.type,
            duration: options.duration,
            position: options.position,
            actionLabel: options.actionLabel,
            onActionPress: options.onActionPress,
        };

        setToasts((currentToasts) => [...currentToasts, newToast]);
        return id;
    }, []);

    const hideToast = useCallback((id: string) => {
        console.log(`hiding toast with id: ${id}`);
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, []);

    const infoToast = useCallback((message: string) => {
        return showToast({
            message,
            type: 'info',
            duration: 3000,
            position: 'top'
        });
    }, [showToast]);

    const successToast = useCallback((message: string) => {
        return showToast({
            message,
            type: 'success',
            duration: 3000,
            position: 'top'
        });
    }, [showToast]);

    const errorToast = useCallback((message: string) => {
        return showToast({
            message,
            type: 'error',
            duration: 0,
            position: 'top',
            actionLabel: 'DISMISS'
        });
    }, [showToast]);

    const warningToast = useCallback((message: string) => {
        return showToast({
            message,
            type: 'warning',
            duration: 4000,
            position: 'top'
        });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{
            showToast,
            hideToast,
            infoToast,
            successToast,
            errorToast,
            warningToast
        }}>
            {children}
            <ToastContainer toasts={toasts} setToasts={setToasts} hideToast={hideToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};