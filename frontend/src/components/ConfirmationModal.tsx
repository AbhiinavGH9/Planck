import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../constants/Colors';
import { useThemeColors } from '../stores/useThemeStore';
import { Trash2, AlertTriangle } from 'lucide-react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({
    visible,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    const colors = useThemeColors();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

                {/* Modal Card */}
                <View style={[styles.card, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF', borderColor: colors.border }]}>
                    <View style={styles.iconContainer}>
                        {isDanger && <AlertTriangle size={32} color={Colors.danger} />}
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.background === '#000000' ? '#2C2C2E' : '#ddd' }]} onPress={onCancel}>
                            <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: isDanger ? Colors.danger : colors.blue }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.buttonText, { color: '#FFF' }]}>{confirmText}</Text>
                        </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 2000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: 300,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10
    },
    iconContainer: {
        marginBottom: 16
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center'
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%'
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelButton: {
        // bg handled in render
    },
    confirmButton: {
        // bg handled in render
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600'
    }
});
