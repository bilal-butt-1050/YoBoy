// routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import messageRoutes from './messageRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

// Mount all routes here
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/chats', chatRoutes);


export default router;