import { useAuthStore, NetworkError } from '@/src/stores/useAuthStore';
import axios, { AxiosRequestConfig } from 'axios';
import { NetworkRequest } from '@/src/hooks/useNetworkRequest';
import { ApiResponseBody } from "@/src/hooks/useNetworkRequestTypes";
import PatConfig from "@/src/misc/PatConfig";

export const performRequest = async <TReq, TRes>(
    config: NetworkRequest<TReq>,
    requireAuth: boolean = true
): Promise<ApiResponseBody<TRes>> => {
    const url = `${PatConfig.apiURL}${config.endpoint}`;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (requireAuth) {
        const authTokens = useAuthStore.getState().authTokens;
        if (!authTokens) throw new Error('No auth tokens available');
        headers['Authorization'] = `Bearer ${authTokens.accessToken}`;
    }

    const axiosConfig: AxiosRequestConfig = {
        method: config.method.toLowerCase() as any,
        url,
        headers,
        data: config.body,
    };

    try {
        const response = await axios(axiosConfig);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const message = error.response.data?.error || error.response.statusText || 'Unknown error occurred';
            throw new NetworkError(message, error.response.status);
        } else if (error.request) {
            throw new NetworkError('Network error: no response received', 0);
        } else {
            throw new Error(error.message);
        }
    }
};

export const performAuthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, true);

export const performUnauthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, false);