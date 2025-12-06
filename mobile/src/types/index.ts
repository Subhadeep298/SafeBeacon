export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    profilePicture?: string;
    guardianCode?: string;
    authProvider: 'JWT' | 'GOOGLE';
    lastLatitude?: number;
    lastLongitude?: number;
    lastLocationUpdate?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
