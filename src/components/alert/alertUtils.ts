import { AlertOptions } from './AlertContext';

interface AlertContextType {
    showAlert: (options: AlertOptions) => string;
    hideAlert: (id: string) => void;
    confirmAlert: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => string;
    infoAlert: (title: string, message?: string, onOk?: () => void) => string;
}

class AlertManager {
    private alertContext: AlertContextType | null = null;

    setAlertContext(context: AlertContextType) {
        this.alertContext = context;
    }

    showAlert(options: AlertOptions): string {
        if (!this.alertContext) {
            console.warn('Alert context not available. Make sure AlertProvider is set up.');
            return '';
        }
        return this.alertContext.showAlert(options);
    }

    hideAlert(id: string): void {
        if (!this.alertContext) {
            console.warn('Alert context not available. Make sure AlertProvider is set up.');
            return;
        }
        this.alertContext.hideAlert(id);
    }

    confirmAlert(title: string, message: string, onConfirm: () => void, onCancel?: () => void): string {
        if (!this.alertContext) {
            console.warn('Alert context not available. Make sure AlertProvider is set up.');
            return '';
        }
        return this.alertContext.confirmAlert(title, message, onConfirm, onCancel);
    }

    infoAlert(title: string, message?: string, onOk?: () => void): string {
        if (!this.alertContext) {
            console.warn('Alert context not available. Make sure AlertProvider is set up.');
            return '';
        }
        return this.alertContext.infoAlert(title, message, onOk);
    }
}

export const alertManager = new AlertManager();

// Convenience functions for imperative usage
export const showAlert = (options: AlertOptions) => alertManager.showAlert(options);
export const hideAlert = (id: string) => alertManager.hideAlert(id);
export const confirmAlert = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => 
    alertManager.confirmAlert(title, message, onConfirm, onCancel);
export const infoAlert = (title: string, message?: string, onOk?: () => void) => 
    alertManager.infoAlert(title, message, onOk);