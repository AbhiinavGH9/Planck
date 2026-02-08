const { db } = require('../config/firebase');
const { admin } = require('../config/firebase');

// ... Existing Search & Chat Functions ... (We append new ones at the end usually, but let's keep file structure clean)
// We will replace content carefully.

exports.searchUsers = async (req, res) => {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query) return res.json([]);
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '>=', query)
            .where('username', '<=', query + '\uf8ff')
            .limit(10)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentUserId) {
                users.push({ id: doc.id, ...doc.data() });
            }
        });

        res.json(users);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
};

exports.createChat = async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const chatsRef = db.collection('chats');
        const snapshot = await chatsRef.where('participants', 'array-contains', currentUserId).get();

        let existingChat = null;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.participants.includes(targetUserId) && data.participants.length === 2) {
                existingChat = { id: doc.id, ...data };
            }
        });

        if (existingChat) return res.json(existingChat);

        const newChat = {
            participants: [currentUserId, targetUserId],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: null,
            unreadCounts: { [currentUserId]: 0, [targetUserId]: 0 }
        };

        const docRef = await chatsRef.add(newChat);
        res.json({ id: docRef.id, ...newChat });

    } catch (error) {
        console.error("Create Chat Error:", error);
        res.status(500).json({ error: "Failed to create chat" });
    }
};

exports.getChats = async (req, res) => {
    const currentUserId = req.user.id;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const chatsRef = db.collection('chats');
        const snapshot = await chatsRef.where('participants', 'array-contains', currentUserId).get();

        const chats = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const otherUserId = data.participants.find(p => p !== currentUserId);
            const userDoc = await db.collection('users').doc(otherUserId).get();
            const otherUser = userDoc.exists ? userDoc.data() : { username: 'Unknown' };

            chats.push({
                id: doc.id,
                ...data,
                otherUser: {
                    id: otherUserId,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    isOnline: otherUser.isOnline || false
                }
            });
        }

        // Sort in memory (Updated At descending)
        chats.sort((a, b) => {
            const timeA = new Date(a.updatedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || 0).getTime();
            return timeB - timeA;
        });

        res.json(chats);

    } catch (error) {
        console.error("Get Chats Error:", error);
        res.status(500).json({ error: "Failed to fetch chats" });
    }
};

exports.deleteMessage = async (req, res) => {
    const { chatId, messageId } = req.params;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();
        if (!chatDoc.exists) return res.status(404).json({ error: "Chat not found" });

        const chatData = chatDoc.data();
        const messageRef = chatRef.collection('messages').doc(messageId);
        const messageDoc = await messageRef.get();
        if (!messageDoc.exists) return res.status(404).json({ error: "Message not found" });

        const messageData = messageDoc.data();
        let isLastMessage = false;

        if (chatData.lastMessage) {
            if (chatData.lastMessage.id === messageId) {
                isLastMessage = true;
            } else if (!chatData.lastMessage.id) {
                // Legacy check
                const cacheTime = new Date(chatData.lastMessage.timestamp).getTime();
                const msgTime = messageData.timestamp ? messageData.timestamp.toDate().getTime() : 0;
                if (chatData.lastMessage.text === messageData.text && Math.abs(cacheTime - msgTime) < 1000) {
                    isLastMessage = true;
                }
            }
        }

        await messageRef.delete();

        if (isLastMessage) {
            const messagesSnap = await chatRef.collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();

            let newLastMessage = null;
            if (!messagesSnap.empty) {
                const doc = messagesSnap.docs[0];
                const d = doc.data();
                newLastMessage = {
                    id: doc.id,
                    text: d.text,
                    timestamp: d.timestamp ? d.timestamp.toDate().toISOString() : new Date().toISOString(),
                    read: d.read || false,
                    senderId: d.senderId
                };
            }

            await chatRef.update({
                lastMessage: newLastMessage,
                updatedAt: newLastMessage ? new Date(newLastMessage.timestamp) : admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Cleanup Starred Messages for ALL participants
        // Use Promise.all to do it in parallel
        const cleanupPromises = chatData.participants.map(pId =>
            db.collection('users').doc(pId).collection('starred_messages').doc(messageId).delete()
        );
        await Promise.all(cleanupPromises);

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({ error: "Failed to delete message" });
    }
};

exports.clearChat = async (req, res) => {
    const { chatId } = req.params;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const messagesRef = db.collection('chats').doc(chatId).collection('messages');
        const snapshot = await messagesRef.get();

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await db.collection('chats').doc(chatId).update({
            lastMessage: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Clear Chat Error:", error);
        res.status(500).json({ error: "Failed to clear chat" });
    }
};

exports.getMessages = async (req, res) => {
    const { chatId } = req.params;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const messagesRef = db.collection('chats').doc(chatId).collection('messages');
        const snapshot = await messagesRef.limit(50).get();

        const messages = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            });
        });

        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { avatar, isOnline } = req.body;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const userRef = db.collection('users').doc(userId);
        const updates = {};
        if (avatar !== undefined) updates.avatar = avatar;
        if (isOnline !== undefined) updates.isOnline = isOnline;
        if (req.body.bio !== undefined) updates.bio = req.body.bio;

        await userRef.update(updates);
        res.json({ success: true, ...updates });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

