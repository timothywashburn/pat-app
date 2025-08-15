import { useAuthStore } from '@/src/stores/useAuthStore';
import PatConfig from '@/src/misc/PatConfig';
import axios, { AxiosRequestConfig } from 'axios';
import { HTTPMethod, ApiResponseBody, NetworkRequest } from '@/src/hooks/useNetworkRequest';

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
        throw new Error(error.response?.data?.error || error.message || 'Network error');
    }
};

export const performAuthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, true);

export const performUnauthenticatedRequest = <TReq, TRes>(config: NetworkRequest<TReq>) => 
    performRequest<TReq, TRes>(config, false);