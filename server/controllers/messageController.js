import Message from '../models/Message.js'
import User from '../models/User.js'

// helper to create deterministic conversationId
const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('-')
}

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, mediaUrl } = req.body
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

    // Emit via Socket.IO if you use it
    if (req.io) {
      req.io.to(conversationId).emit('newMessage', message)
    }

    res.status(201).json(message)
  } catch (err) {
    console.error('sendMessage error:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
}

// GET /api/messages/:userId
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id
    const conversationId = getConversationId(currentUserId, userId)

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate('sender receiver', 'name username email profilePic')

    // handle empty conversation
    if (!messages.length) {
      const otherUser = await User.findById(userId).select(
        'name username email profilePic'
      )
      return res.status(200).json({
        conversationId,
        messages: [],
        otherUser,
        newConversation: true,
      })
    }

    res.status(200).json({
      conversationId,
      messages,
      newConversation: false,
    })
  } catch (err) {
    console.error('getMessages error:', err)
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
      return res.status(200).json([]) // return empty array safely
    }

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const { sender, receiver, lastMessage } = conv.lastMessage
        const otherUserId =
          sender.toString() === userId.toString() ? receiver : sender
        const user = await User.findById(otherUserId).select(
          'name username email profilePic'
        )
        return { user, lastMessage }
      })
    )

    res.status(200).json(populated)
  } catch (err) {
    console.error('getConversations error:', err)
    res.status(500).json({ message: 'Failed to load conversations' })
  }
}

// PATCH /api/messages/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!message) return res.status(404).json({ message: 'Message not found' })

    res.status(200).json(message)
  } catch (err) {
    console.error('markAsRead error:', err)
    res.status(500).json({ message: 'Failed to mark message as read' })
  }
}

// DELETE /api/messages/:id
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params

    const message = await Message.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    )

    if (!message) return res.status(404).json({ message: 'Message not found' })

    res.status(200).json({ message: 'Message deleted successfully' })
  } catch (err) {
    console.error('deleteMessage error:', err)
    res.status(500).json({ message: 'Failed to delete message' })
  }
}
