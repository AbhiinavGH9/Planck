import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import ChatRow from './ChatRow';
import { X, ArchiveRestore } from 'lucide-react-native';
import api from '../services/api';

interface Props {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

export default function ArchivedChatsModal({ visible, onClose, navigation }: Props) {
    const colors = useThemeColors();
    const { chats, chatSettings, fetchChatSettings, toggleChatSetting } = useChatStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchChatSettings();
        }
    }, [visible]);

    const archivedChats = chats.filter(chat => chatSettings[chat.id]?.isArchived);

    const handleUnarchive = async (chatId: string) => {
        await toggleChatSetting(chatId, 'isArchived', false);
    };

    const handleChatPress = (chat: any) => {
        onClose();
        navigation.navigate('ChatDetail', { chatId: chat.id, otherUser: chat.otherUser });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[styles.card, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF', borderColor: colors.border }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Archived Chats</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={archivedChats}
                            keyExtractor={(item) => item.id}
                            style={{ width: '100%' }}
                            renderItem={({ item }) => (
                                <View style={{ paddingHorizontal: 0 }}>
                                    <ChatRow
                                        chat={item}
                                        onPress={() => handleChatPress(item)}
                                        isPinned={chatSettings[item.id]?.isPinned}
                                        isMuted={chatSettings[item.id]?.isMuted}
                                        isArchived={true}
                                    />
                                    {/* Unarchive Button specifically? Or just let ChatRow handle it by click? 
                                        Clicking opens chat. We need a way to unarchive. 
                                        Adding simple button here since menu logic was removed from ChatRow. 
                                    */}
                                    <TouchableOpacity
                                        onPress={() => handleUnarchive(item.id)}
                                        style={{ position: 'absolute', right: 10, top: 20, padding: 8, backgroundColor: colors.sidebarBackground, borderRadius: 8 }}
                                    >
                                        <ArchiveRestore size={16} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', marginTop: 50 }}>
                                    <ArchiveRestore size={48} color={colors.textSecondary} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No archived chats</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '85%',
        maxWidth: 400,
        height: '70%',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
