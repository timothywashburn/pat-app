import { useCallback, useState } from 'react';

/**
 * React hook for handling async operations with loading and error states
 * Provides consistent patterns for try/catch/finally blocks
 */
export function useAsyncOperation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async <T>(
        operation: () => Promise<T>,
        options: {
            errorMessage?: string;
            skipLoadingState?: boolean;
        } = {}
    ): Promise<T> => {
        const { errorMessage = 'Operation failed', skipLoadingState = false } = options;

        if (!skipLoadingState) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const result = await operation();
            return result;
        } catch (err) {
            const finalErrorMessage = err instanceof Error ? err.message : errorMessage;
            setError(finalErrorMessage);
            throw err;
        } finally {
            if (!skipLoadingState) {
                setIsLoading(false);
            }
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
    }, []);

    return {
        execute,
        isLoading,
        error,
        clearError,
        reset,
    };
}