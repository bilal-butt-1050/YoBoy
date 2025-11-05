'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { messagesAPI } from '@/lib/api'

// ============================================
// HELPER: Get token from cookies
// ============================================
function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find(row => row.startsWith('token='))
  
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

export default function useChat(currentUser) {
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  const socketRef = useRef(null)
  const currentChatRef = useRef(null)
  const reconnectAttempts = useRef(0)

  // ============================================
  // SOCKET INITIALIZATION
  // ============================================
  useEffect(() => {
    // Don't initialize if no user
    if (!currentUser?._id) {
      console.log('⏳ Waiting for user authentication...')
      return
    }

    const token = getTokenFromCookie()
    
    if (!token) {
      console.error('❌ No auth token found')
      return
    }

    console.log('🔌 Initializing socket connection...')

    // Create socket instance
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000
    })

    socketRef.current = socket

    // ============================================
    // CONNECTION EVENTS
    // ============================================
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setSocketConnected(true)
      reconnectAttempts.current = 0
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message)
      setSocketConnected(false)
      reconnectAttempts.current++
      
      if (reconnectAttempts.current > 5) {
        console.error('❌ Max reconnection attempts reached')
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason)
      setSocketConnected(false)
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect - reconnect manually
        socket.connect()
      }
    })

    // ============================================
    // ONLINE USERS TRACKING
    // ============================================
    socket.on('users:online', (userIds) => {
      console.log('👥 Online users updated:', userIds.length)
      setOnlineUsers(new Set(userIds))
    })

    socket.on('user:online', ({ userId }) => {
      console.log('🟢 User came online:', userId)
      setOnlineUsers(prev => new Set([...prev, userId]))
    })

    socket.on('user:offline', ({ userId }) => {
      console.log('🔴 User went offline:', userId)
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    })

    // ============================================
    // MESSAGE EVENTS
    // ============================================
    socket.on('message:receive', (message) => {
      console.log('📩 Message received:', message._id)
      
      const currentChat = currentChatRef.current
      if (!currentChat) return

      const activeChatId = currentChat.id?.toString()
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()

      // Only add message if it's for the active chat
      if (senderId === activeChatId || receiverId === activeChatId || senderId === currentUser._id) {
        setMessages(prev => {
          // Prevent duplicates
          const exists = prev.some(m => m._id === message._id)
          return exists ? prev : [...prev, message]
        })
      }

      // Update conversation preview
      updateConversationPreview(message)
    })

    socket.on('message:sent', (message) => {
      console.log('✅ Message sent confirmation:', message._id)
      // Message already added optimistically or via message:receive
    })

    // ============================================
    // TYPING INDICATORS
    // ============================================
    socket.on('typing:start', () => {
      setIsTyping(true)
      // Auto-clear after 3 seconds
      setTimeout(() => setIsTyping(false), 3000)
    })

    socket.on('typing:stop', () => {
      setIsTyping(false)
    })

    // ============================================
    // ERROR HANDLER
    // ============================================
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      console.log('🧹 Cleaning up socket connection')
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUser])

  // ============================================
  // UPDATE CONVERSATION PREVIEW
  // ============================================
  const updateConversationPreview = useCallback((message) => {
    setConversations(prev => {
      const copy = [...prev]
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()
      
      const otherUserId = senderId === currentUser._id ? receiverId : senderId
      const idx = copy.findIndex(c => 
        (c.user?._id?.toString() || c.user?.toString()) === otherUserId
      )

      if (idx > -1) {
        copy[idx].lastMessage = message
      } else {
        // New conversation
        copy.unshift({
          user: senderId === currentUser._id ? message.receiver : message.sender,
          lastMessage: message
        })
      }
      
      return copy
    })
  }, [currentUser])

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await messagesAPI.getConversations()
      setConversations(data || [])
    } catch (err) {
      console.error('❌ Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // FETCH MESSAGES FOR A CONVERSATION
  // ============================================
  const fetchMessages = useCallback(async (receiverId) => {
    try {
      setLoading(true)
      const response = await messagesAPI.getMessages(receiverId)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('❌ Failed to fetch messages:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // JOIN CONVERSATION
  // ============================================
  const joinConversation = useCallback((userId) => {
    if (!socketRef.current || !userId) return
    
    const userIdStr = userId.toString()
    currentChatRef.current = { id: userIdStr }
    
    console.log('📥 Joining conversation with:', userIdStr)
    socketRef.current.emit('conversation:join', userIdStr)
    fetchMessages(userIdStr)
  }, [fetchMessages])

  // ============================================
  // SEND MESSAGE
  // ============================================
  const sendMessage = useCallback(async ({ receiverId, content, messageType = 'text' }) => {
    if (!socketRef.current || !receiverId || !content?.trim()) {
      console.warn('⚠️ Cannot send message: missing data or socket not connected')
      return
    }

    const socket = socketRef.current

    try {
      // Save to database first
      const message = await messagesAPI.sendMessage({
        receiverId,
        content: content.trim(),
        messageType
      })

      console.log('📤 Sending message via socket:', message._id)

      // Emit via socket
      socket.emit('message:send', {
        receiverId,
        content: content.trim(),
        messageType
      })

      // Optimistically add to UI
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id)
        return exists ? prev : [...prev, message]
      })

      // Update conversation preview
      updateConversationPreview(message)

    } catch (err) {
      console.error('❌ Failed to send message:', err)
    }
  }, [updateConversationPreview])

  // ============================================
  // TYPING INDICATORS
  // ============================================
  const startTyping = useCallback((receiverId) => {
    if (!socketRef.current || !receiverId) return
    socketRef.current.emit('typing:start', receiverId)
  }, [])

  const stopTyping = useCallback((receiverId) => {
    if (!socketRef.current || !receiverId) return
    socketRef.current.emit('typing:stop', receiverId)
  }, [])

  return {
    loading,
    conversations,
    messages,
    onlineUsers,
    isTyping,
    socketConnected,
    fetchConversations,
    fetchMessages,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping
  }
}