import { create } from 'zustand';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, getToken, removeToken } from '../utils/storage';

interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
    bio?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string, avatarUrl?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,

    login: async (username, password, avatarUrl) => {
        try {
            const response = await api.post('/auth/login', { username, password, avatarUrl });
            const { token, user } = response.data;

            await setToken(token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            set({ token, user, isLoading: false });
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    },

    logout: async () => {
        await removeToken();
        await AsyncStorage.removeItem('user');
        set({ token: null, user: null });
    },

    updateUser: async (updates) => {
        try {
            await api.put('/user/update', updates);
            set((state) => {
                const newUser = state.user ? { ...state.user, ...updates } : null;
                AsyncStorage.setItem('user', JSON.stringify(newUser));
                return { user: newUser };
            });
        } catch (error) {
            console.error('Update user failed', error);
            throw error;
        }
    },

    checkSession: async () => {
        try {
            const token = await getToken();
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                set({ token, user: JSON.parse(userStr), isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
        }
    }
}));
