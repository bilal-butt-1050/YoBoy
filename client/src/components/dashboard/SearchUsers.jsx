'use client'

import { useState } from 'react'
import { Search, UserPlus, MessageCircle } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import './searchUsers.css'

export default function SearchUsers({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      try {
        const results = await usersAPI.searchUsers(searchQuery.trim())
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
  }

  const handleStartChat = (user) => {
    console.log('Starting chat with:', user.username)
    // Backend logic will be added here
  }

  const handleAddFriend = (user) => {
    console.log('Adding friend:', user.username)
    // Backend logic will be added here
  }

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="search-users-container">
      <div className="search-users-header">
        <h2>Search Users</h2>
        <p>Find and connect with people on ChatFlow</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon-large" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-large"
          />
        </div>
        <button
          type="submit"
          className="search-submit-btn"
          disabled={!searchQuery.trim()}
        >
          Search
        </button>
      </form>

      <div className="search-results">
        {isSearching ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">
                {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                found
              </span>
            </div>
            <div className="users-grid">
              {searchResults.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-card-avatar-container">
                      <div className="user-card-avatar">
                        {getUserInitials(user.name)}
                      </div>
                      {user.online && <div className="user-online-badge" />}
                    </div>
                    <div className="user-card-info">
                      <h4>{user.name}</h4>
                      <p className="username">@{user.username}</p>
                      {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                  </div>
                  <div className="user-card-actions">
                    <button
                      className="user-action-btn primary"
                      onClick={() => handleStartChat(user)}
                    >
                      <MessageCircle size={18} />
                      Message
                    </button>
                    <button
                      className="user-action-btn secondary"
                      onClick={() => handleAddFriend(user)}
                    >
                      <UserPlus size={18} />
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searchQuery && !isSearching ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No users found</h3>
            <p>Try searching with a different name or username</p>
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Discover New Connections</h3>
            <p>
              Search for users by their name or username to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  )
}