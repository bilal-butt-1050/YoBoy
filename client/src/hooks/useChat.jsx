'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { messagesAPI, usersAPI } from '@/lib/api'

// Helper: read token from cookie (backend sets `token` cookie)
function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function useChat(currentUser) {
  const [socketConnected, setSocketConnected] = useState(false)
  const [messages, setMessages] = useState([]) // messages for current conversation
  const [conversations, setConversations] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUsers, setTypingUsers] = useState({}) // { userId: timeoutId }
  const [isTyping, setIsTyping] = useState(false) // indicates remote user typing in current conversation
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const currentConversationRef = useRef(null) // { id: userId } or null

  // Initialize socket once (per logged in user)
  useEffect(() => {
    if (!currentUser) return

    const token = getTokenFromCookie()
    if (!token) {
      console.warn('No auth token found for socket connection')
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      console.log('socket connected', socket.id)
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
      console.log('socket disconnected')
    })

    // Online users list (initial)
    socket.on('users:online', (onlineIds = []) => {
      setOnlineUsers(new Set(onlineIds.map((id) => id.toString())))
    })

    socket.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...Array.from(prev), userId.toString()]))
    })

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const clone = new Set(Array.from(prev))
        clone.delete(userId.toString())
        return clone
      })
    })

    // Message received (for the current room)
    socket.on('message:receive', (message) => {
      // If the message belongs to the currently open conversation, append it
      const currentConvUserId = currentConversationRef.current?.id
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()

      // message where either sender or receiver matches current conversation user
      if (
        currentConvUserId &&
        (senderId === currentConvUserId || receiverId === currentConvUserId)
      ) {
        setMessages((prev) => [...prev, message])
      }

      // update conversations so sidebar shows last message (lazy)
      setConversations((prev) => {
        const copy = Array.isArray(prev) ? [...prev] : []
        // Try to update matching conversation's lastMessage
        for (let i = 0; i < copy.length; i++) {
          const convUser = copy[i].user
          const convUserId = convUser?._id?.toString() || convUser?.toString()
          if (convUserId === (senderId === currentUser?.id ? receiverId : senderId)) {
            copy[i].lastMessage = message
            return copy
          }
        }
        return copy
      })
    })

    // Typing indicators
    socket.on('typing:start', ({ userId }) => {
      // if the typing user is for current conversation -> show typing
      if (currentConversationRef.current?.id === userId.toString()) {
        setIsTyping(true)
      }
      // mark typing user for quick UI usage (set timeout to auto-clear)
      setTypingUsers((prev) => ({ ...prev, [userId]: Date.now() }))
    })

    socket.on('typing:stop', ({ userId }) => {
      if (currentConversationRef.current?.id === userId.toString()) {
        setIsTyping(false)
      }
      setTypingUsers((prev) => {
        const clone = { ...prev }
        delete clone[userId]
        return clone
      })
    })

    // Read receipts
    socket.on('message:read', ({ messageId, readAt }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRead: true, readAt } : m))
      )
    })

    // Notifications (optional)
    socket.on('message:notification', (payload) => {
      // payload: { messageId, from, fromUsername, content }
      // You can show a toast/notification here if you want
      // console.log('notification', payload)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setSocketConnected(false)
    }
  }, [currentUser])

  // Fetch conversations (callable)
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations()
      // backend returns { conversations: [...] } or array; adapt defensively
      const convs = Array.isArray(res) ? res : res?.conversations || []
      setConversations(convs)
    } catch (err) {
      console.error('fetchConversations error', err)
    }
  }, [])

  // Fetch users (callable)
  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersAPI.getUsers()
      return res?.users || []
    } catch (err) {
      console.error('fetchUsers error', err)
      return []
    }
  }, [])

  // Fetch messages for a specific chat (otherUserId)
  const fetchMessages = useCallback(async (otherUserId) => {
    if (!otherUserId) return setMessages([])
    setLoading(true)
    try {
      const res = await messagesAPI.getMessages(otherUserId)
      const msgs = Array.isArray(res) ? res : res?.messages || []
      setMessages(msgs)
    } catch (err) {
      console.error('fetchMessages error', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Join conversation room (other user's id)
  const joinConversation = useCallback(
    (otherUserId) => {
      if (!socketRef.current || !otherUserId) return
      currentConversationRef.current = { id: otherUserId.toString() }
      socketRef.current.emit('conversation:join', otherUserId.toString())
      // Also fetch message history for this conversation
      fetchMessages(otherUserId)
    },
    [fetchMessages]
  )

  // Send message via socket (optimistic update)
  const sendMessage = useCallback(
    async ({ receiverId, content }) => {
      if (!socketRef.current || !receiverId || !content?.trim()) return
      // optimistic message object
      const optimistic = {
        _id: `temp_${Date.now()}`,
        content,
        sender: { _id: currentUser?._id || currentUser?.id, name: currentUser?.name },
        receiver: { _id: receiverId },
        createdAt: new Date().toISOString(),
        isRead: false,
      }

      setMessages((prev) => [...prev, optimistic])

      // emit to server (server will save and emit back)
      socketRef.current.emit('message:send', { receiverId: receiverId.toString(), content })

      // update conversations lastMessage immediately (for sidebar)
      setConversations((prev) => {
        const copy = Array.isArray(prev) ? [...prev] : []
        let found = false
        for (let i = 0; i < copy.length; i++) {
          const convUser = copy[i].user
          const convUserId = convUser?._id?.toString() || convUser?.toString()
          if (convUserId === receiverId.toString()) {
            copy[i].lastMessage = optimistic
            found = true
            break
          }
        }
        if (!found) {
          // push a minimal conv item so sidebar shows it
          copy.unshift({ user: { _id: receiverId }, lastMessage: optimistic })
        }
        return copy
      })
    },
    [currentUser]
  )

  // Mark message as read
  const markAsRead = useCallback((messageId) => {
    if (!socketRef.current || !messageId) return
    socketRef.current.emit('message:read', messageId)
    // local update
    setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, isRead: true } : m)))
  }, [])

  // Typing helpers
  const startTyping = useCallback((receiverId) => {
    if (!socketRef.current || !receiverId) return
    socketRef.current.emit('typing:start', receiverId.toString())
  }, [])

  const stopTyping = useCallback((receiverId) => {
    if (!socketRef.current || !receiverId) return
    socketRef.current.emit('typing:stop', receiverId.toString())
  }, [])

  // Expose a sane API
  return {
    socketConnected,
    messages: messages || [],
    conversations,
    fetchConversations,
    fetchUsers,
    fetchMessages,
    joinConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onlineUsers, // Set of online userIds (strings)
    typingUsers, // object map with timestamps
    isTyping,
    loading,
  }
}
