import Chat from '../models/Chat.js';


// Create or get a DM chat
export const createOrGetDM = async (req, res, next) => {
  try {
    const { userId } = req.body; // other user's ID
    if (!userId) return res.status(400).json({ success: false, message: 'User ID required' });

    // Check if DM already exists
    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [req.user._id, userId] },
    }).populate('members', '-password');

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        members: [req.user._id, userId],
      });
      chat = await chat.populate('members', '-password');
    }

    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// Create a group chat
export const createGroupChat = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body; // memberIds = array of user IDs
    if (!name || !memberIds || memberIds.length < 2)
      return res.status(400).json({ success: false, message: 'Group name and at least 2 members required' });

    const chat = await Chat.create({
      name,
      isGroup: true,
      members: [req.user._id, ...memberIds],
      createdBy: req.user._id,
    });

    await chat.populate('members', '-password');
    res.status(201).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// Get all chats for the current user
export const getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (err) {
    next(err);
  }
};


export const searchChats = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const query = req.query.q?.trim() || '';

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!query) {
      return res.status(200).json({ success: true, chats: [] });
    }

    // Step 1: Find all chats the user is in
    const userChats = await Chat.find({ members: userId })
      .populate('members', 'name username')
      .populate('lastMessage');

    // Step 2: Filter them based on chat name or member name/username
    const regex = new RegExp(`^${query}`, 'i'); // only match from start

    const filteredChats = userChats.filter(chat => {
      if (chat.isGroup) {
        // match group chat name
        return regex.test(chat.name);
      } else {
        // match the *other* member’s name or username
        const otherMember = chat.members.find(
          member => member._id.toString() !== userId.toString()
        );
        return otherMember && (regex.test(otherMember.name) || regex.test(otherMember.username));
      }
    });

    res.status(200).json({ success: true, chats: filteredChats });
  } catch (err) {
    next(err);
  }
};

