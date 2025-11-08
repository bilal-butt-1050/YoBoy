'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import './chatWindow.css'

export default function ChatWindow({ activeChat, messages, onSendMessage, sending, currentUser }) {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!messageText.trim() || sending) return

    onSendMessage(messageText)
    setMessageText('')
  }

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??'

  const getOtherUser = () => {
    if (!activeChat?.members || activeChat.isGroup) return null
    return activeChat.members.find((m) => m._id !== currentUser?._id)
  }

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Empty state
  if (!activeChat) {
    return (
      <div className="chat-window-empty">
        <div className="empty-chat-state">
          <div className="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </div>
      </div>
    )
  }

  const otherUser = getOtherUser()
  const chatName = activeChat.isGroup
    ? activeChat.name || 'Group Chat'
    : otherUser?.name || 'Unknown User'
  const chatAvatar = activeChat.isGroup
    ? activeChat.name?.[0]?.toUpperCase() || 'G'
    : otherUser?.avatar || getUserInitials(otherUser?.name)
  const isOnline = !activeChat.isGroup && otherUser?.status === 'online'

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {typeof chatAvatar === 'string' && chatAvatar.startsWith('http') ? (
              <img src={chatAvatar} alt={chatName} />
            ) : (
              chatAvatar
            )}
            {isOnline && <div className="online-dot" />}
          </div>
          <div>
            <h3>{chatName}</h3>
            <p className="user-status">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>

        <div className="chat-actions">
          <button className="action-btn" title="Voice Call">
            <Phone size={20} />
          </button>
          <button className="action-btn" title="Video Call">
            <Video size={20} />
          </button>
          <button className="action-btn" title="More Options">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.sender?._id === currentUser?._id
            const senderName = isSent ? 'You' : msg.sender?.name || 'Unknown'
            const senderInitials = getUserInitials(senderName)

            return (
              <div key={msg._id} className={`message ${isSent ? 'sent' : 'received'}`}>
                {!isSent && (
                  <div className="message-avatar">
                    {msg.sender?.avatar ? (
                      <img src={msg.sender.avatar} alt={senderName} />
                    ) : (
                      senderInitials
                    )}
                  </div>
                )}

                <div className="message-content">
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                  </div>
                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                    {isSent && msg.isRead && <span className="read-indicator"> ✓✓</span>}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="message-input-container" onSubmit={handleSubmit}>
        <button type="button" className="input-action-btn" title="Attach File">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="message-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sending}
        />
        <button type="button" className="input-action-btn" title="Add Emoji">
          <Smile size={20} />
        </button>
        <button type="submit" className="send-btn" disabled={sending || !messageText.trim()}>
          {sending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}