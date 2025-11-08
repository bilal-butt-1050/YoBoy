'use client'

import { Search, MoreVertical, Circle } from 'lucide-react'
import './chatList.css'

export default function ChatListUI() {
  return (
    <div className="chat-list-container">
      {/* Header */}
      <div className="chat-list-header">
        <h3>Messages</h3>
        <button className="more-btn">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="search-input"
        />
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {/* Chat Item */}
        <div className="chat-item active">
          <div className="chat-avatar-container">
            <div className="chat-avatar">
              <img
                src="https://via.placeholder.com/40"
                alt="User Avatar"
              />
            </div>
            <div className="online-indicator" />
          </div>

          <div className="chat-info">
            <div className="chat-top">
              <h4>John Doe</h4>
              <span className="chat-time">14:32</span>
            </div>
            <div className="chat-bottom">
              <p className="last-message">Hey, how’s everything going?</p>
            </div>
          </div>
        </div>

        {/* Another Chat Item */}
        <div className="chat-item">
          <div className="chat-avatar-container">
            <div className="chat-avatar">
              <img
                src="https://via.placeholder.com/40"
                alt="User Avatar"
              />
            </div>
          </div>

          <div className="chat-info">
            <div className="chat-top">
              <h4>Jane Smith</h4>
              <span className="chat-time">09:47</span>
            </div>
            <div className="chat-bottom">
              <p className="last-message no-msg">No messages yet</p>
            </div>
          </div>
        </div>

        {/* Empty State Example */}
        <div className="empty-state">
          <p>No conversations yet</p>
        </div>
      </div>
    </div>
  )
}
