import User from '../models/User.js';

// GET ALL USERS
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -verificationToken -resetPasswordToken');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verificationToken -resetPasswordToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// SEARCH USERS BY NAME OR USERNAME
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter is required' });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
    }).select('-password -verificationToken -resetPasswordToken');

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER STATUS
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'away', 'busy'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status value' });

    const user = await User.findByIdAndUpdate(req.user._id, { status, lastSeen: Date.now() }, { new: true });
    res.status(200).json({ success: true, message: `Status updated to ${status}`, user });
  } catch (error) {
    next(error);
  }
};
