'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, UserPlus, MessageCircle } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import './searchUsers.css'

export default function SearchUsers({ currentUser, onSelectUser }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceTimeoutRef = useRef(null)

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await usersAPI.searchUsers(query.trim())
        setResults(res.users || [])
      } catch (err) {
        console.error('Search error:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query])

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??'

  const filteredResults = results.filter(user => user._id !== currentUser?._id)

  return (
    <div className="search-users-container">
      <div className="search-users-header">
        <h2>Search Users</h2>
        <p>Find and connect with people on ChatFlow</p>
      </div>

      <div className="search-input-wrapper">
        <Search size={20} className="search-icon-large" />
        <input
          type="text"
          placeholder="Search by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input-large"
        />
        {loading && <div className="search-loading-spinner"></div>}
      </div>

      <div className="search-results">
        {loading ? (
          <div className="no-results">
            <div className="loading-spinner"></div>
            <p>Searching users...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="results-section">
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">{filteredResults.length} user{filteredResults.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="users-grid">
              {filteredResults.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-card-avatar-container">
                      <div className="user-card-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          getUserInitials(user.name)
                        )}
                      </div>
                      {user.status === 'online' && <div className="user-online-badge" />}
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
                      onClick={() => onSelectUser?.(user)}
                    >
                      <MessageCircle size={18} />
                      Message
                    </button>
                    <button
                      className="user-action-btn secondary"
                      onClick={() => console.log('Add friend', user.username)}
                    >
                      <UserPlus size={18} />
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : query.trim() ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No users found</h3>
            <p>Try searching with a different name or username</p>
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Discover New Connections</h3>
            <p>Search for users by name or username to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}