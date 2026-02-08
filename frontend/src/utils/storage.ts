import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const setToken = async (token: string) => {
    if (isWeb) {
        await AsyncStorage.setItem('token', token);
    } else {
        await SecureStore.setItemAsync('token', token);
    }
};

export const getToken = async () => {
    if (isWeb) {
        return await AsyncStorage.getItem('token');
    } else {
        return await SecureStore.getItemAsync('token');
    }
};

export const removeToken = async () => {
    if (isWeb) {
        await AsyncStorage.removeItem('token');
    } else {
        await SecureStore.deleteItemAsync('token');
    }
};
