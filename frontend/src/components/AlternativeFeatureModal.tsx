import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, Frown, MessageCircle } from 'lucide-react-native';

interface AlternativeFeatureModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AlternativeFeatureModal({ visible, onClose }: AlternativeFeatureModalProps) {
    const colors = useThemeColors();

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[styles.card, {
                    backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF',
                    borderColor: colors.border
                }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 204, 0, 0.1)' }]}>
                            <Frown size={48} color={Colors.trafficYellow} />
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>shuklaji didn't thought of me yet</Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.buttonText, { color: Colors.trafficRed }]}>that's sad</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.buttonText, { color: Colors.primary }]}>i'll talk to shuklaji</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    card: {
        width: '85%',
        maxWidth: 340,
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 28,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
