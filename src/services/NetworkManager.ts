import PatConfig from '@/src/controllers/PatConfig';
import { Logger } from "@/src/features/dev/components/Logger";

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
        Logger.debug('network', 'performing request', {
            endpoint: request.endpoint,
            method: request.method,
            body: request.body,
            token: request.token,
        });
        const url = `${this.baseURL}${request.endpoint}`;
        Logger.debug('network', 'request URL', url);

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
            Logger.debug('network', 'fetching');
            const response = await fetch(url, options);
            Logger.debug('network', 'fetch completed', {
                status: response.status,
                statusText: response.statusText,
            });
            const data = await response.json();
            Logger.debug('network', 'response data', data);

            if (!data.success) {
                throw new NetworkError(
                    data.error || 'Unknown error occurred',
                    response.status
                );
            }

            return data.data;
        } catch (error) {
            Logger.error('network', 'request failed', {
                endpoint: request.endpoint,
                method: request.method,
                error: error instanceof Error ? error.message : String(error),
            });
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