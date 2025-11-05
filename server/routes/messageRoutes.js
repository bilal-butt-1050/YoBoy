import express from 'express'
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  getConversations,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// all routes protected
router.use(protect)

// send a message
router.post('/', sendMessage)

// get messages for a conversation between two users
router.get('/:userId', getMessages)

// get list of recent conversations (for sidebar)
router.get('/', getConversations)

// mark a message as read
router.patch('/:id/read', markAsRead)

// delete a message (soft delete)
router.delete('/:id', deleteMessage)

export default router
