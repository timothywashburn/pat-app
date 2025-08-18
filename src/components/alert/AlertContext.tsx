import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AlertContainer } from './AlertContainer';
import { AlertButton, AlertItem } from './Alert';
import { alertManager } from './alertUtils';

export interface AlertOptions {
    title: string;
    message?: string;
    buttons: AlertButton[];
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => string;
    hideAlert: (id: string) => void;
    confirmAlert: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => string;
    infoAlert: (title: string, message?: string, onOk?: () => void) => string;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
    children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const showAlert = useCallback((options: AlertOptions) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newAlert: AlertItem = {
            id,
            title: options.title,
            message: options.message,
            buttons: options.buttons,
        };

        setAlerts((currentAlerts) => [...currentAlerts, newAlert]);
        return id;
    }, []);

    const hideAlert = useCallback((id: string) => {
        setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id));
    }, []);

    const confirmAlert = useCallback((
        title: string, 
        message: string, 
        onConfirm: () => void, 
        onCancel?: () => void
    ) => {
        return showAlert({
            title,
            message,
            buttons: [
                {
                    text: 'Cancel',
                    onPress: onCancel,
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: onConfirm,
                    style: 'destructive'
                }
            ]
        });
    }, [showAlert]);

    const infoAlert = useCallback((title: string, message?: string, onOk?: () => void) => {
        return showAlert({
            title,
            message,
            buttons: [
                {
                    text: 'OK',
                    onPress: onOk,
                    style: 'default'
                }
            ]
        });
    }, [showAlert]);

    // Register this context with the alert manager for imperative access
    useEffect(() => {
        alertManager.setAlertContext({
            showAlert,
            hideAlert,
            confirmAlert,
            infoAlert
        });
    }, [showAlert, hideAlert, confirmAlert, infoAlert]);

    return (
        <AlertContext.Provider value={{
            showAlert,
            hideAlert,
            confirmAlert,
            infoAlert
        }}>
            {children}
            <AlertContainer alerts={alerts} onDismiss={hideAlert} />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};