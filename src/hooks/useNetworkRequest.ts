import { useState } from 'react';
import { performRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';

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

    const makeRequest = async <TReq, TRes>(
        request: NetworkRequest<TReq>,
        requireAuth: boolean = true
    ): Promise<ApiResponseBody<TRes>> => {
        setIsLoading(true);

        try {
            return await performRequest<TReq, TRes>(request, requireAuth);
        } catch (error: any) {
            toastManager.errorToast(error.message || 'Network request failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const performAuthenticated = async <TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiResponseBody<TRes>> => {
        return makeRequest<TReq, TRes>(request, true);
    };

    const performUnauthenticated = async <TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiResponseBody<TRes>> => {
        return makeRequest<TReq, TRes>(request, false);
    };

    return {
        performAuthenticated,
        performUnauthenticated,
        isLoading,
    };
}