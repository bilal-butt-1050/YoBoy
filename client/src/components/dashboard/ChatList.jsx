'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, MoreVertical, Loader2 } from 'lucide-react'
import { chatsAPI } from '@/lib/api'
import './chatList.css'

export default function ChatList({ chats, activeChat, onSelectChat, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceTimeoutRef = useRef(null)

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??'

  const getOtherUser = (chat) => {
    if (!chat?.members || chat.isGroup) return null
    return chat.members.find((m) => m._id !== currentUser?._id)
  }

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.name || 'Group Chat'
    const other = getOtherUser(chat)
    return other?.name || 'Unknown User'
  }

  const getChatAvatar = (chat) => {
    if (chat.isGroup) return chat.name?.[0]?.toUpperCase() || 'G'
    const other = getOtherUser(chat)
    return other?.avatar || getUserInitials(other?.name)
  }

  const isUserOnline = (chat) => {
    if (chat.isGroup) return false
    const other = getOtherUser(chat)
    return other?.status === 'online'
  }

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet'
    const msg = chat.lastMessage
    const isOwn = msg.sender?._id === currentUser?._id
    const prefix = isOwn ? 'You: ' : ''
    return `${prefix}${msg.content?.substring(0, 30)}${msg.content?.length > 30 ? '...' : ''}`
  }

  // --- Search handler with debounce ---
  const handleSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await chatsAPI.searchChats(query)
        setSearchResults(res.chats || [])
      } catch (err) {
        console.error('Search error:', err.message)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Handle search when searchTerm changes
  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm, handleSearch])

  const displayChats = searchTerm.trim() ? searchResults : chats
  const showSearchResults = searchTerm.trim() && !loading
  const showNoResults = searchTerm.trim() && !loading && displayChats.length === 0
  const showRegularChats = !searchTerm.trim() && !loading
  const showEmptyState = !searchTerm.trim() && chats.length === 0

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && (
          <div className="search-loading">
            <Loader2 size={16} className="spin" />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 size={20} className="spin" />
            <p>Searching conversations...</p>
          </div>
        )}

        {/* No Results State */}
        {showNoResults && (
          <div className="empty-state">
            <p>No conversations found for "{searchTerm}"</p>
          </div>
        )}

        {/* Empty Chats State */}
        {showEmptyState && (
          <div className="empty-state">
            <p>No conversations yet</p>
            <span>Start a new conversation to see it here</span>
          </div>
        )}

        {/* Regular Chats */}
        {showRegularChats && chats.map((chat) => {
          const chatName = getChatName(chat)
          const chatAvatar = getChatAvatar(chat)
          const online = isUserOnline(chat)
          const lastMessagePreview = getLastMessagePreview(chat)
          const time = formatTime(chat.lastMessage?.createdAt || chat.updatedAt)

          return (
            <div
              key={chat._id}
              className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar-container">
                <div className="chat-avatar">
                  {typeof chatAvatar === 'string' && chatAvatar.startsWith('http') ? (
                    <img src={chatAvatar} alt={chatName} />
                  ) : (
                    chatAvatar
                  )}
                  {online && <div className="online-indicator" />}
                </div>
              </div>

              <div className="chat-info">
                <div className="chat-top">
                  <h4>{chatName}</h4>
                  <span className="chat-time">{time}</span>
                </div>
                <div className="chat-bottom">
                  <p className="last-message">{lastMessagePreview}</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Search Results */}
        {showSearchResults && displayChats.map((chat) => {
          const chatName = getChatName(chat)
          const chatAvatar = getChatAvatar(chat)
          const online = isUserOnline(chat)
          const lastMessagePreview = getLastMessagePreview(chat)
          const time = formatTime(chat.lastMessage?.createdAt || chat.updatedAt)

          return (
            <div
              key={chat._id}
              className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar-container">
                <div className="chat-avatar">
                  {typeof chatAvatar === 'string' && chatAvatar.startsWith('http') ? (
                    <img src={chatAvatar} alt={chatName} />
                  ) : (
                    chatAvatar
                  )}
                  {online && <div className="online-indicator" />}
                </div>
              </div>

              <div className="chat-info">
                <div className="chat-top">
                  <h4>{chatName}</h4>
                  <span className="chat-time">{time}</span>
                </div>
                <div className="chat-bottom">
                  <p className="last-message">{lastMessagePreview}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}