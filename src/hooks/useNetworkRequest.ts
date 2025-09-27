import { performRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';
import { ApiSuccessResponse, HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";

export interface NetworkRequest<ReqData> {
    endpoint: string;
    method: HTTPMethod;
    body?: ReqData;
}

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