// --- NEW POWER FEATURES ---

// Toggle Chat Settings (Pin, Archive, Mute)
// Endpoint: POST /user/chat/:chatId/setting
// Body: { setting: 'isPinned' | 'isArchived' | 'isMuted', value: boolean }
exports.toggleChatSetting = async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { setting, value } = req.body;

    if (!['isPinned', 'isArchived', 'isMuted'].includes(setting)) {
        return res.status(400).json({ error: "Invalid setting" });
    }

    try {
        const settingsRef = db.collection('users').doc(userId).collection('chat_settings').doc(chatId);

        // Use set with merge to create if not exists
        await settingsRef.set({
            [setting]: value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true, [setting]: value });
    } catch (error) {
        console.error("Toggle Setting Error:", error);
        res.status(500).json({ error: "Failed to update setting" });
    }
};

// Get All Chat Settings
// Endpoint: GET /user/chat-settings
exports.getChatSettings = async (req, res) => {
    const userId = req.user.id;
    try {
        const settingsRef = db.collection('users').doc(userId).collection('chat_settings');
        const snapshot = await settingsRef.get();

        const settings = {};
        snapshot.forEach(doc => {
            settings[doc.id] = doc.data();
        });

        res.json(settings);
    } catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

// Star Message
// Endpoint: POST /user/message/:messageId/star
// Body: { chatId, messageData }
exports.starMessage = async (req, res) => {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { chatId, messageData } = req.body;

    try {
        const starRef = db.collection('users').doc(userId).collection('starred_messages').doc(messageId);
        const doc = await starRef.get();

        if (doc.exists) {
            // Unstar
            await starRef.delete();
            res.json({ starred: false });
        } else {
            // Star
            await starRef.set({
                chatId,
                message: messageData,
                starredAt: admin.firestore.FieldValue.serverTimestamp()
            });
            res.json({ starred: true });
        }
    } catch (error) {
        console.error("Star Message Error:", error);
        res.status(500).json({ error: "Failed to star message" });
    }
};

// Get Starred Messages
// Endpoint: GET /user/starred
exports.getStarredMessages = async (req, res) => {
    const userId = req.user.id;
    try {
        const starsRef = db.collection('users').doc(userId).collection('starred_messages')
            .orderBy('starredAt', 'desc');
        const snapshot = await starsRef.get();

        const starred = [];
        snapshot.forEach(doc => {
            starred.push({ id: doc.id, ...doc.data() });
        });

        res.json(starred);
    } catch (error) {
        console.error("Get Starred Error:", error);
        res.status(500).json({ error: "Failed to fetch starred messages" });
    }
};

// --- BLOCKING FEATURES ---

// Get Blocked Users
// Endpoint: GET /user/blocked
exports.getBlockedUsers = async (req, res) => {
    const userId = req.user.id;
    if (!db) return res.status(500).json({ error: "DB Error" });

    try {
        const blockedRef = db.collection('users').doc(userId).collection('blocked_users');
        const snapshot = await blockedRef.get();

        const blockedUsers = [];
        for (const doc of snapshot.docs) {
            const blockedId = doc.id;
            // Fetch user details for display
            const userDoc = await db.collection('users').doc(blockedId).get();
            if (userDoc.exists) {
                blockedUsers.push({ id: blockedId, ...userDoc.data() });
            } else {
                blockedUsers.push({ id: blockedId, username: 'Unknown User' });
            }
        }

        res.json(blockedUsers);
    } catch (error) {
        console.error("Get Blocked Error:", error);
        res.status(500).json({ error: "Failed to fetch blocked users" });
    }
};

// Block User
// Endpoint: POST /user/block
// Body: { userId }
exports.blockUser = async (req, res) => {
    const currentUserId = req.user.id;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "No userId provided" });
    if (userId === currentUserId) return res.status(400).json({ error: "Cannot block yourself" });

    try {
        await db.collection('users').doc(currentUserId)
            .collection('blocked_users').doc(userId).set({
                blockedAt: admin.firestore.FieldValue.serverTimestamp()
            });

        res.json({ success: true, blocked: true });
    } catch (error) {
        console.error("Block Error:", error);
        res.status(500).json({ error: "Failed to block user" });
    }
};

// Unblock User
// Endpoint: POST /user/unblock
// Body: { userId }
exports.unblockUser = async (req, res) => {
    const currentUserId = req.user.id;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "No userId provided" });

    try {
        await db.collection('users').doc(currentUserId)
            .collection('blocked_users').doc(userId).delete();

        res.json({ success: true, blocked: false });
    } catch (error) {
        console.error("Unblock Error:", error);
        res.status(500).json({ error: "Failed to unblock user" });
    }
};

exports.editMessage = async (req, res) => {
    const { chatId, messageId } = req.params;
    const { newText } = req.body;
    try {
        await db.collection('chats').doc(chatId).collection('messages').doc(messageId).update({
            text: newText,
            isEdited: true
        });
        res.json({ success: true });
    } catch (e) {
        console.error("Edit Message Error:", e);
        res.status(500).json({ error: "Edit failed" });
    }
};

exports.markChatAsRead = async (req, res) => {
    // Logic to reset unread count
    res.json({ success: true });
};
