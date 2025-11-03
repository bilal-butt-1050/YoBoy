'use client'

import { Search, MoreVertical } from 'lucide-react'
import './chatList.css'

export default function ChatList({
  users = [],
  selectedChat,
  onSelectChat,
  searchQuery,
  setSearchQuery,
  loading,
}) {
  const getUserInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  if (loading) return <p className="p-4 text-gray-400">Loading chats...</p>

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h3>Messages</h3>
        <button className="more-btn">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No conversations found</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id || user._id}
              className={`chat-item ${
                selectedChat?.id === (user.id || user._id) ? 'active' : ''
              }`}
              onClick={() => onSelectChat(user)}
            >
              <div className="chat-avatar-container">
                <div className="chat-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    getUserInitials(user.name)
                  )}
                </div>
                {user.status === 'online' && <div className="online-indicator" />}
              </div>
              <div className="chat-info">
                <div className="chat-header">
                  <h4>{user.name}</h4>
                  {/* Optionally add last message timestamp */}
                </div>
                <div className="chat-preview">
                  <p>{user.lastMessage || ''}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
