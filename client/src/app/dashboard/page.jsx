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
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  const {
    socketConnected,
    messages,
    conversations,
    fetchConversations,
    fetchUsers,
    joinConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onlineUsers,
    isTyping,
    loading: chatLoading,
  } = useChat(user)

  // redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  // fetch conversations on load
  useEffect(() => {
    if (user) fetchConversations()
  }, [user, fetchConversations])

  // join conversation when selected
  useEffect(() => {
    if (selectedChat) joinConversation(selectedChat._id || selectedChat.id)
  }, [selectedChat, joinConversation])

  const handleUserSelect = (userObj) => {
    setSelectedChat(userObj)
    setActiveView('chats')
  }

  const handleSendMessage = async (content) => {
    if (!selectedChat) return
    await sendMessage({ receiverId: selectedChat._id || selectedChat.id, content })
    fetchConversations()
  }

  const handleMarkAsRead = (messageId) => markAsRead(messageId)

  const filteredUsers = conversations
    ?.map((conv) => ({ ...conv.user, lastMessage: conv.lastMessage }))
    .filter(Boolean)
    .filter(
      (u) =>
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return (
          <div className="chat-container">
            <ChatList
              users={filteredUsers}
              selectedChat={selectedChat}
              onSelectChat={handleUserSelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={chatLoading}
              onlineUsers={onlineUsers}
            />
            <ChatWindow
              selectedChat={selectedChat}
              currentUser={user}
              messages={messages}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              startTyping={() => startTyping(selectedChat?._id || selectedChat?.id)}
              stopTyping={() => stopTyping(selectedChat?._id || selectedChat?.id)}
              isTyping={isTyping}
              markAsRead={handleMarkAsRead}
            />
          </div>
        )
      case 'search':
        return <SearchUsers currentUser={user} />
      case 'profile':
        return <Profile user={user} />
      case 'settings':
        return <Settings user={user} />
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
        isMobileOpen={false}
        setIsMobileOpen={() => {}}
        logout={logout}
      />
      <main className="main-content">{renderMainContent()}</main>
    </div>
  )
}
