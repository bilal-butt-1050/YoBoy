import mongoose from 'mongoose'

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

    // text or media message content
    content: {
      type: String,
      trim: true,
      default: '',
    },

    // optional file/image URL for media
    mediaUrl: {
      type: String,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },

    // conversation grouping field (deterministic for any two users)
    conversationId: {
      type: String,
      required: true,
      index: true,
    },

    // delivery state
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // deletion flags (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// Automatically set conversationId (sorted user IDs)
messageSchema.pre('validate', function (next) {
  if (!this.conversationId && this.sender && this.receiver) {
    const sorted = [this.sender.toString(), this.receiver.toString()].sort()
    this.conversationId = `${sorted[0]}-${sorted[1]}`
  }
  next()
})

// Handle deletion timestamp
messageSchema.pre('save', function (next) {
  if (this.isDeleted && !this.deletedAt) this.deletedAt = new Date()
  if (!this.isDeleted) this.deletedAt = undefined
  next()
})

// Fast queries for inboxes and recent messages
messageSchema.index({ conversationId: 1, createdAt: -1 })
messageSchema.index({ receiver: 1, isRead: 1 })

const Message = mongoose.model('Message', messageSchema)
export default Message
