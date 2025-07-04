import PatConfig from '@/src/controllers/PatConfig';
import { useAuthStore } from "@/src/features/auth/controllers/useAuthStore";

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

    async performAuthenticated<ReqData = never, ResData = never>(
        request: NetworkRequest<ReqData>
    ): Promise<ResData> {
        const authTokens = useAuthStore.getState().authTokens;
        if (!authTokens) throw new Error('could not perform authenticated request: no auth tokens available');
        return this.perform<ReqData, ResData>(request, authTokens.accessToken);
    }

    async performUnauthenticated<ReqData = never, ResData = never>(
        request: NetworkRequest<ReqData>
    ): Promise<ResData> {
        return this.perform<ReqData, ResData>(request, null);
    }

    private async perform<ReqData = never, ResData = never>(
        request: NetworkRequest<ReqData>,
        token: string | null = null
    ): Promise<ResData> {
        const url = `${this.baseURL}${request.endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options: RequestInit = {
            method: request.method,
            headers,
            body: request.body ? JSON.stringify(request.body) : undefined,
        };

        const response = await fetch(url, options);

        const contentType = response.headers.get('content-type');
        const isJSON = contentType && contentType.includes('application/json');
        const data = isJSON ? await response.json().catch((jsonError) => {
            console.error('json parse error:', jsonError);
            throw new Error('invalid json response from server');
        }) : null;

        if (!response.ok) {
            const message = data?.error || response.statusText || 'unknown error occurred';
            console.error(`API request failed: ${response.status} ${message}`);
            throw new NetworkError(message, response.status);
        }

        if (!isJSON) {
            console.error('api returned non-json response:', contentType);
            throw new Error('api server returned unexpected response format');
        }

        if (!data.success) {
            throw new Error(data.error || 'unknown error occurred');
        }

        return data.data;
    }
}

export default NetworkManager;