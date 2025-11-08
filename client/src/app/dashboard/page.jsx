'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import Sidebar from '@/components/dashboard/Sidebar'
import ChatList from '@/components/dashboard/ChatList'
import ChatWindow from '@/components/dashboard/ChatWindow'
import SearchUsers from '@/components/dashboard/SearchUsers'
import Profile from '@/components/dashboard/Profile'
import Settings from '@/components/dashboard/Settings'
import { useAuth } from '../../context/AuthContext'
import useChat from '@/hooks/useChat'

import './dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState('chats')
  const { user, isAuthenticated, authLoading, logout } = useAuth()
  

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return (
          <div className="chat-container">
            <ChatLis />
            <ChatWindo />
          </div>
        )

      case 'search':
        return <SearchUsers />
      case 'profile':
        return <Profile />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={user}
        logout={logout}
      />
      <main className="main-content">{renderMainContent()}</main>
    </div>
  )
}
