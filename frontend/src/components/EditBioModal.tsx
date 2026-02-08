import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { X, Save } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';

interface EditBioModalProps {
    visible: boolean;
    currentBio?: string;
    onClose: () => void;
}

export default function EditBioModal({ visible, currentBio, onClose }: EditBioModalProps) {
    const colors = useThemeColors();
    const { updateUser } = useAuthStore();
    const [bio, setBio] = useState(currentBio || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUser({ bio });
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF', borderColor: colors.border }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Edit Bio</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.secondaryBackground, borderColor: colors.border }]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Add a bio..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        maxLength={150}
                    />
                    <Text style={{ alignSelf: 'flex-end', color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                        {bio.length}/150
                    </Text>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: colors.blue }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#FFF" /> : (
                            <>
                                <Save size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.saveText}>Save</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 0,
        alignItems: 'center'
    },
    container: {
        width: '85%',
        maxWidth: 340,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 0.5
    },
    title: {
        fontSize: 18,
        fontWeight: '700'
    },
    input: {
        height: 100,
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
        fontSize: 16,
        borderWidth: 1
    },
    saveBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        borderRadius: 12,
        marginTop: 20
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600'
    }
});
