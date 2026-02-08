import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';
import { X, UserPlus, CheckCircle } from 'lucide-react-native';
import api from '../services/api';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function AdminPanelModal({ visible, onClose }: Props) {
    const colors = useThemeColors();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateUser = async () => {
        if (!username || !password || !email) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            // Assuming this endpoint exists or similar
            const res = await api.post('/auth/register', { username, email, password });
            Alert.alert("Success", "User created successfully!");
            setUsername('');
            setPassword('');
            setEmail('');
        } catch (error: any) {
            console.error("Create user error", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to create user");
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
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[styles.card, { backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF', borderColor: colors.border }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>Add New User (Restricted)</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: 'rgba(128,128,128,0.05)' }]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="username"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: 'rgba(128,128,128,0.05)' }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            placeholderTextColor={colors.textSecondary}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: 'rgba(128,128,128,0.05)' }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="password"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: colors.blue, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleCreateUser}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : (
                            <>
                                <UserPlus size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Create User</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
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
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 16
    },
    submitBtn: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
