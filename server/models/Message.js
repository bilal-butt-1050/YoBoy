import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      // For DMs, this will be another user; for groups, can be null
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    chat: {
      // Reference to the chat (group or DM)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
