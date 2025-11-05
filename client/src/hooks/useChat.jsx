'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { messagesAPI } from '@/lib/api'
import { useSocket } from '@/context/SocketContext'

export default function useChat(currentUser) {
  const { socket, connected, onlineUsers, isUserOnline } = useSocket()

  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const currentChatRef = useRef(null)

  // ============================================
  // SOCKET EVENTS
  // ============================================
  useEffect(() => {
    if (!socket || !connected) return

    console.log('✅ Socket available in useChat')

    socket.on('message:receive', (message) => {
      console.log('📩 Message received:', message._id)

      const currentChat = currentChatRef.current
      if (!currentChat) return

      const activeChatId = currentChat.id?.toString()
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()

      if (senderId === activeChatId || receiverId === activeChatId || senderId === currentUser._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id)
          return exists ? prev : [...prev, message]
        })
      }

      updateConversationPreview(message)
    })

    socket.on('typing:start', () => setIsTyping(true))
    socket.on('typing:stop', () => setIsTyping(false))

    return () => {
      socket.off('message:receive')
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [socket, connected, currentUser])

  // ============================================
  // UPDATE CONVERSATION PREVIEW
  // ============================================
  const updateConversationPreview = useCallback(
    (message) => {
      setConversations((prev) => {
        const copy = [...prev]
        const senderId = message.sender?._id?.toString() || message.sender?.toString()
        const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()
        const otherUserId = senderId === currentUser._id ? receiverId : senderId

        const idx = copy.findIndex(
          (c) => (c.user?._id?.toString() || c.user?.toString()) === otherUserId
        )

        if (idx > -1) {
          copy[idx].lastMessage = message
        } else {
          copy.unshift({
            user: senderId === currentUser._id ? message.receiver : message.sender,
            lastMessage: message,
          })
        }
        return copy
      })
    },
    [currentUser]
  )

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
  // FETCH MESSAGES FOR A CHAT
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
  // JOIN CHAT
  // ============================================
  const joinConversation = useCallback(
    (userId) => {
      if (!socket || !connected || !userId) return

      const userIdStr = userId.toString()
      currentChatRef.current = { id: userIdStr }

      console.log('📥 Joining chat with:', userIdStr)
      socket.emit('conversation:join', userIdStr)
      fetchMessages(userIdStr)
    },
    [socket, connected, fetchMessages]
  )

  // ============================================
  // SEND MESSAGE
  // ============================================
  const sendMessage = useCallback(
    async ({ receiverId, content, messageType = 'text' }) => {
      if (!socket || !receiverId || !content?.trim()) {
        console.warn('⚠️ Cannot send message: missing data or socket not ready')
        return
      }

      try {
        const message = await messagesAPI.sendMessage({
          receiverId,
          content: content.trim(),
          messageType,
        })

        console.log('📤 Sending message via socket:', message._id)

        socket.emit('message:send', {
          receiverId,
          content: content.trim(),
          messageType,
        })

        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id)
          return exists ? prev : [...prev, message]
        })

        updateConversationPreview(message)
      } catch (err) {
        console.error('❌ Failed to send message:', err)
      }
    },
    [socket, updateConversationPreview]
  )

  // ============================================
  // TYPING EVENTS
  // ============================================
  const startTyping = useCallback(
    (receiverId) => {
      if (!socket || !receiverId) return
      socket.emit('typing:start', receiverId)
    },
    [socket]
  )

  const stopTyping = useCallback(
    (receiverId) => {
      if (!socket || !receiverId) return
      socket.emit('typing:stop', receiverId)
    },
    [socket]
  )

  return {
    loading,
    conversations,
    messages,
    onlineUsers,
    isTyping,
    socketConnected: connected,
    fetchConversations,
    fetchMessages,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping,
    isUserOnline,
  }
}
