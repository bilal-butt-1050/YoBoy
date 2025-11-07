'use client'

import { useState } from 'react'
import { MessageSquare, Search, User, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './sidebar.css'

export default function Sidebar({ activeView, setActiveView }) {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'search', label: 'Search Users', icon: Search },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const getUserInitials = (name) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : ''

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>ChatFlow</h2>}
        <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={22} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div
            className="user-profile-mini"
            onClick={() => setActiveView('profile')}
          >
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} />
              ) : (
                <img src="/user.png" />
              )}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>@{user.username}</p>
              </div>
            )}
          </div>
        )}

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
