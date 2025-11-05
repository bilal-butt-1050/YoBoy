'use client'

import { MessageSquare, Search, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './sidebar.css'

export default function Sidebar({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth()

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
    <>
      {isMobileOpen && <div className="mobile-overlay active" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>ChatFlow</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.id)
                  setIsMobileOpen?.(false)
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile-mini" onClick={() => setActiveView('profile')}>
              <div className="user-avatar">
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : getUserInitials(user.name)}
              </div>
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>@{user.username}</p>
              </div>
            </div>
          )}

          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
