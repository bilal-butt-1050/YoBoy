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
  onlineUsers = new Set(),
}) {
  const getUserInitials = (name) =>
    (name || '')
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
        <button className="more-btn"><MoreVertical size={20} /></button>
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
          users.map((user) => {
            const userId = (user._id || user.id || '').toString()
            const isActive = selectedChat && (selectedChat._id || selectedChat.id || '') === userId
            const isOnline = onlineUsers.has?.(userId)

            return (
              <div
                key={userId}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChat(user)}
              >
                <div className="chat-avatar-container">
                  <div className="chat-avatar">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : getUserInitials(user.name)}
                  </div>
                  {isOnline && <div className="online-indicator" />}
                </div>
                <div className="chat-info">
                  <h4>{user.name}</h4>
                  <p>{user.lastMessage?.content || user.lastMessage || ''}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
