import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { PlusCircle, MoreVertical } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeColors } from '../stores/useThemeStore';
import { useNavigation } from '@react-navigation/native';

export default function SidebarHeader({ title, onAddChat }: { title: string, onAddChat: () => void }) {
    const { user, logout } = useAuthStore();
    const colors = useThemeColors();
    const navigation = useNavigation<any>();
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const onSettings = () => {
        setMenuVisible(false);
        // If on web split view, maybe open modal or navigate?
        // For now, simpler to navigate or show modal.
        navigation.navigate('Settings');
    };

    const onProfile = () => {
        navigation.navigate('Profile');
    };

    return (
        <View style={[styles.header, { backgroundColor: colors.headers, borderBottomColor: colors.border, zIndex: 10 }]}>
            {/* zIndex needed for the menu to appear on top if containers overlap, though inside Sidebar it might clip if sidebar has overflow hidden */}
            <TouchableOpacity onPress={onProfile}>
                <Image
                    source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }}
                    style={styles.avatar}
                />
            </TouchableOpacity>

            <View style={styles.rightIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={onAddChat}>
                    <PlusCircle size={28} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                    <MoreVertical size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Menu Dropdown - Inline Absolute */}
            {menuVisible && (
                <View style={[styles.menu, { backgroundColor: colors.background, borderColor: colors.border, shadowColor: colors.text }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={onSettings}>
                        <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={logout}>
                        <Text style={[styles.menuText, { color: colors.error }]}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 60,
        borderBottomWidth: 1,
        // Ensure header is on top of list for menu to show over it if list has no zIndex
        zIndex: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
    },
    rightIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
    },
    menu: {
        position: 'absolute',
        top: 55, // Just below the header (height 60 - padding) or so
        right: 10,
        width: 150,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 4,
        zIndex: 20,
        ...Platform.select({
            web: {
                boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
            },
            default: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 5,
            }
        })
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
