import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { useThemeColors, useThemeStore } from '../stores/useThemeStore';
import { Colors } from '../constants/Colors';
import { X, UserCircle, Share, Trash2, Ban, Moon, LogOut, Camera, Mail, Pin, Archive, VolumeX, Star, ArchiveRestore, CheckCheck, Unlock } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { SERVER_URL } from '../services/api';
import EditBioModal from './EditBioModal';
import ForwardModal from './ForwardModal';
import ConfirmationModal from './ConfirmationModal';
import StarredMessagesModal from './StarredMessagesModal';

interface ProfileModalProps {
    visible: boolean;
    user: any;
    onClose: () => void;
    chatId?: string; // Optional, for clearing chat & settings
    onClearChat?: () => void;
}

export default function ProfileModal({ visible, user, onClose, chatId, onClearChat }: ProfileModalProps) {
    const { user: authUser, logout, updateUser } = useAuthStore();
    const { chatSettings, toggleChatSetting, blockedUsers, blockUser, unblockUser } = useChatStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const colors = useThemeColors();

    const isMe = authUser && user && authUser.id === user.id;
    const displayUser = isMe ? authUser : user;

    const isBlocked = !isMe && user ? blockedUsers?.includes(user.id) : false;

    const handleBlockToggle = () => {
        if (!user) return;
        if (isBlocked) {
            unblockUser(user.id);
        } else {
            blockUser(user.id);
        }
    };

    const [editBioVisible, setEditBioVisible] = useState(false);
    const [shareContactVisible, setShareContactVisible] = useState(false);
    const [starredVisible, setStarredVisible] = useState(false);
    const [confirmClearVisible, setConfirmClearVisible] = useState(false);

    if (!displayUser) return null;

    const handleImagePick = async () => {
        if (!isMe) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            const formData = new FormData();
            // @ts-ignore
            formData.append('image', {
                uri,
                name: 'profile_update.jpg',
                type: 'image/jpeg',
            });

            try {
                const res = await fetch(`${SERVER_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    await updateUser({ avatar: data.url });
                }
            } catch (error) {
                console.error("Upload failed", error);
            }
        }
    };

    const handleClearChatRequest = () => {
        setConfirmClearVisible(true);
    };

    const performClearChat = async () => {
        if (chatId) {
            try {
                if (onClearChat) onClearChat();
                else {
                    const { clearChat } = useChatStore.getState();
                    clearChat(chatId);
                }
                setConfirmClearVisible(false);
                onClose();
            } catch (e) {
                console.error("Failed to clear chat", e);
            }
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

                <View style={[styles.card, {
                    backgroundColor: colors.background === '#000000' ? '#1C1C1E' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: colors.border
                }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleImagePick} disabled={!isMe}>
                        <Image
                            source={{ uri: displayUser.avatar || 'https://i.pravatar.cc/300' }}
                            style={styles.avatar}
                        />
                        {isMe && (
                            <View style={styles.editIconContainer}>
                                <Camera size={14} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.name, { color: colors.text }]}>{displayUser.username}</Text>

                    <TouchableOpacity onPress={() => isMe && setEditBioVisible(true)} disabled={!isMe}>
                        <Text style={[styles.bio, { color: colors.textSecondary, fontStyle: displayUser.bio ? 'normal' : 'italic' }]}>
                            "{displayUser.bio || (isMe ? 'Add a bio...' : 'No bio available')}"
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Mail size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.infoText, { color: colors.text }]}>{displayUser.email || 'No email'}</Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        {isMe ? (
                            <>
                                <View style={styles.actionRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Moon size={20} color={colors.text} style={{ marginRight: 10 }} />
                                        <Text style={{ color: colors.text }}>Dark Mode</Text>
                                    </View>
                                    <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: '#767577', true: '#1DAB61' }} />
                                </View>
                                <TouchableOpacity style={styles.actionRow} onPress={logout}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <LogOut size={20} color={Colors.danger} style={{ marginRight: 10 }} />
                                        <Text style={{ color: Colors.danger }}>Log Out</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.actionRow} onPress={() => setShareContactVisible(true)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Share size={20} color={colors.blue} style={{ marginRight: 10 }} />
                                        <Text style={{ color: colors.blue }}>Share Contact</Text>
                                    </View>
                                </TouchableOpacity>

                                {chatId && (
                                    <>
                                        <TouchableOpacity style={styles.actionRow} onPress={() => toggleChatSetting(chatId, 'isPinned', !chatSettings[chatId]?.isPinned)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Pin size={20} color={colors.text} style={{ marginRight: 10 }} />
                                                <Text style={{ color: colors.text }}>{chatSettings[chatId]?.isPinned ? 'Unpin Chat' : 'Pin Chat'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRow} onPress={() => toggleChatSetting(chatId, 'isArchived', !chatSettings[chatId]?.isArchived)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {chatSettings[chatId]?.isArchived ? (
                                                    <ArchiveRestore size={20} color={colors.text} style={{ marginRight: 10 }} />
                                                ) : (
                                                    <Archive size={20} color={colors.text} style={{ marginRight: 10 }} />
                                                )}
                                                <Text style={{ color: colors.text }}>{chatSettings[chatId]?.isArchived ? 'Unarchive Chat' : 'Archive Chat'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRow} onPress={() => toggleChatSetting(chatId, 'isMuted', !chatSettings[chatId]?.isMuted)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <VolumeX size={20} color={colors.text} style={{ marginRight: 10 }} />
                                                <Text style={{ color: colors.text }}>{chatSettings[chatId]?.isMuted ? 'Unmute Chat' : 'Mute Notifications'}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionRow} onPress={() => {
                                            // Mark Read Logic - stubbed for now or call simple API
                                            // toggleChatSetting(chatId, 'isRead', true)? 
                                            // Assuming simple effect:
                                            // alert("Marked as read"); 
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <CheckCheck size={20} color={colors.text} style={{ marginRight: 10 }} />
                                                <Text style={{ color: colors.text }}>Mark as read</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionRow} onPress={() => setStarredVisible(true)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Star size={20} color={Colors.trafficYellow} fill={Colors.trafficYellow} style={{ marginRight: 10 }} />
                                                <Text style={{ color: colors.text }}>Starred Messages</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity style={styles.actionRow} onPress={handleBlockToggle}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {isBlocked ? (
                                            <>
                                                <Unlock size={20} color={colors.blue} style={{ marginRight: 10 }} />
                                                <Text style={{ color: colors.blue }}>Unblock User</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Ban size={20} color={Colors.danger} style={{ marginRight: 10 }} />
                                                <Text style={{ color: Colors.danger }}>Block User</Text>
                                            </>
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {chatId && (
                                    <TouchableOpacity style={styles.actionRow} onPress={handleClearChatRequest}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Trash2 size={20} color={Colors.danger} style={{ marginRight: 10 }} />
                                            <Text style={{ color: Colors.danger }}>Delete Chat</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Sub-Modals */}
                <ConfirmationModal
                    visible={confirmClearVisible}
                    title="Delete Chat?"
                    message="Are you sure you want to delete this chat? All messages will be permanently removed."
                    confirmText="Delete"
                    isDanger={true}
                    onConfirm={performClearChat}
                    onCancel={() => setConfirmClearVisible(false)}
                />

                <EditBioModal
                    visible={editBioVisible}
                    currentBio={displayUser.bio}
                    onClose={() => setEditBioVisible(false)}
                />

                <ForwardModal
                    visible={shareContactVisible}
                    onClose={() => setShareContactVisible(false)}
                    onForward={(selectedChatIds) => {
                        const { sendMessage } = useChatStore.getState();
                        const contactContent = JSON.stringify({
                            id: displayUser.id,
                            username: displayUser.username,
                            avatar: displayUser.avatar,
                            email: displayUser.email,
                            bio: displayUser.bio
                        });

                        selectedChatIds.forEach(targetChatId => {
                            // @ts-ignore
                            sendMessage(targetChatId, contactContent, authUser!.id, 'contact');
                        });

                        Alert.alert("Sent", "Contact shared successfully");
                        setShareContactVisible(false);
                    }}
                />

                {chatId && (
                    <StarredMessagesModal
                        visible={starredVisible}
                        onClose={() => setStarredVisible(false)}
                        navigation={null}
                        chatIdFilter={chatId}
                    />
                )}
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
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(128,128,128,0.1)'
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 12,
        right: 0,
        backgroundColor: '#007AFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
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
    actionsContainer: {
        width: '100%',
        gap: 16
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(128,128,128,0.1)'
    }
});
