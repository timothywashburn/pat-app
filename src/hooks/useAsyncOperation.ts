import { useCallback } from 'react';
import { useToast } from '@/src/components/toast/ToastContext';

export function useAsyncOperation() {
    const { errorToast } = useToast();

    const execute = useCallback(async <T>(
        operation: () => Promise<T>
    ): Promise<T> => {
        try {
            return await operation();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Operation failed';
            errorToast(errorMessage);
            throw err;
        }
    }, [errorToast]);

    return {
        execute,
    };
}