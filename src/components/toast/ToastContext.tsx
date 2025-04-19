import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from './Toast';

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
    const insets = useSafeAreaInsets();
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

    const topOffsets = topToasts.reduce<Record<string, number>>((offsets, toast, index) => {
        const previousToast = topToasts[index - 1];
        const previousOffset = previousToast ? offsets[previousToast.id] : 0;
        const previousHeight = previousToast?.height || 0;

        offsets[toast.id] = previousOffset + previousHeight + (index > 0 ? TOAST_SPACING : 0);
        return offsets;
    }, {});

    const bottomOffsets = bottomToasts.reduce<Record<string, number>>((offsets, toast, index) => {
        const previousToast = bottomToasts[index - 1];
        const previousOffset = previousToast ? offsets[previousToast.id] : 0;
        const previousHeight = previousToast?.height || 0;

        offsets[toast.id] = previousOffset + previousHeight + (index > 0 ? TOAST_SPACING : 0);
        return offsets;
    }, {});

    return (
        <>
            {/* Top toasts container */}
            <View
                className="absolute top-0 left-0 right-0 items-center pointer-events-none"
            >
                {topToasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            top: TOAST_SPACING + insets.top + topOffsets[toast.id],
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
            >
                {bottomToasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            bottom: TOAST_SPACING + insets.bottom + bottomOffsets[toast.id],
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

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};