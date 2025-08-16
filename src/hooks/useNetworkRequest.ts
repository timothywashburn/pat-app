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
    const makeRequest = async <TReq, TRes>(
        request: NetworkRequest<TReq>,
        requireAuth: boolean = true
    ): Promise<ApiSuccessResponse<TRes>> => {
        try {
            const result = await performRequest<TReq, TRes>(request, requireAuth);
            if (!result.success) throw new Error(result.error || 'Response indicated failure');
            return result;
        } catch (error: unknown) {
            if (error instanceof Error) toastManager.errorToast(error.message);
            throw error;
        }
    };

    const performAuthenticated = async <TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiSuccessResponse<TRes>> => {
        return makeRequest<TReq, TRes>(request, true);
    };

    const performUnauthenticated = async <TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiSuccessResponse<TRes>> => {
        return makeRequest<TReq, TRes>(request, false);
    };

    return {
        performAuthenticated,
        performUnauthenticated,
    };
}