const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware, userController.searchUsers);
router.post('/chat', authMiddleware, userController.createChat);
router.get('/chats', authMiddleware, userController.getChats);
router.get('/messages/:chatId', authMiddleware, userController.getMessages);
router.delete('/chat/:chatId/message/:messageId', authMiddleware, userController.deleteMessage);
router.delete('/chat/:chatId/clear', authMiddleware, userController.clearChat);
router.put('/update', authMiddleware, userController.updateProfile);

// Power Features
router.post('/chat/:chatId/setting', authMiddleware, userController.toggleChatSetting); // { setting, value }
router.get('/chat-settings', authMiddleware, userController.getChatSettings);
router.post('/message/:messageId/star', authMiddleware, userController.starMessage);
router.get('/starred', authMiddleware, userController.getStarredMessages);

// Blocking
router.get('/blocked', authMiddleware, userController.getBlockedUsers);
router.post('/block', authMiddleware, userController.blockUser);
router.post('/chat/:chatId/message/:messageId/edit', authMiddleware, userController.editMessage);
router.post('/chat/:chatId/mark-read', authMiddleware, userController.markChatAsRead);

module.exports = router;
