import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, Search } from 'lucide-react-native';
import api from '../services/api';

interface FriendFinderModalProps {
    visible: boolean;
    onClose: () => void;
    navigation: any;
}

export default function FriendFinderModal({ visible, onClose, navigation }: FriendFinderModalProps) {
    const colors = useThemeColors();
    const { user: authUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) {
            setSearchQuery('');
            setUsers([]);
        }
    }, [visible]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length === 0) {
            setUsers([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/user/search?query=${query}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (targetUserId: string) => {
        try {
            const response = await api.post('/user/chat', { targetUserId });
            onClose();
            // We need to navigate to ChatDetail.
            // Assuming navigation prop is passed or we could use useNavigation hook.
            // Using passed prop for now.
            navigation.navigate('ChatDetail', {
                chatId: response.data.id,
                user: users.find((u: any) => u.id === targetUserId)
            });
        } catch (error) {
            console.error("Create chat failed", error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.userCard, { borderColor: colors.border }]}>
            <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
            </View>
            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.blue }]}
                onPress={() => handleStartChat(item.id)}
            >
                <Text style={styles.addBtnText}>Message</Text>
            </TouchableOpacity>
        </View>
    );

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
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: colors.text }]}>Find Friends</Text>

                    <View style={[styles.searchContainer, { backgroundColor: colors.background === '#000000' ? '#333' : 'rgba(128,128,128,0.1)' }]}>
                        <Search size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Search username..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                        />
                    </View>

                    {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 10 }} />}

                    <FlatList
                        data={users}
                        renderItem={renderItem}
                        keyExtractor={(item: any) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        style={{ width: '100%', maxHeight: 400 }}
                        ListEmptyComponent={
                            !loading && searchQuery.length > 0 ? (
                                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>No users found</Text>
                            ) : null
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '85%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 10
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        width: '100%',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        height: '100%',
        outlineStyle: 'none'
    } as any,
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        width: '100%'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    addBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14
    }
});
