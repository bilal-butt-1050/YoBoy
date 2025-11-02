import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/:userId', getMessages);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;