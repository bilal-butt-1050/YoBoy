'use client'

import { useEffect, useState } from 'react'
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
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()

  // Initialize chat hook
  const {
    chats,
    activeChat,
    messages,
    loading: chatLoading,
    sending,
    error: chatError,
    selectChat,
    createOrGetDM,
    sendMessage,
  } = useChat(user)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Handle user selection from SearchUsers
  const handleSelectUser = async (selectedUser) => {
    const chat = await createOrGetDM(selectedUser)
    if (chat) {
      setActiveView('chats') // Switch to chats view to show the conversation
    }
  }

  // Render main content based on active view
  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return (
          <div className="chat-container">
            <ChatList
              chats={chats}
              activeChat={activeChat}
              onSelectChat={selectChat}
              currentUser={user}
            />
            <ChatWindow
              activeChat={activeChat}
              messages={messages}
              onSendMessage={sendMessage}
              sending={sending}
              currentUser={user}
            />
          </div>
        )

      case 'search':
        return <SearchUsers currentUser={user} onSelectUser={handleSelectUser} />

      case 'profile':
        return <Profile />

      case 'settings':
        return <Settings />

      default:
        return null
    }
  }

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Show error if chat operations fail
  {chatError && (
    <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl z-50">
      {chatError}
    </div>
  )}

  return (
    <div className="dashboard">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={user}
        logout={logout}
      />
      <main className="main-content">
        {renderMainContent()}
      </main>
    </div>
  )
}