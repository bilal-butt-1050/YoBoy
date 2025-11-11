import User from '../models/User.js';
import cloudinary from 'cloudinary'


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



// === Cloudinary setup ===
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, username, email, bio, avatar } = req.body

    // Find current user first
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    let avatarUrl = user.avatar

    // If avatar is provided as a new base64 string
    if (avatar && avatar !== user.avatar) {
      // Delete old one if exists
      if (user.avatarPublicId) {
        try {
          await cloudinary.v2.uploader.destroy(user.avatarPublicId)
        } catch (err) {
          console.error('Error deleting old Cloudinary image:', err)
        }
      }

      // Upload new avatar
      const uploadRes = await cloudinary.v2.uploader.upload(avatar, {
        folder: 'avatars',
        resource_type: 'image',
      })

      avatarUrl = uploadRes.secure_url
      user.avatarPublicId = uploadRes.public_id
    }

    // Username uniqueness
    if (username) {
      const exists = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: userId },
      })
      if (exists) return res.status(400).json({ message: 'Username already taken' })
    }

    // Email uniqueness
    if (email) {
      const exists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      })
      if (exists) return res.status(400).json({ message: 'Email already in use' })
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(username && { username: username.toLowerCase() }),
        ...(email && { email: email.toLowerCase() }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(user.avatarPublicId && { avatarPublicId: user.avatarPublicId }),
      },
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ user: updatedUser })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ message: 'Server error while updating profile' })
  }
}
