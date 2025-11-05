'use client'

import { useState } from 'react'
import { Search, UserPlus, MessageCircle } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import './searchUsers.css'

export default function SearchUsers({ currentUser }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await usersAPI.searchUsers(query.trim())
      setResults(res)
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input-large"
          />
        </div>
        <button type="submit" className="search-submit-btn" disabled={!query.trim()}>
          Search
        </button>
      </form>

      <div className="search-results">
        {loading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : results.length ? (
          <div className="users-grid">
            {results.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-avatar-container">
                    <div className="user-card-avatar">{getUserInitials(user.name)}</div>
                    {user.online && <div className="user-online-badge" />}
                  </div>
                  <div className="user-card-info">
                    <h4>{user.name}</h4>
                    <p className="username">@{user.username}</p>
                    {user.bio && <p className="user-bio">{user.bio}</p>}
                  </div>
                </div>
                <div className="user-card-actions">
                  <button className="user-action-btn primary" onClick={() => console.log('Chat', user.username)}>
                    <MessageCircle size={18} />
                    Message
                  </button>
                  <button className="user-action-btn secondary" onClick={() => console.log('Add friend', user.username)}>
                    <UserPlus size={18} />
                    Add Friend
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="no-results">
            <h3>No users found</h3>
            <p>Try a different name or username</p>
          </div>
        ) : (
          <div className="search-empty-state">
            <h3>Discover New Connections</h3>
            <p>Search for users to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
