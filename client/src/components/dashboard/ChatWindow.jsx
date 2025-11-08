'use client'

import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react'
import './chatWindow.css'

export default function ChatWindowUI() {
  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
            />
            <div className="online-dot" />
          </div>
          <div>
            <h3>John Doe</h3>
            <p>Online</p>
          </div>
        </div>

        <div className="chat-actions">
          <button className="action-btn">
            <Phone size={20} />
          </button>
          <button className="action-btn">
            <Video size={20} />
          </button>
          <button className="action-btn">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {/* Received message */}
        <div className="message received">
          <div className="message-avatar">JD</div>
          <div className="message-content">
            <div className="message-bubble">
              <p>Hey! How’s it going?</p>
            </div>
            <span className="message-time">14:22</span>
          </div>
        </div>

        {/* Sent message */}
        <div className="message sent">
          <div className="message-content">
            <div className="message-bubble">
              <p>All good, just working on something.</p>
            </div>
            <span className="message-time">
              14:24 <span className="read-indicator">✓✓</span>
            </span>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="typing-indicator">Typing...</div>
      </div>

      {/* Input */}
      <form className="message-input-container">
        <button type="button" className="input-action-btn">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="button" className="input-action-btn">
          <Smile size={20} />
        </button>
        <button type="submit" className="send-btn">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
