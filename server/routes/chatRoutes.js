import express from 'express';
import { createOrGetDM, createGroupChat, getUserChats } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/dm', protect, createOrGetDM);
router.post('/group', protect, createGroupChat);
router.get('/', protect, getUserChats);

export default router;