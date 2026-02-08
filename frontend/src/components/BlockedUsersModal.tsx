import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { useChatStore } from '../stores/useChatStore';
import { Colors } from '../constants/Colors';
import { X, Ban, Unlock } from 'lucide-react-native';
import api from '../services/api';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function BlockedUsersModal({ visible, onClose }: Props) {
    const colors = useThemeColors();
    const { blockedUsers, unblockUser } = useChatStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchBlockedDetails();
        }
    }, [visible, blockedUsers]);

    const fetchBlockedDetails = async () => {
        setLoading(true);
        try {
            // We need full user details, assuming GET /user/blocked returns full objects
            // Use local store IDs to cross ref implies we might need to fetch them if store only has IDs
            // But let's assume the endpoint returns list of user objects
            const res = await api.get('/user/blocked');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: string) => {
        await unblockUser(userId);
        // Optimistic local update for this modal
        setUsers(prev => prev.filter(u => u.id !== userId));
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
                            <Ban size={20} color={Colors.danger} style={{ marginRight: 10 }} />
                            <Text style={[styles.title, { color: colors.text }]}>Blocked Users</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.id}
                            style={{ width: '100%' }}
                            renderItem={({ item }) => (
                                <View style={[styles.row, { borderBottomColor: colors.border }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                                        <Text style={[styles.name, { color: colors.text }]}>{item.username}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.unblockBtn}
                                        onPress={() => handleUnblock(item.id)}
                                    >
                                        <Unlock size={14} color="#FFF" />
                                        <Text style={styles.btnText}>Unblock</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', marginTop: 30, paddingBottom: 20 }}>
                                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(128,128,128,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <Ban size={24} color={colors.textSecondary} />
                                    </View>
                                    <Text style={{ color: colors.textSecondary }}>No blocked users</Text>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '90%',
        maxWidth: 400,
        maxHeight: '70%',
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#ccc'
    },
    name: {
        fontSize: 16,
        fontWeight: '600'
    },
    unblockBtn: {
        backgroundColor: Colors.blue,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6
    },
    btnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600'
    }
});
