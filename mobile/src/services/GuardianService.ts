import api from './api';

export const GuardianService = {
    searchUsers: async (email: string) => {
        const response = await api.get(`/guardians/search`, {
            params: { query: email }
        });
        return response.data;
    },

    addGuardian: async (guardianId: number) => {
        await api.post(`/guardians/${guardianId}`, {});
    },

    removeGuardian: async (guardianId: number) => {
        await api.delete(`/guardians/${guardianId}`);
    },

    getMyGuardians: async () => {
        const response = await api.get(`/guardians`);
        return response.data;
    },

    getProtectingUsers: async () => {
        const response = await api.get(`/guardians/protecting`);
        return response.data;
    }
};