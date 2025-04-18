// src/components/toast/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Platform, LayoutChangeEvent } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    position?: 'top' | 'bottom';
}

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
    height?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
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

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((options: ToastOptions) => {
        const id = Date.now().toString();
        const newToast: ToastItem = {
            id,
            message: options.message,
            type: options.type || 'info',
            duration: options.duration || 3000,
            position: options.position || 'bottom',
        };

        setToasts((currentToasts) => [...currentToasts, newToast]);

        setTimeout(() => {
            setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
        }, newToast.duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} setToasts={setToasts} />
        </ToastContext.Provider>
    );
};

const TOAST_SPACING = 10; // Space between toasts

interface ToastContainerProps {
    toasts: ToastItem[];
    setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts }) => {
    const topToasts = toasts.filter(toast => toast.position === 'top');
    const bottomToasts = toasts.filter(toast => toast.position === 'bottom');

    const handleToastLayout = useCallback((id: string, event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;

        setToasts(currentToasts =>
            currentToasts.map(toast =>
                toast.id === id ? { ...toast, height } : toast
            )
        );
    }, [setToasts]);

    // Calculate positions for top toasts
    const topOffsets = topToasts.reduce<Record<string, number>>((acc, toast, index) => {
        const previousToast = topToasts[index - 1];
        const previousOffset = previousToast ? acc[previousToast.id] : 0;
        const previousHeight = previousToast?.height || 0;

        acc[toast.id] = previousOffset + previousHeight + (index > 0 ? TOAST_SPACING : 0);
        return acc;
    }, {});

    // Calculate positions for bottom toasts
    const bottomOffsets = bottomToasts.reduce<Record<string, number>>((acc, toast, index) => {
        const previousToast = bottomToasts[index - 1];
        const previousOffset = previousToast ? acc[previousToast.id] : 0;
        const previousHeight = previousToast?.height || 0;

        acc[toast.id] = previousOffset + previousHeight + (index > 0 ? TOAST_SPACING : 0);
        return acc;
    }, {});

    return (
        <>
            {/* Top toasts container */}
            <View
                className="absolute top-0 left-0 right-0 items-center pointer-events-none"
                style={{ paddingTop: Platform.OS === 'web' ? 20 : 50 }}
            >
                {topToasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            top: (Platform.OS === 'web' ? 20 : 50) + (topOffsets[toast.id] || index * TOAST_SPACING),
                        }}
                        onLayout={(event: LayoutChangeEvent) => handleToastLayout(toast.id, event)}
                    >
                        <Toast {...toast} />
                    </View>
                ))}
            </View>

            {/* Bottom toasts container */}
            <View
                className="absolute bottom-0 left-0 right-0 items-center pointer-events-none"
                style={{ paddingBottom: Platform.OS === 'web' ? 20 : 50 }}
            >
                {bottomToasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            bottom: (Platform.OS === 'web' ? 20 : 50) + (bottomOffsets[toast.id] || index * TOAST_SPACING),
                        }}
                        onLayout={(event: LayoutChangeEvent) => handleToastLayout(toast.id, event)}
                    >
                        <Toast {...toast} />
                    </View>
                ))}
            </View>
        </>
    );
};

// Import Toast component
import { Toast } from './Toast';