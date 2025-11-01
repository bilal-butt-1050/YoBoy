'use client'

import { useState } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import './chatList.css'

export default function ChatList({ onSelectChat, selectedChat }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock chat data - will be replaced with actual data from backend
  const chats = [
    {
      id: '1',
      name: 'Alice Johnson',
      username: 'alice_j',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2m ago',
      unread: 2,
      online: true,
      avatar: null
    },
    {
      id: '2',
      name: 'Bob Smith',
      username: 'bobsmith',
      lastMessage: 'Did you see the latest update?',
      timestamp: '1h ago',
      unread: 0,
      online: false,
      avatar: null
    },
    {
      id: '3',
      name: 'Carol White',
      username: 'carolw',
      lastMessage: 'Thanks for your help!',
      timestamp: '3h ago',
      unread: 1,
      online: true,
      avatar: null
    },
    {
      id: '4',
      name: 'David Brown',
      username: 'davidb',
      lastMessage: 'See you tomorrow 👋',
      timestamp: '1d ago',
      unread: 0,
      online: false,
      avatar: null
    },
  ]

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar-container">
                <div className="chat-avatar">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} />
                  ) : (
                    getUserInitials(chat.name)
                  )}
                </div>
                {chat.online && <div className="online-indicator" />}
              </div>

              <div className="chat-info">
                <div className="chat-header">
                  <h4>{chat.name}</h4>
                  <span className="timestamp">{chat.timestamp}</span>
                </div>
                <div className="chat-preview">
                  <p>{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="unread-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}