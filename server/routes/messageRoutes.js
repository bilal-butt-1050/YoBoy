import express from 'express';
import { sendMessage, getMessages, markMessageAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);
router.patch('/:messageId/read', protect, markMessageAsRead);

export default router;
