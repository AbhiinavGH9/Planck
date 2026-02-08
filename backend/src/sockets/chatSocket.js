const { db, admin } = require('../config/firebase');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('⚡ User Connected:', socket.id);

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        socket.on('leave_chat', (chatId) => {
            socket.leave(chatId);
        });

        socket.on('send_message', async (data) => {
            const { chatId, senderId, text, type, mediaUrl, otherUserId, replyTo, isForwarded } = data;

            console.log("📩 New Message:", data);

            if (!db) return;

            try {
                // 1. Save to Messages Collection
                const messageData = {
                    text: text || '',
                    senderId,
                    type: type || 'text',
                    mediaUrl: mediaUrl || null,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    readBy: [senderId],
                    starredBy: [],
                    replyTo: replyTo || null, // { id, text, senderName }
                    replyTo: replyTo || null, // { id, text, senderName }
                    isForwarded: isForwarded || false,
                    reactions: {}
                };

                const chatRef = db.collection('chats').doc(chatId);
                const messagesRef = chatRef.collection('messages');

                const msgDoc = await messagesRef.add(messageData);

                // 2. Update Chat Metadata (Last Message)
                await chatRef.update({
                    lastMessage: {
                        id: msgDoc.id, // Critical for delete logic
                        text: type === 'image' ? '📷 Image' : text,
                        senderId,
                        timestamp: new Date(),
                        read: false
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 3. Emit to Room (Real-time update)
                // We send the ID and the timestamp as ISO string for the client to parse immediately
                io.to(chatId).emit('receive_message', {
                    id: msgDoc.id,
                    ...messageData,
                    timestamp: new Date().toISOString()
                });

                // 4. Notify Chat List update (for both users, if they are online/connected)
                // This might require users to join a "personal room" on login.
                // Assuming client joins `user_${userId}` on login.
                io.to(`user_${otherUserId}`).emit('chat_updated', {
                    chatId,
                    lastMessage: {
                        text: type === 'image' ? '📷 Image' : text,
                        senderId,
                        timestamp: new Date().toISOString(),
                        read: false
                    }
                });
                io.to(`user_${senderId}`).emit('chat_updated', {
                    chatId,
                    lastMessage: {
                        text: type === 'image' ? '📷 Image' : text,
                        senderId,
                        timestamp: new Date().toISOString(),
                        read: false
                    }
                });

            } catch (error) {
                console.error("Socket Message Error:", error);
            }
        });

        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined user room user_${userId}`);
        });

        socket.on('typing', ({ chatId, userId }) => {
            socket.to(chatId).emit('display_typing', { userId });
        });

        socket.on('toggle_reaction', async ({ chatId, messageId, userId, emoji }) => {
            if (!db) return;

            try {
                const messageRef = db.collection('chats').doc(chatId).collection('messages').doc(messageId);

                await db.runTransaction(async (t) => {
                    const doc = await t.get(messageRef);
                    if (!doc.exists) return;

                    const data = doc.data();
                    const reactions = data.reactions || {};
                    const userList = reactions[emoji] || [];

                    let newReactions = { ...reactions };

                    if (userList.includes(userId)) {
                        // Remove reaction
                        newReactions[emoji] = userList.filter(id => id !== userId);
                        if (newReactions[emoji].length === 0) {
                            delete newReactions[emoji];
                        }
                    } else {
                        // Add reaction
                        // Optimization: Limit number of reactions per user interaction? 
                        // For now allow multiple. 
                        newReactions[emoji] = [...userList, userId];
                    }

                    t.update(messageRef, { reactions: newReactions });

                    // Emit update
                    io.to(chatId).emit('message_reaction_update', {
                        chatId,
                        messageId,
                        reactions: newReactions
                    });
                });
            } catch (error) {
                console.error("Reaction Error:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected:', socket.id);
        });
    });
};
