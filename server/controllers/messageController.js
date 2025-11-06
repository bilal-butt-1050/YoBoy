// ============================================
// FIXED MESSAGE CONTROLLER
// server/controllers/messageController.js
// ============================================


import Message from '../models/Message.js'
import User from '../models/User.js'

const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('-')
}

// GET /api/messages/:userId
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id
    const conversationId = getConversationId(currentUserId, userId)

    console.log('📥 Loading messages for conversation:', conversationId)

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name username email avatar')
      .populate('receiver', 'name username email avatar')

    console.log(`✅ Found ${messages.length} messages`)

    res.status(200).json({
      conversationId,
      messages,
    })
  } catch (err) {
    console.error('❌ getMessages error:', err)
    res.status(500).json({ message: 'Failed to load messages' })
  }
}

// GET /api/messages
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ])

    if (!conversations.length) {
      return res.status(200).json([])
    }

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const { sender, receiver } = conv.lastMessage
        const otherUserId =
          sender.toString() === userId.toString() ? receiver : sender
        
        const user = await User.findById(otherUserId).select(
          'name username email avatar status'
        )
        
        const lastMessage = await Message.findById(conv.lastMessage._id)
          .populate('sender', 'name username email avatar')
          .populate('receiver', 'name username email avatar')
        
        return { user, lastMessage }
      })
    )

    res.status(200).json(populated)
  } catch (err) {
    console.error('❌ getConversations error:', err)
    res.status(500).json({ message: 'Failed to load conversations' })
  }
}

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', mediaUrl } = req.body
    const senderId = req.user._id

    if (!receiverId || (!content && !mediaUrl)) {
      return res.status(400).json({ message: 'Message content required' })
    }

    const conversationId = getConversationId(senderId, receiverId)

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      mediaUrl,
      conversationId,
    })

    await message.populate([
      { path: 'sender', select: 'name username email avatar' },
      { path: 'receiver', select: 'name username email avatar' }
    ])

    res.status(201).json(message)
  } catch (err) {
    console.error('❌ sendMessage error:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    )
    if (!message) return res.status(404).json({ message: 'Not found' })
    res.status(200).json(message)
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    )
    if (!message) return res.status(404).json({ message: 'Not found' })
    res.status(200).json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' })
  }
}

