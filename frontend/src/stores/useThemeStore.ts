import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    loadTheme: () => Promise<void>;
    colors: any;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    isDarkMode: false,
    colors: Colors, // Default to light

    toggleTheme: async () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    },

    loadTheme: async () => {
        const storedTheme = await AsyncStorage.getItem('theme');
        set({ isDarkMode: storedTheme === 'dark' });
    }
}));

// Helper to get current colors based on theme hook
export const useThemeColors = () => {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);

    if (isDarkMode) {
        return {
            ...Colors,
            background: Colors.darkBackground,
            secondaryBackground: Colors.darkSecondaryBackground,
            text: Colors.darkText,
            textSecondary: Colors.darkTextSecondary,
            border: Colors.darkBorder,
            incomingBubble: Colors.darkIncomingBubble,
            outgoingBubble: Colors.darkOutgoingBubble,
            headers: Colors.darkHeaders,
            white: Colors.darkSecondaryBackground, // Re-map white to dark gray for cards

            // New UI Mappings
            sidebarBackground: Colors.darkSidebarBackground,
            searchBackground: Colors.darkSearchBackground,
            selectedChat: Colors.darkSelectedChat,
            blue: '#0A84FF', // Lighten for dark mode
        };
    }
    return {
        ...Colors,
        // Ensure default mappings exist for consistency
        sidebarBackground: Colors.sidebarBackground,
        searchBackground: Colors.searchBackground,
        selectedChat: Colors.selectedChat,
        trafficRed: Colors.trafficRed,
        trafficYellow: Colors.trafficYellow,
        trafficGreen: Colors.trafficGreen,
    };
};
