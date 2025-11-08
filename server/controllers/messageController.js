import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// Send a message
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content, messageType } = req.body;
    if (!chatId || !content) return res.status(400).json({ success: false, message: 'Chat ID and content required' });

    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      content,
      messageType: messageType || 'text',
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    await message.populate('sender', '-password');
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// Get all messages for a chat
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', '-password')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};
