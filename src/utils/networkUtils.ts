import { useAuthStore } from '@/src/stores/useAuthStore';
import PatConfig from '@/src/misc/PatConfig';
import axios, { AxiosRequestConfig } from 'axios';
import { HTTPMethod, ApiResponseBody, NetworkRequest } from '@/src/hooks/useNetworkRequest';

export const performAuthenticatedRequest = async <TReq, TRes>(config: {
    endpoint: string;
    method: HTTPMethod;
    body?: TReq;
}): Promise<ApiResponseBody<TRes>> => {
    const authTokens = useAuthStore.getState().authTokens;
    if (!authTokens) throw new Error('No auth tokens available');

    const url = `${PatConfig.apiURL}${config.endpoint}`;

    const axiosConfig: AxiosRequestConfig = {
        method: config.method.toLowerCase() as any,
        url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens.accessToken}`,
        },
        data: config.body,
    };

    try {
        const response = await axios(axiosConfig);
        return { success: true, ...response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Network error'
        };
    }
};