import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { X, MessageSquare, Mail } from 'lucide-react-native';

interface ContactDetailsModalProps {
    visible: boolean;
    user: any;
    onClose: () => void;
    onMessage: () => void;
}

export default function ContactDetailsModal({ visible, user, onClose, onMessage }: ContactDetailsModalProps) {
    const colors = useThemeColors();

    if (!user) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Backdrop Click to Close */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[styles.card, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF' }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: user.avatar || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />

                    <Text style={[styles.name, { color: colors.text }]}>{user.username}</Text>

                    {/* Bio */}
                    {user.bio ? (
                        <Text style={[styles.bio, { color: colors.textSecondary }]}>"{user.bio}"</Text>
                    ) : (
                        <Text style={[styles.bio, { color: colors.textSecondary, fontStyle: 'italic' }]}>No bio available</Text>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Email */}
                    <View style={styles.infoRow}>
                        <Mail size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{user.email || 'No email'}</Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity style={[styles.messageBtn, { backgroundColor: colors.blue }]} onPress={onMessage}>
                        <MessageSquare size={18} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>Message</Text>
                    </TouchableOpacity>
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
        width: '80%',
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
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(128,128,128,0.1)'
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center'
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 10
    },
    divider: {
        width: '100%',
        height: 1,
        marginBottom: 20
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500'
    },
    messageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        width: '100%',
        justifyContent: 'center'
    },
    btnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16
    }
});
