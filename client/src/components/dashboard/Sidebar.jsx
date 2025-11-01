'use client'

import { MessageSquare, Search, User, Settings, LogOut } from 'lucide-react'
import './sidebar.css'

export default function Sidebar({ activeView, setActiveView, currentUser, isMobileOpen, setIsMobileOpen }) {
  
  const navItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'search', label: 'Search Users', icon: Search },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleNavClick = (viewId) => {
    setActiveView(viewId)
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  const handleLogout = () => {
    // Logout logic will be implemented later
    console.log('Logging out...')
  }

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {isMobileOpen && (
        <div 
          className="mobile-overlay active" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>ChatFlow</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini" onClick={() => handleNavClick('profile')}>
            <div className="user-avatar">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                getUserInitials(currentUser.name)
              )}
            </div>
            <div className="user-info">
              <h4>{currentUser.name}</h4>
              <p>@{currentUser.username}</p>
            </div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}