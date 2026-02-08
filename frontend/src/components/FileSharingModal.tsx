import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Platform, TouchableWithoutFeedback } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';

interface FileSharingModalProps {
    visible: boolean;
    onClose: () => void;
    onAction: (action: 'gallery' | 'files') => void;
    position: { top?: number; bottom?: number; left?: number; right?: number } | null;
}

export default function FileSharingModal({ visible, onClose, onAction, position }: FileSharingModalProps) {
    const colors = useThemeColors();
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 6,
                tension: 50
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    // Default position if none provided (shouldn't happen with correct usage)
    const modalStyle = position ? {
        position: 'absolute' as const,
        left: position.left,
        bottom: position.bottom,
        // Ensure it doesn't go off-screen
        transform: [{ scale: scaleAnim }]
    } : {
        position: 'absolute' as const,
        bottom: 80,
        left: 20,
        transform: [{ scale: scaleAnim }]
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* Positioned Content */}
                    <TouchableWithoutFeedback>
                        <Animated.View style={[
                            styles.menuContainer,
                            modalStyle,
                            { backgroundColor: colors.secondaryBackground, borderColor: colors.border }
                        ]}>
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                                onPress={() => onAction('gallery')}
                            >
                                <Text style={[styles.menuText, { color: colors.text }]}>Images</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => onAction('files')}
                            >
                                <Text style={[styles.menuText, { color: colors.text }]}>Files</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle dim
    },
    menuContainer: {
        width: 140,
        borderRadius: 12,
        borderWidth: 1,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        paddingVertical: 4,
        zIndex: 9999
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
    }
});
