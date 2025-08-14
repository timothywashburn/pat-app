import { useCallback, useState } from 'react';
import { useAuthStore } from '@/src/features/auth/controllers/useAuthStore';
import PatConfig from '@/src/misc/PatConfig';
import axios, { AxiosRequestConfig } from 'axios';

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export interface NetworkRequest<ReqData> {
    endpoint: string;
    method: HTTPMethod;
    body?: ReqData;
}

export class NetworkError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

// TODO: as noted in pat-api, should probably be in shared
export type ApiSuccessResponse<TRes = unknown> = TRes & {
    success: true;
};

export interface ApiErrorResponse {
    success: false;
    error: string;
}

export type ApiResponseBody<TRes = unknown> = ApiSuccessResponse<TRes> | ApiErrorResponse;

/**
 * React hook for making network requests
 * Replaces the NetworkManager singleton with React-native patterns
 */
export function useNetworkRequest() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const authTokens = useAuthStore(state => state.authTokens);

    const performRequest = useCallback(async <TReq, TRes>(
        request: NetworkRequest<TReq>,
        options: {
            requireAuth?: boolean;
            customErrorMessage?: string;
            skipLoadingState?: boolean;
        } = {}
    ): Promise<ApiResponseBody<TRes>> => {
        const { 
            requireAuth = true, 
            customErrorMessage,
            skipLoadingState = false 
        } = options;

        // Check for auth tokens if required
        if (requireAuth && !authTokens) {
            throw new Error('Could not perform authenticated request: no auth tokens available');
        }

        if (!skipLoadingState) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const url = `${PatConfig.apiURL}${request.endpoint}`;

            const config: AxiosRequestConfig = {
                method: request.method.toLowerCase() as any,
                url,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: request.body,
            };

            if (requireAuth && authTokens) {
                config.headers!['Authorization'] = `Bearer ${authTokens.accessToken}`;
            }

            const response = await axios(config);
            const data: ApiResponseBody<TRes> = response.data;
            return data;
        } catch (error: any) {
            let errorMessage: string;
            let statusCode = 0;

            if (error.response) {
                errorMessage = error.response.data?.error || error.response.statusText || 'Unknown error occurred';
                statusCode = error.response.status;
                console.error(`API request failed: ${statusCode} ${errorMessage}`);
            } else if (error.request) {
                errorMessage = 'Network error: no response received';
                console.error('Network error: no response received');
            } else {
                errorMessage = error.message;
                console.error('Request setup error:', error.message);
            }

            // Use custom error message if provided, otherwise use the extracted message
            const finalErrorMessage = customErrorMessage || errorMessage;
            setError(finalErrorMessage);

            // Throw NetworkError for HTTP errors, regular Error for others
            if (error.response) {
                throw new NetworkError(finalErrorMessage, statusCode);
            } else {
                throw new Error(finalErrorMessage);
            }
        } finally {
            if (!skipLoadingState) {
                setIsLoading(false);
            }
        }
    }, [authTokens]);

    const performAuthenticated = useCallback(async <TReq, TRes>(
        request: NetworkRequest<TReq>,
        options: Omit<Parameters<typeof performRequest>[1], 'requireAuth'> = {}
    ): Promise<ApiResponseBody<TRes>> => {
        return performRequest<TReq, TRes>(request, { ...options, requireAuth: true });
    }, [performRequest]);

    const performUnauthenticated = useCallback(async <TReq, TRes>(
        request: NetworkRequest<TReq>,
        options: Omit<Parameters<typeof performRequest>[1], 'requireAuth'> = {}
    ): Promise<ApiResponseBody<TRes>> => {
        return performRequest<TReq, TRes>(request, { ...options, requireAuth: false });
    }, [performRequest]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        performRequest,
        performAuthenticated,
        performUnauthenticated,
        isLoading,
        error,
        clearError,
    };
}