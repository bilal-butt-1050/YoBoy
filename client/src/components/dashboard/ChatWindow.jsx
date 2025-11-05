'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import './chatWindow.css'

export default function ChatWindow({
  selectedChat,
  currentUser,
  messages = [],
  onSendMessage,
  messagesEndRef,
  startTyping,
  stopTyping,
  isTyping,
  markAsRead,
  sending,
}) {
  const [input, setInput] = useState('')

  const safeMessages = Array.isArray(messages) ? messages : []

  const getUserInitials = (name) =>
    (name || '')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  // reset input when conversation changes
  useEffect(() => setInput(''), [selectedChat?.id, selectedChat?._id])

  // scroll to bottom
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [safeMessages.length, isTyping])

  // mark unread messages as read
  useEffect(() => {
    if (!currentUser || !selectedChat) return
    safeMessages.forEach((m) => {
      const receiverId = m.receiver?._id?.toString() || m.receiver?.toString()
      if (receiverId === (currentUser._id || currentUser.id)?.toString() && !m.isRead) {
        markAsRead?.(m._id)
      }
    })
  }, [safeMessages, currentUser, selectedChat, markAsRead])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !selectedChat) return
    await onSendMessage(trimmed)
    setInput('')
    stopTyping?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
      return
    }
    startTyping?.()
  }

  if (!selectedChat) {
    return (
      <div className="chat-window-empty">
        <h3>Select a conversation</h3>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedChat.avatar ? <img src={selectedChat.avatar} alt={selectedChat.name} /> : getUserInitials(selectedChat.name)}
            {selectedChat.status === 'online' && <div className="online-dot" />}
          </div>
          <div>
            <h3>{selectedChat.name}</h3>
            <p>{selectedChat.status === 'online' ? 'Active now' : 'Offline'}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn"><Phone size={20} /></button>
          <button className="action-btn"><Video size={20} /></button>
          <button className="action-btn"><MoreVertical size={20} /></button>
        </div>
      </div>

      <div className="messages-container">
        {safeMessages.length === 0 ? (
          <p className="text-gray-400">No messages yet.</p>
        ) : (
          safeMessages.map((msg) => {
            const senderId = msg.sender?._id?.toString() || msg.sender?.toString()
            const isOwn = senderId === (currentUser._id || currentUser.id)?.toString()
            return (
              <div key={msg._id} className={`message ${isOwn ? 'sent' : 'received'}`}>
                {!isOwn && <div className="message-avatar">{getUserInitials(selectedChat.name)}</div>}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                  </div>
                  <span className="message-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {isOwn && msg.isRead && <span className="read-indicator"> ✓✓</span>}
                  </span>
                </div>
              </div>
            )
          })
        )}
        {isTyping && <div className="typing-indicator">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSubmit}>
        <button type="button" className="input-action-btn"><Paperclip size={20} /></button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          className="message-input"
        />
        <button type="button" className="input-action-btn"><Smile size={20} /></button>
        <button type="submit" className="send-btn" disabled={!input?.trim() || sending}>
          {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}
