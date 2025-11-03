import Message from '../models/Message.js';

// SEND MESSAGE
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content, messageType } = req.body;
    if (!receiver || (messageType === 'text' && !content?.trim()))
      return res.status(400).json({ success: false, message: 'Receiver and message content are required' });

    const message = await Message.create({ sender: req.user._id, receiver, content, messageType });
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// GET CONVERSATIONS (distinct users)
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }], isDeleted: false } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender'] },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] } },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// GET MESSAGES BETWEEN USERS
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
      isDeleted: false,
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// MARK MESSAGE AS READ
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.receiver.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// DELETE MESSAGE
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.sender.toString() !== req.user._id.toString() && message.receiver.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    message.isDeleted = true;
    await message.save();

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET UNREAD COUNT
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false, isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
