import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content, messageType, attachments } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver and content',
      });
    }

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
    });

    // Populate sender and receiver
    await message.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'receiver', select: 'name email avatar' },
    ]);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
      isDeleted: false,
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender',
            },
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          'user.password': 0,
          'user.resetPasswordToken': 0,
          'user.resetPasswordExpire': 0,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read',
      });
    }

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    message.isDeleted = true;
    message.deletedAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};