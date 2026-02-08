import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, Platform, ActivityIndicator } from 'react-native';
import { useChatStore } from '../stores/useChatStore';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, Check, Send } from 'lucide-react-native';

interface ForwardModalProps {
    visible: boolean;
    onClose: () => void;
    onForward: (selectedChatIds: string[]) => void;
}

export default function ForwardModal({ visible, onClose, onForward }: ForwardModalProps) {
    const colors = useThemeColors();
    const { chats, fetchChats } = useChatStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setSelectedIds([]);
            if (chats.length === 0) {
                setLoading(true);
                fetchChats().finally(() => setLoading(false));
            }
        }
    }, [visible]);

    const toggleSelection = (chatId: string) => {
        if (selectedIds.includes(chatId)) {
            setSelectedIds(prev => prev.filter(id => id !== chatId));
        } else {
            setSelectedIds(prev => [...prev, chatId]);
        }
    };

    const handleSend = () => {
        onForward(selectedIds);
        onClose();
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedIds.includes(item.id);

        const name = item.otherUser?.username || 'Unknown User';
        const avatar = item.otherUser?.avatar || 'https://i.pravatar.cc/150';

        return (
            <TouchableOpacity
                style={[styles.chatRow, { borderBottomColor: colors.border }]}
                onPress={() => toggleSelection(item.id)}
            >
                <Image source={{ uri: avatar }} style={styles.avatar} />
                <Text style={[styles.name, { color: colors.text, fontFamily: 'System' }]}>{name}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected, { borderColor: colors.textSecondary }]}>
                    {isSelected && <Check size={14} color="#FFF" />}
                </View>
            </TouchableOpacity>
        );
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

                <View style={[styles.card, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF' }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>Forward to...</Text>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={selectedIds.length === 0}
                            style={[styles.sendBtn, selectedIds.length === 0 && { opacity: 0.5 }]}
                        >
                            <Send size={18} color="#FFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={chats}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            style={{ width: '100%', maxHeight: 400 }}
                            ListEmptyComponent={
                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No chats found</Text>
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
        justifyContent: 'center', // Centered
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '85%',
        maxWidth: 340, // Consistent dimensions
        borderRadius: 24,
        paddingVertical: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        paddingTop: 10,
        width: '100%',
        borderBottomWidth: 0.5,
    },
    closeBtn: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    sendBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1DAB61',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
        width: '100%'
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        width: '100%',
        borderBottomWidth: 0.5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#CCC',
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1DAB61',
        borderColor: '#1DAB61',
        borderWidth: 0,
    }
});
