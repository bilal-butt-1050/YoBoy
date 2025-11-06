'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { messagesAPI } from '@/lib/api'
import { useSocket } from '@/context/SocketContext'

export default function useChat(currentUser) {
  const { socket, onlineUsers, isUserOnline } = useSocket()

  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const currentChatRef = useRef(null)

  // -------------------------------
  // FETCH CONVERSATIONS (sidebar)
  // -------------------------------
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const data = await messagesAPI.getConversations()
      setConversations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // -------------------------------
  // FETCH MESSAGES (specific chat)
  // -------------------------------
  const fetchMessages = useCallback(async (receiverId) => {
    if (!receiverId) return
    setLoading(true)
    try {
      const res = await messagesAPI.getMessages(receiverId)
      const msgs = res?.messages || res || []
      setMessages(msgs)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // -------------------------------
  // JOIN CONVERSATION
  // -------------------------------
  const joinConversation = useCallback((userId) => {
    if (!socket || !userId) return
    currentChatRef.current = { id: userId.toString() }
    socket.emit('conversation:join', userId)
    fetchMessages(userId)
  }, [socket, fetchMessages])

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------
  const sendMessage = useCallback(async ({ receiverId, content, messageType = 'text' }) => {
    if (!socket) {
      console.warn('Socket not ready. Message not sent.')
      return
    }
    if (!receiverId || !content?.trim()) return

    try {
      // Save to DB
      const message = await messagesAPI.sendMessage({
        receiverId,
        content: content.trim(),
        messageType,
      })

      // Update UI
      setMessages((prev) => [...prev, message])

      // Emit to socket
      socket.emit('message:send', { receiverId, content: content.trim(), messageType })
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }, [socket])

  // -------------------------------
  // SOCKET LISTENERS
  // -------------------------------
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      const chat = currentChatRef.current
      if (!chat) return

      const activeChatId = chat.id?.toString()
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()
      const myId = currentUser?._id?.toString()

      if ([senderId, receiverId].includes(activeChatId) || senderId === myId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev
          return [...prev, message]
        })
      }
    }

    socket.on('message:receive', handleNewMessage)
    socket.on('typing:start', () => setIsTyping(true))
    socket.on('typing:stop', () => setIsTyping(false))

    return () => {
      socket.off('message:receive', handleNewMessage)
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [socket, currentUser])

  // -------------------------------
  // TYPING EVENTS
  // -------------------------------
  const startTyping = useCallback((receiverId) => {
    if (socket && receiverId) socket.emit('typing:start', receiverId)
  }, [socket])

  const stopTyping = useCallback((receiverId) => {
    if (socket && receiverId) socket.emit('typing:stop', receiverId)
  }, [socket])

  // -------------------------------
  // MARK MESSAGE AS READ
  // -------------------------------
  const markAsRead = useCallback(async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId)
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [])

  return {
    loading,
    conversations,
    messages,
    onlineUsers,
    isTyping,
    socketConnected: !!socket,
    fetchConversations,
    fetchMessages,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping,
    isUserOnline,
    markAsRead,
  }
}
