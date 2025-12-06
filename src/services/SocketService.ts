import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import PatConfig from '@/src/misc/PatConfig';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    ClientVerifyEmailResponseData,
    ServerHeartbeatData,
    SocketMessage,
    SocketMessageType,
    UserId
} from "@timothyw/pat-common";
import { useUserDataStore } from "@/src/stores/useUserDataStore";

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;
    private reconnectTimer: number | null = null;
    private isConnected: boolean = false;
    private listeners: Map<string, ((data: any) => void)[]> = new Map();

    private constructor() {}

    static get shared(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(): void {
        if (this.socket) {
            if (this.socket.connected) {
                console.log('socket already connected');
                return;
            }
        }

        const authTokens = useAuthStore.getState().authTokens;
        if (!authTokens) {
            console.log('socket connection skipped: no auth tokens');
            return;
        }

        console.log('socket connecting...');

        // Disconnect existing socket if any
        this.disconnect();

        this.socket = io(PatConfig.apiURL, {
            path: PatConfig.socketPath,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 5000,
            query: { token: authTokens.accessToken },
            extraHeaders: {
                'Authorization': `Bearer ${authTokens.accessToken}`
            }
        });

        this.setupHandlers();
    }

    disconnect(): void {
        if (!this.socket) return;

        console.log('socket disconnecting...');
        this.socket.disconnect();
        this.updateConnectionState(false);

        if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    on<T>(event: string, callback: (data: T) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event)!;
        eventListeners.push(callback as any);

        return () => {
            const index = eventListeners.indexOf(callback as any);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        };
    }

    private emit<T>(type: SocketMessageType, data: T): void {
        if (!this.socket || !this.isConnected) {
            console.log(`socket emit failed: not connected, event: ${type}`);
            return;
        }

        this.socket.emit(type, data);
    }

    private setupHandlers(): void {
        if (!this.socket) {
            console.log('socket handlers setup skipped: not initialized');
            return;
        }

        this.socket.on('connect', () => {
            console.log('socket connected');
            this.updateConnectionState(true);

            if (this.reconnectTimer) {
                clearInterval(this.reconnectTimer);
            }

            this.reconnectTimer = setInterval(() => {
                this.sendHeartbeat();
            }, 25000);
        });

        this.socket.on('disconnect', () => {
            console.log('socket disconnected');
            this.updateConnectionState(false);
        });

        this.socket.on('error', (error) => {
            console.log(`socket error: ${error}`);
        });

        this.socket.on('message', (data) => {
            this.handleIncomingMessage(data);
        });
    }

    private updateConnectionState(connected: boolean): void {
        this.isConnected = connected;
    }

    private handleIncomingMessage(message: SocketMessage<unknown>): void {
        if (!message || typeof message !== 'object' || !message.type) {
            console.log(`socket malformed message: ${JSON.stringify(message)}`);
            return;
        }

        const { type, userId } = message;
        // TODO: figure out what I want to do with this
        // console.log(`socket handling message type: ${type}`);

        switch (type) {
            case SocketMessageType.CLIENT_HEARTBEAT_ACK:
                // TODO: Handle checking heartbeat ack for api status
                break;
            case SocketMessageType.CLIENT_VERIFY_EMAIL_RESPONSE:
                let data = message.data as ClientVerifyEmailResponseData;
                console.log(`socket handling emailVerified for user ${userId}: ${data.emailVerified}`);
                if (data.emailVerified) {
                    useAuthStore.getState().updateAuthData((authData) => {
                        if (authData) authData.emailVerified = true;
                        return authData;
                    });
                }
                break;
            default:
                console.log(`socket unhandled message type: ${type}`);
        }

        const listeners = this.listeners.get(type) || [];
        listeners.forEach(callback => callback(message));
    }

    private sendHeartbeat(): void {
        const userId: UserId = useUserDataStore.getState().data._id;
        const heartbeat: SocketMessage<ServerHeartbeatData> = {
            type: SocketMessageType.SERVER_HEARTBEAT,
            userId: userId,
            data: { timestamp: Date.now() }
        };

        // TODO: figure out what I want to do with this
        // console.log(`socket sending heartbeat: ${JSON.stringify(heartbeat)}`);
        this.emit(SocketMessageType.SERVER_HEARTBEAT, heartbeat);
    }

    public sendVerifyEmailCheck(): void {
        const userId: UserId = useUserDataStore.getState().data._id;
        const verifyEmailCheck: SocketMessage<{}> = {
            type: SocketMessageType.SERVER_VERIFY_EMAIL_CHECK,
            userId,
            data: {}
        };

        console.log(`socket sending verify email check: ${JSON.stringify(verifyEmailCheck)}`);
        this.emit(SocketMessageType.SERVER_VERIFY_EMAIL_CHECK, verifyEmailCheck);
    }
}

// React hook to use socket service
export function useSocketConnection() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketService = SocketService.shared;

        const unsubscribe = socketService.on('connect', () => {
            setIsConnected(true);
        });

        const disconnectUnsubscribe = socketService.on('disconnect', () => {
            setIsConnected(false);
        });

        socketService.connect();

        return () => {
            unsubscribe();
            disconnectUnsubscribe();
        };
    }, []);

    return { isConnected };
}

export default SocketService;