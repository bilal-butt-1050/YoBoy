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

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Query is required' })
    }

    // Match only names or usernames that START with the search term
    const users = await User.find({
      $or: [
        { name: { $regex: `^${q}`, $options: 'i' } },
        { username: { $regex: `^${q}`, $options: 'i' } },
      ],
    }).select('-password')

    res.json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}


// controllers/userController.js


export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      })
    }

    // Update DB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: Date.now() },
      { new: true }
    ).select('_id username status lastSeen')

    // 🔥 Emit to all connected clients via Socket.IO
    const io = req.app.get('io') // get the socket.io instance you attached in server.js
    io.emit('user:status', {
      userId: user._id,
      status: user.status,
      lastSeen: user.lastSeen
    })

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      user
    })
  } catch (error) {
    next(error)
  }
}
