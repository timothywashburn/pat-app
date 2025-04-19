import React, { useCallback } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from './Toast';
import { ToastItem } from './ToastContext';

const TOAST_SPACING = 10;

interface ToastContainerProps {
    toasts: ToastItem[];
    setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
    hideToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts, hideToast }) => {
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

    const calculateOffsets = (toastItems: ToastItem[]) => {
        return toastItems.reduce<Record<string, number>>((offsets, toast, index) => {
            const previousToast = toastItems[index - 1];
            const previousOffset = previousToast ? offsets[previousToast.id] : 0;
            const previousHeight = previousToast?.height || 0;

            offsets[toast.id] = previousOffset + previousHeight + (index > 0 ? TOAST_SPACING : 0);
            return offsets;
        }, {});
    };

    const topOffsets = calculateOffsets(topToasts);
    const bottomOffsets = calculateOffsets(bottomToasts);

    return (
        <>
            {/* Top toasts container */}
            <View
                className="absolute top-0 left-0 right-0 items-center"
            >
                {topToasts.map((toast) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            top: TOAST_SPACING + insets.top + topOffsets[toast.id],
                        }}
                        onLayout={(event: LayoutChangeEvent) => handleToastLayout(toast.id, event)}
                    >
                        <Toast {...toast} hideToast={hideToast} />
                    </View>
                ))}
            </View>

            {/* Bottom toasts container */}
            <View
                className="absolute bottom-0 left-0 right-0 items-center"
            >
                {bottomToasts.map((toast) => (
                    <View
                        key={toast.id}
                        className="w-full items-center"
                        style={{
                            position: 'absolute',
                            bottom: TOAST_SPACING + insets.bottom + bottomOffsets[toast.id],
                        }}
                        onLayout={(event: LayoutChangeEvent) => handleToastLayout(toast.id, event)}
                    >
                        <Toast {...toast} hideToast={hideToast} />
                    </View>
                ))}
            </View>
        </>
    );
};