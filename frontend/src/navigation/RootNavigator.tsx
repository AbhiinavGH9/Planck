import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';
import { useWindowDimensions, ActivityIndicator, View, Platform, StyleSheet } from 'react-native';

import LoginScreen from '../screens/Auth/LoginScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import ChatsListScreen from '../screens/Main/ChatsListScreen';
import ChatDetailScreen from '../screens/Main/ChatDetailScreen';


import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { useThemeColors, useThemeStore } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



import { BlurView } from 'expo-blur';

function AppTabs() {
    const { width } = useWindowDimensions();
    const colors = useThemeColors();
    const isLargeScreen = width > 768;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.text,
                tabBarInactiveTintColor: 'rgba(100,100,100,0.5)',
                tabBarStyle: {
                    display: 'none', // Hidden on all platforms as we have only one tab now
                    position: 'absolute',
                    bottom: 30,
                    marginHorizontal: (width - 258) / 2, // Centered floating pill
                    width: 258,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.6)' : 'transparent', // Web glass
                    borderTopWidth: 0,
                    elevation: 0, // Remove default shadow, use custom
                    // Web-only shadow/backdrop
                    ...Platform.select({
                        web: {
                            backdropFilter: 'blur(45px)',
                            boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.5)'
                        },
                        default: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                        }
                    })
                },
                tabBarBackground: () => (
                    Platform.OS !== 'web' ? (
                        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
                    ) : null
                ),
                tabBarItemStyle: {
                    height: 84,
                    paddingTop: 10,
                    paddingBottom: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'System',
                    fontWeight: '600',
                    marginTop: 5
                },
                tabBarIcon: ({ focused, color }) => {
                    const IconComponent = MessageCircle;
                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: focused ? 'rgba(0,0,0,0.05)' : 'transparent'
                        }}>
                            <IconComponent size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Chats" component={ChatsListScreen} options={{ tabBarLabel: 'Inbox' }} />

        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const { checkSession, isLoading, user, token } = useAuthStore();
    const { connectSocket, disconnectSocket } = useChatStore();
    const { loadTheme } = useThemeStore();

    useEffect(() => {
        checkSession();
        loadTheme();
    }, []);

    useEffect(() => {
        if (user && token) {
            connectSocket(token, user.id);
        } else {
            disconnectSocket();
        }
    }, [user, token]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        {/* Simple logic: if new user logic needed, add Onboarding here */}
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={AppTabs} />
                        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
