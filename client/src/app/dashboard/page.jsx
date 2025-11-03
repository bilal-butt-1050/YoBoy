'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatList from '@/components/dashboard/ChatList'
import ChatWindow from '@/components/dashboard/ChatWindow'
import SearchUsers from '@/components/dashboard/SearchUsers'
import Profile from '@/components/dashboard/Profile'
import Settings from '@/components/dashboard/Settings'
import { useAuth } from '../../context/AuthContext'
import { usersAPI, messagesAPI } from '../../lib/api'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import './dashboard.css'

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch users & conversations
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
      fetchUsers()
    }
  }, [isAuthenticated])

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id || selectedChat._id)
    }
  }, [selectedChat])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations()
      setConversations(response || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers()
      setUsers(response.users || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId)
      setMessages(response || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat || sending) return

    setSending(true)
    try {
      const response = await messagesAPI.sendMessage({
        receiverId: selectedChat.id || selectedChat._id,
        content: newMessage.trim(),
      })
      setMessages([...messages, response])
      setNewMessage('')
      await fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleUserSelect = (userData) => {
    setSelectedChat(userData)
    setActiveView('chats')
  }

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users

  const getDisplayUsers = () => {
    if (conversations && conversations.length > 0) {
      return conversations.map((conv) => conv.user).filter(Boolean) // also filter out any null/undefined users
    }
    return filteredUsers || []
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return (
          <div className="chat-container">
            <ChatList
              users={getDisplayUsers()}
              selectedChat={selectedChat}
              onSelectChat={handleUserSelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
            />
            <ChatWindow
              selectedChat={selectedChat}
              currentUser={user}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sending={sending}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
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

  if (authLoading || loading) {
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
