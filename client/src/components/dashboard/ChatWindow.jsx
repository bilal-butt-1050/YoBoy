'use client'

import { useState } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react'
import './chatWindow.css'

export default function ChatWindow({ selectedChat, currentUser }) {
  const [message, setMessage] = useState('')

  // Mock messages - will be replaced with actual data from backend
  const messages = selectedChat ? [
    {
      id: '1',
      senderId: selectedChat.id,
      text: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      isSent: false
    },
    {
      id: '2',
      senderId: currentUser.id,
      text: 'Hi! I\'m doing great, thanks for asking!',
      timestamp: '10:32 AM',
      isSent: true
    },
    {
      id: '3',
      senderId: selectedChat.id,
      text: 'That\'s awesome! Do you have time to discuss the project?',
      timestamp: '10:33 AM',
      isSent: false
    },
    {
      id: '4',
      senderId: currentUser.id,
      text: 'Sure! I\'m free right now. What would you like to discuss?',
      timestamp: '10:35 AM',
      isSent: true
    },
  ] : []

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim()) {
      console.log('Sending message:', message)
      // Backend logic will be added here
      setMessage('')
    }
  }

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!selectedChat) {
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

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedChat.avatar ? (
              <img src={selectedChat.avatar} alt={selectedChat.name} />
            ) : (
              getUserInitials(selectedChat.name)
            )}
            {selectedChat.online && <div className="online-dot" />}
          </div>
          <div>
            <h3>{selectedChat.name}</h3>
            <p className="user-status">
              {selectedChat.online ? 'Active now' : 'Offline'}
            </p>
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

      <div className="messages-container">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.isSent ? 'sent' : 'received'}`}
          >
            {!msg.isSent && (
              <div className="message-avatar">
                {selectedChat.avatar ? (
                  <img src={selectedChat.avatar} alt={selectedChat.name} />
                ) : (
                  getUserInitials(selectedChat.name)
                )}
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                <p>{msg.text}</p>
              </div>
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <button type="button" className="input-action-btn" title="Attach File">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
        />
        <button type="button" className="input-action-btn" title="Emoji">
          <Smile size={20} />
        </button>
        <button 
          type="submit" 
          className="send-btn"
          disabled={!message.trim()}
          title="Send Message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}