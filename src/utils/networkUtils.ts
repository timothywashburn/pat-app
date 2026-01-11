import { useAuthStore } from '@/src/stores/useAuthStore';
import axios, { AxiosRequestConfig } from 'axios';
import { NetworkRequest } from '@/src/hooks/useNetworkRequest';
import { ApiResponseBody } from "@/src/hooks/useNetworkRequestTypes";

export const performRequest = async <TReq, TRes>(
    config: NetworkRequest<TReq>,
    requireAuth: boolean = true
): Promise<ApiResponseBody<TRes>> => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}${config.endpoint}`;
    
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
        throw new Error(error.response?.data?.error || error.message || 'Network error');
    }
};

export const performAuthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, true);

export const performUnauthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, false);