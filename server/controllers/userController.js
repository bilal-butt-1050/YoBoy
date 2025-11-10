import User from '../models/User.js';

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// Get single user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Update profile (name, bio, avatar)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// Update online/offline status
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status value' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: Date.now() },
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Search users by name or username
export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || '';

    // If there's no query, return an empty array (optional)
    if (!query) {
      return res.status(200).json({ success: true, users: [] });
    }

    // Regex that matches only names starting with the query
    const regex = new RegExp(`^${query}`, 'i');

    const users = await User.find({
      $or: [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
      ],
    }).select('-password');

    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
