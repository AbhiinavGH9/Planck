import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { Pin, VolumeX, MoreHorizontal, Archive, Trash2, CheckCheck, ArchiveRestore } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';

interface Props {
    chat: any;
    onPress: () => void;
    isSelected?: boolean;
    isPinned?: boolean;
    isMuted?: boolean;
    isArchived?: boolean;
}

export default function ChatRow({ chat, onPress, isSelected, isPinned, isMuted, isArchived }: Props) {
    const colors = useThemeColors();
    const { user } = useAuthStore();

    // Format time logic (simplified)
    const time = chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const myUnreadCount = (chat.unreadCounts && user) ? (chat.unreadCounts[user.id] || 0) : 0;
    const isUnread = myUnreadCount > 0;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: isSelected ? colors.selectedChat : 'transparent' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: chat.otherUser.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                {chat.otherUser.isOnline && <View style={[styles.badge, { borderColor: isSelected ? colors.selectedChat : colors.sidebarBackground }]} />}
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{chat.otherUser.username}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isPinned && <Pin size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />}
                        {isMuted && <VolumeX size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />}
                        <Text style={[styles.time, { color: colors.textSecondary }]}>{time}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.message, { color: isUnread ? colors.text : colors.textSecondary, fontWeight: isUnread ? '600' : '400' }]} numberOfLines={2}>
                        {(() => {
                            if (!chat.lastMessage) return 'No messages';
                            if (chat.lastMessage.type === 'image') return '📷 Image';
                            if (chat.lastMessage.type === 'contact') {
                                try {
                                    const contact = JSON.parse(chat.lastMessage.text);
                                    return `👤 Contact: ${contact.username || 'Unknown'}`;
                                } catch {
                                    return '👤 Contact';
                                }
                            }
                            return chat.lastMessage.text;
                        })()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isUnread && (
                            <View style={[styles.unreadBadge, { backgroundColor: Colors.primary }]}>
                                <Text style={styles.unreadText}>{myUnreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eee',
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#34C759', // Online Color
        borderWidth: 2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1 // Important for menu
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    time: {
        fontSize: 12,
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
        lineHeight: 18,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    menu: {
        position: 'absolute',
        right: 0,
        top: 30, // Below dots
        width: 140,
        borderRadius: 12,
        borderWidth: 1,
        zIndex: 9999, // High zIndex Control
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 8,
        borderRadius: 6
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500'
    },
    divider: {
        height: 1,
        marginVertical: 4
    }
});
