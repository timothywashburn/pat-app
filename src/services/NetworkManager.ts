import PatConfig from '@/src/controllers/PatConfig';

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
    token?: string;
}

export class NetworkError extends Error {
    code: number;

    constructor(message: string, code: number = -1) {
        super(message);
        this.name = 'NetworkError';
        this.code = code;
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

    async perform<ReqData = never, ResData = never>(request: NetworkRequest<ReqData>): Promise<ResData> {
        const url = `${this.baseURL}${request.endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (request.token) {
            headers['Authorization'] = `Bearer ${request.token}`;
        }

        const options: RequestInit = {
            method: request.method,
            headers,
            body: request.body ? JSON.stringify(request.body) : undefined,
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!data.success) {
                throw new NetworkError(
                    data.error || 'Unknown error occurred',
                    response.status
                );
            }

            return data.data;
        } catch (error) {
            if (error instanceof NetworkError) {
                throw error;
            }

            console.error('Network request failed:', error);
            throw new NetworkError(
                error instanceof Error ? error.message : 'Network request failed'
            );
        }
    }
}

export default NetworkManager;