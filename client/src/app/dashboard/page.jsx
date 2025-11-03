'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatList from '@/components/dashboard/ChatList'
import ChatWindow from '@/components/dashboard/ChatWindow'
import SearchUsers from '@/components/dashboard/SearchUsers'
import Profile from '@/components/dashboard/Profile'
import Settings from '@/components/dashboard/Settings'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useChat from '@/hooks/useChat'
import './dashboard.css'

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeView, setActiveView] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null) // selected user object
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

  // redirect if not auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // initial load of convos + users
  useEffect(() => {
    if (!user) return
    fetchConversations()
    // optional: fetchUsers() if you need user directory (search page uses its own fetch)
  }, [user, fetchConversations])

  // when selected chat changes: join room + scroll/load messages
  useEffect(() => {
    if (!selectedChat) return
    const otherId = selectedChat._id || selectedChat.id
    joinConversation(otherId)
  }, [selectedChat, joinConversation])

  // Click handler from chat list
  const handleUserSelect = (userObj) => {
    setSelectedChat(userObj)
    setActiveView('chats')
  }

  // send message wrapper (ChatWindow will manage its local input state)
  const handleSendMessage = async (content) => {
    if (!selectedChat) return
    await sendMessage({ receiverId: selectedChat._id || selectedChat.id, content })
    // refresh conversations so sidebar shows latest; light and infrequent
    fetchConversations()
    // scroll handled by ChatWindow via messagesEndRef
  }

  // mark a message read (when message becomes visible)
  const handleMarkAsRead = (messageId) => {
    markAsRead(messageId)
    // optionally refresh conversations if you want
  }

  const filteredUsersFromConversations = () => {
    if (Array.isArray(conversations) && conversations.length > 0) {
      return conversations
        .map((conv) => ({
          ...conv.user,
          lastMessage: conv.lastMessage,
        }))
        .filter(Boolean)
    }
    return []
  }

  const filteredUsers = searchQuery
    ? filteredUsersFromConversations().filter(
        (u) =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredUsersFromConversations()

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
              sending={false}
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
