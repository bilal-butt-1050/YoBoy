'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usersAPI, messagesAPI } from '../../lib/api'
import { 
  Search, Send, MoreVertical, Phone, Video, 
  LogOut, User as UserIcon, Settings, Paperclip, Smile, Loader2 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Chat() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
      fetchUsers()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers()
      setUsers(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const response = await messagesAPI.sendMessage({
        receiver: selectedUser.id,
        content: newMessage.trim(),
      })
      
      setMessages([...messages, response.data])
      setNewMessage('')
      await fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleUserSelect = (selectedUserData) => {
    setSelectedUser(selectedUserData)
  }

  const filteredUsers = searchQuery
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  const getDisplayUsers = () => {
    if (conversations.length > 0) {
      return conversations.map(conv => conv.user)
    }
    return filteredUsers
  }

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <div className="w-80 flex flex-col glass border-r border-white/10">
        {/* User Profile Header */}
        <div className="p-4 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-semibold">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold">{user?.name}</h3>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations/Users List */}
        <div className="flex-1 overflow-y-auto">
          {getDisplayUsers().length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p className="text-sm">No users available</p>
            </div>
          ) : (
            getDisplayUsers().map((userData) => (
              <div
                key={userData.id || userData._id}
                onClick={() => handleUserSelect(userData)}
                className={`p-4 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${
                  selectedUser?.id === (userData.id || userData._id) ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                      <span className="font-semibold">{userData.name?.charAt(0)}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-950 ${
                      userData.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{userData.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{userData.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 glass border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="font-semibold">{selectedUser.name?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-400">
                    {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender._id === user.id || message.sender === user.id
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-primary-500 to-purple-600'
                            : 'glass'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 glass border-t border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 px-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to ChatFlow</h3>
                <p>Select a user from the sidebar to start messaging</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}