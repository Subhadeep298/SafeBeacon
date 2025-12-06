import { Client } from '@stomp/stompjs';
import { TextEncoder, TextDecoder } from 'text-encoding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '@env';
const Safe_WS_URL = WS_URL || 'ws://10.0.2.2:8080/ws';

// Robust Polyfill for STOMP
if (typeof global.TextEncoder === 'undefined') {
    const TextEncoding = require('text-encoding');
    global.TextEncoder = TextEncoding.TextEncoder;
    global.TextDecoder = TextEncoding.TextDecoder;
}


class LocationService {
    private client: Client;
    private subscriptions: any[] = [];

    constructor() {
        this.client = new Client({
            brokerURL: Safe_WS_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            onConnect: () => {
                // Connected to WS
            },
            onStompError: (frame) => {
                // Broker reported error
            },
        });
    }

    async connect() {
        const token = await AsyncStorage.getItem('accessToken');
        let url = Safe_WS_URL;
        if (token) {
            // Append token to URL query string for handshake auth
            url = `${Safe_WS_URL}?token=${token}`;
        }

        // Update client configuration with new URL
        this.client.brokerURL = url;

        console.log('Connecting to WS with URL:', url); // Debug log
        this.client.activate();
    }

    async disconnect() {
        this.client.deactivate();
    }

    sendLocation(latitude: number, longitude: number) {
        if (this.client.connected) {
            this.client.publish({
                destination: '/app/location',
                body: JSON.stringify({ latitude, longitude }),
            });
        }
    }

    subscribeToUser(userId: number, callback: (location: any) => void) {
        if (!this.client.connected) {
            // Wait for connection or queue? For MVP, assume connected or retry logic
            // In production, robust queueing is needed.
            return;
        }

        const sub = this.client.subscribe(`/topic/location/${userId}`, (message) => {
            if (message.body) {
                callback(JSON.parse(message.body));
            }
        });
        this.subscriptions.push(sub);
        return sub;
    }
}

export default new LocationService();
