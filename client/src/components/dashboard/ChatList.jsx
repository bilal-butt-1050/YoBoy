'use client'

import { Search, MoreVertical, Circle } from 'lucide-react'
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

  const truncate = (text, len = 30) =>
    text && text.length > len ? text.slice(0, len) + '…' : text || ''

  if (loading)
    return <p className="p-4 text-gray-400 text-sm">Loading chats...</p>

  return (
    <div className="chat-list-container">
      {/* Header */}
      <div className="chat-list-header">
        <h3>Messages</h3>
        <button className="more-btn">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Search */}
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

      {/* Chat list */}
      <div className="chat-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
          </div>
        ) : (
          users.map((user) => {
            const userId = (user._id || user.id || '').toString()
            const isActive =
              selectedChat &&
              (selectedChat._id || selectedChat.id || '') === userId
            const isOnline = onlineUsers.has?.(userId)

            const lastMsg = user.lastMessage?.content || ''
            const lastMsgTime = user.lastMessage?.createdAt
              ? new Date(user.lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''

            return (
              <div
                key={userId}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChat(user)}
              >
                {/* Avatar */}
                <div className="chat-avatar-container">
                  <div className="chat-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      getUserInitials(user.name)
                    )}
                  </div>
                  {isOnline && <div className="online-indicator" />}
                </div>

                {/* Info */}
                <div className="chat-info">
                  <div className="chat-top">
                    <h4>{user.name}</h4>
                    {lastMsgTime && (
                      <span className="chat-time">{lastMsgTime}</span>
                    )}
                  </div>
                  <div className="chat-bottom">
                    <p className="last-message">
                      {truncate(lastMsg) || <span className="no-msg">No messages yet</span>}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
