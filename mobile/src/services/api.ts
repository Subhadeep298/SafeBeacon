import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

import { API_URL } from '@env';

// Change this to your computer's IP address when testing on physical device
// Find your IP: Run 'ipconfig' in PowerShell and look for IPv4 Address
// const API_URL = 'http://10.0.2.2:8080/api'; // Android emulator
// const API_URL = 'http://192.168.29.200.nip.io:8080/api'; // Physical device (nip.io for OAuth)

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data),

    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data),

    logout: () =>
        api.post('/auth/logout'),

    getProfile: () =>
        api.get<User>('/auth/me'),
};

export default api;
