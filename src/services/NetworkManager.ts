import PatConfig from '@/src/controllers/PatConfig';
import { useAuthStore } from "@/src/features/auth/controllers/useAuthStore";
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
 * Service for making API requests
 */
class NetworkManager {
    private static instance: NetworkManager;
    private baseURL: string;

    private constructor() {
        this.baseURL = PatConfig.apiURL;
    }

    public static get shared(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    async performAuthenticated<TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiResponseBody<TRes>> {
        const authTokens = useAuthStore.getState().authTokens;
        if (!authTokens) throw new Error('could not perform authenticated request: no auth tokens available');
        return this.perform<TReq, ApiResponseBody<TRes>>(request, authTokens.accessToken);
    }

    async performUnauthenticated<TReq, TRes>(
        request: NetworkRequest<TReq>
    ): Promise<ApiResponseBody<TRes>> {
        return this.perform<TReq, ApiResponseBody<TRes>>(request, null);
    }

    private async perform<TReq, TRes>(
        request: NetworkRequest<TReq>,
        token: string | null = null
    ): Promise<ApiResponseBody<TRes>> {
        const url = `${this.baseURL}${request.endpoint}`;

        const config: AxiosRequestConfig = {
            method: request.method.toLowerCase() as any,
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: request.body,
        };

        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await axios(config);
            const data: ApiResponseBody<TRes> = response.data;
            return data;
        } catch (error: any) {
            if (error.response) {
                const message = error.response.data?.error || error.response.statusText || 'unknown error occurred';
                console.error(`API request failed: ${error.response.status} ${message}`);
                throw new NetworkError(message, error.response.status);
            } else if (error.request) {
                console.error('Network error: no response received');
                throw new NetworkError('Network error: no response received', 0);
            } else {
                console.error('Request setup error:', error.message);
                throw new Error(error.message);
            }
        }
    }
}

export default NetworkManager;