import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import PatConfig from '@/src/controllers/PatConfig';
import { AuthState } from '@/src/features/auth/controllers/AuthState';

interface SocketMessage<T> {
    type: string;
    userId: string;
    data: T;
}

interface HeartbeatData {
    timestamp: number;
}

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

        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            console.log('socket connection skipped: no auth token');
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
            query: { token: authToken },
            extraHeaders: {
                'Authorization': `Bearer ${authToken}`
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

    private emit<T>(event: string, data: T): void {
        if (!this.socket || !this.isConnected) {
            console.log(`socket emit failed: not connected, event: ${event}`);
            return;
        }

        this.socket.emit(event, data);
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
            console.log(`socket received message: ${JSON.stringify(data)}`);
            this.handleIncomingMessage(data);
        });
    }

    private handleIncomingMessage(messageData: any): void {
        if (!messageData || typeof messageData !== 'object' || !messageData.type) {
            console.log(`socket malformed message: ${JSON.stringify(messageData)}`);
            return;
        }

        const { type, userId, data } = messageData;
        console.log(`socket handling message type: ${type}`);

        switch (type) {
            case 'emailVerified':
                console.log(`socket handling emailVerified for user: ${userId}`);
                AuthState.getState().updateUserInfo((userInfo) => {
                    if (userInfo) {
                        userInfo.isEmailVerified = true;
                    }
                    return userInfo;
                });
                break;
            default:
                console.log(`socket unhandled message type: ${type}`);
        }

        // Notify all listeners for this event type
        const listeners = this.listeners.get(type) || [];
        listeners.forEach(callback => callback(messageData));
    }

    private updateConnectionState(connected: boolean): void {
        this.isConnected = connected;
    }

    private sendHeartbeat(): void {
        const heartbeat: SocketMessage<HeartbeatData> = {
            type: 'heartbeat',
            userId: '',
            data: { timestamp: Date.now() }
        };

        console.log(`socket sending heartbeat: ${JSON.stringify(heartbeat)}`);
        this.emit('heartbeat', heartbeat);
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

        // Connect on component mount
        socketService.connect();

        // Disconnect on component unmount
        return () => {
            unsubscribe();
            disconnectUnsubscribe();
        };
    }, []);

    return { isConnected };
}

export default SocketService;