import { ToastOptions } from '@/src/components/toast/ToastContext';

interface ToastContextType {
    showToast: (options: ToastOptions) => string;
    hideToast: (id: string) => void;
    infoToast: (message: string) => string;
    successToast: (message: string) => string;
    errorToast: (message: string) => string;
    warningToast: (message: string) => string;
}

class ToastManager {
    private toastContext: ToastContextType | null = null;

    setToastContext(context: ToastContextType) {
        this.toastContext = context;
    }

    showToast(options: ToastOptions): string {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return '';
        }
        return this.toastContext.showToast(options);
    }

    hideToast(id: string): void {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return;
        }
        this.toastContext.hideToast(id);
    }

    infoToast(message: string): string {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return '';
        }
        return this.toastContext.infoToast(message);
    }

    successToast(message: string): string {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return '';
        }
        return this.toastContext.successToast(message);
    }

    errorToast(message: string): string {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return '';
        }
        return this.toastContext.errorToast(message);
    }

    warningToast(message: string): string {
        if (!this.toastContext) {
            console.warn('Toast context not available');
            return '';
        }
        return this.toastContext.warningToast(message);
    }
}

export const toastManager = new ToastManager();