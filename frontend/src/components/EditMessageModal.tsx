import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { X, Check } from 'lucide-react-native';

interface EditMessageModalProps {
    visible: boolean;
    message: any;
    onClose: () => void;
    onSave: (newText: string) => Promise<void>;
}

export default function EditMessageModal({ visible, message, onClose, onSave }: EditMessageModalProps) {
    const colors = useThemeColors();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (message) {
            setText(message.text);
        }
    }, [message, visible]);

    const handleSave = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            await onSave(text.trim());
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF', borderColor: colors.border }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Edit Message</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.background === '#000000' ? '#2C2C2E' : '#F2F2F7', borderColor: colors.border }]}
                        value={text}
                        onChangeText={setText}
                        placeholder="Edit your message..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        autoFocus
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.btnText, { color: '#FF3B30' }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: colors.blue }]}
                            onPress={handleSave}
                            disabled={loading || !text.trim()}
                        >
                            {loading ? <ActivityIndicator size="small" color="#FFF" /> : (
                                <>
                                    <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>Save</Text>
                                </>
                            )}
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 0.5
    },
    title: {
        fontSize: 20,
        fontWeight: '700'
    },
    input: {
        minHeight: 100,
        maxHeight: 200,
        borderRadius: 16,
        padding: 16,
        textAlignVertical: 'top',
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 20
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    btn: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600'
    }
});
