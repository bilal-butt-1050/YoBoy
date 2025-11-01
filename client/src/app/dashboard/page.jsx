'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatList from '@/components/dashboard/ChatList'
import ChatWindow from '@/components/dashboard/ChatWindow'
import SearchUsers from '@/components/dashboard/SearchUsers'
import Profile from '@/components/dashboard/Profile'
import Settings from '@/components/dashboard/Settings'
import './dashboard.css'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Mock user data - will be replaced with actual data from backend
  const currentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    avatar: null,
    bio: 'Hey there! I am using ChatFlow.',
    joinedDate: '2024-01-15'
  }

  const renderMainContent = () => {
    switch(activeView) {
      case 'chats':
        return (
          <div className="chat-container">
            <ChatList 
              onSelectChat={setSelectedChat}
              selectedChat={selectedChat}
            />
            <ChatWindow 
              selectedChat={selectedChat}
              currentUser={currentUser}
            />
          </div>
        )
      case 'search':
        return <SearchUsers currentUser={currentUser} />
      case 'profile':
        return <Profile user={currentUser} />
      case 'settings':
        return <Settings user={currentUser} />
      default:
        return null
    }
  }

  return (
    <div className="dashboard">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <main className="main-content">
        {renderMainContent()}
      </main>
    </div>
  )
}