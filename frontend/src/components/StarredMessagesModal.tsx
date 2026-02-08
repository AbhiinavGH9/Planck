import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useChatStore } from '../stores/useChatStore';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, Star, MessageSquare, ArrowRight } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    navigation: any;
    chatIdFilter?: string;
}

export default function StarredMessagesModal({ visible, onClose, navigation, chatIdFilter }: Props) {
    const colors = useThemeColors();
    const { starredMessages, fetchStarredMessages, chats } = useChatStore();

    useEffect(() => {
        if (visible) {
            fetchStarredMessages();
        }
    }, [visible]);

    const filtered = chatIdFilter
        ? starredMessages.filter(m => m.chatId === chatIdFilter)
        : starredMessages;

    const handleJumpToChat = (item: any) => {
        onClose();
        const chat = chats.find(c => c.id === item.chatId);
        if (chat) {
            navigation.navigate('ChatDetail', {
                chatId: chat.id,
                otherUser: chat.otherUser,
                highlightMessageId: item.id // Pass ID to highlight/scroll
            });
        }
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Star size={20} color={Colors.trafficYellow} fill={Colors.trafficYellow} style={{ marginRight: 8 }} />
                            <Text style={[styles.title, { color: colors.text }]}>Starred Messages</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                        style={{ width: '100%' }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, { backgroundColor: colors.background === '#000000' ? '#2C2C2E' : '#F2F2F7' }]}
                                onPress={() => !chatIdFilter && handleJumpToChat(item)}
                            >
                                <View style={styles.itemHeader}>
                                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                                        {formatDate(item.starredAt)}
                                    </Text>
                                    {!chatIdFilter && <ArrowRight size={14} color={colors.textSecondary} />}
                                </View>

                                {item.message?.type === 'image' ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Image source={{ uri: item.message.mediaUrl }} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />
                                        <Text style={{ color: colors.text, fontStyle: 'italic' }}>Image</Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.messageText, { color: colors.text }]} numberOfLines={3}>
                                        {(() => {
                                            if (item.message?.type === 'contact') {
                                                try {
                                                    const contact = JSON.parse(item.message.text);
                                                    return `👤 Contact: ${contact.username || 'Unknown'}`;
                                                } catch {
                                                    return '👤 Contact';
                                                }
                                            }
                                            return item.message?.text;
                                        })()}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <Star size={40} color={colors.border} />
                                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No starred messages yet</Text>
                            </View>
                        }
                    />
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
        maxWidth: 360,
        maxHeight: '80%',
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4
    },
    item: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    date: {
        fontSize: 10,
        fontWeight: '600',
        uppercase: 'uppercase'
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20
    }
});
