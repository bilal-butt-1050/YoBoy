import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (this.messageType === 'text') return !!val?.trim();
          return true;
        },
        message: 'Text messages cannot be empty',
      },
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.pre('save', function (next) {
  if (this.isDeleted && !this.deletedAt) this.deletedAt = new Date();
  if (!this.isDeleted) this.deletedAt = undefined;
  next();
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 }, { partialFilterExpression: { isDeleted: false } });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
