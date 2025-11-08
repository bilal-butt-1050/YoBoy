import { useState, useEffect, useCallback, useRef } from 'react'
import { connectSocket, disconnectSocket, joinChat, sendMessage, onNewMessage, offNewMessage, onMessageRead, offMessageRead, onUserStatus, offUserStatus } from '../lib/socket'
import { chatsAPI, messagesAPI } from '../lib/api'

export default function useChat(currentUser) {
  // State
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // Refs for stable references
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const activeChatRef = useRef(null)

  // Keep activeChat in sync with ref
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  // ==================== Socket Connection ====================
  const connectToSocket = useCallback(() => {
    if (!currentUser) return

    try {
      socketRef.current = connectSocket()
      console.log('🔌 Socket connected in useChat')
    } catch (err) {
      console.error('Socket connection failed:', err)
      // Retry after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connectToSocket, 3000)
    }
  }, [currentUser])

  // ==================== Fetch Initial Chat List ====================
  const fetchChats = useCallback(async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      const response = await chatsAPI.getUserChats()
      setChats(response.chats || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch chats:', err)
      setError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // ==================== Fetch Messages for Active Chat ====================
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return

    try {
      setLoading(true)
      const response = await messagesAPI.getMessages(chatId)
      setMessages(response.messages || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('Failed to load messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== Select Chat (with messages fetch) ====================
  const selectChat = useCallback(async (chat) => {
    if (!chat?._id) return

    setActiveChat(chat)
    await fetchMessages(chat._id)

    // Join socket room for this chat
    if (socketRef.current) {
      joinChat(chat._id, (ack) => {
        if (ack?.success) {
          console.log('✅ Joined chat room:', chat._id)
        }
      })
    }
  }, [fetchMessages])

  // ==================== Create or Get DM ====================
  const createOrGetDM = useCallback(async (otherUser) => {
    if (!otherUser?._id) return

    try {
      setLoading(true)
      const response = await chatsAPI.createOrGetDM(otherUser._id)
      const chat = response.chat

      // Add to chat list if not exists
      setChats((prev) => {
        const exists = prev.find((c) => c._id === chat._id)
        if (exists) return prev
        return [chat, ...prev]
      })

      // Select this chat
      await selectChat(chat)
      setError(null)
      
      return chat
    } catch (err) {
      console.error('Failed to create/get DM:', err)
      setError('Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }, [selectChat])

  // ==================== Send Message with Retry ====================
  const handleSendMessage = useCallback(async (content, retries = 3) => {
    if (!activeChat?._id || !content.trim() || !socketRef.current) return

    const trimmedContent = content.trim()
    
    try {
      setSending(true)
      
      // Send via socket with acknowledgment
      sendMessage(
        { chatId: activeChat._id, content: trimmedContent },
        async (ack) => {
          if (ack?.success) {
            console.log('✅ Message sent successfully')
            // Message will be received via socket event, no need to add manually
          } else {
            // Retry logic
            if (retries > 0) {
              console.warn(`⚠️ Message send failed, retrying... (${retries} left)`)
              setTimeout(() => handleSendMessage(content, retries - 1), 1000)
            } else {
              console.error('❌ Message send failed after retries')
              setError('Failed to send message')
            }
          }
          setSending(false)
        }
      )
    } catch (err) {
      console.error('Send message error:', err)
      if (retries > 0) {
        setTimeout(() => handleSendMessage(content, retries - 1), 1000)
      } else {
        setError('Failed to send message')
      }
      setSending(false)
    }
  }, [activeChat])

  // ==================== Socket Event Handlers ====================
  
  // Handle incoming messages
  const handleNewMessage = useCallback((message) => {
    console.log('📨 New message received:', message)

    // Add to messages if in active chat
    if (activeChatRef.current?._id === message.chat) {
      setMessages((prev) => [...prev, message])
    }

    // Update chat list (move to top, update last message)
    setChats((prev) => {
      const chatIndex = prev.findIndex((c) => c._id === message.chat)
      if (chatIndex === -1) return prev

      const updatedChats = [...prev]
      const chat = { ...updatedChats[chatIndex], lastMessage: message }
      updatedChats.splice(chatIndex, 1)
      return [chat, ...updatedChats]
    })
  }, [])

  // Handle message read status
  const handleMessageRead = useCallback(({ messageId, by }) => {
    console.log('✓✓ Message read:', messageId, 'by:', by)

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isRead: true } : msg
      )
    )
  }, [])

  // Handle user status changes
  const handleUserStatus = useCallback(({ userId, status }) => {
    console.log('👤 User status changed:', userId, status)

    // Update chat list to reflect online status
    setChats((prev) =>
      prev.map((chat) => {
        const updatedMembers = chat.members?.map((member) =>
          member._id === userId ? { ...member, status } : member
        )
        return { ...chat, members: updatedMembers }
      })
    )

    // Update active chat if user is in it
    if (activeChatRef.current) {
      setActiveChat((prev) => {
        if (!prev) return prev
        const updatedMembers = prev.members?.map((member) =>
          member._id === userId ? { ...member, status } : member
        )
        return { ...prev, members: updatedMembers }
      })
    }
  }, [])

  // ==================== Effects ====================

  // Initialize: Connect socket & fetch chats
  useEffect(() => {
    if (!currentUser) return

    connectToSocket()
    fetchChats()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      disconnectSocket()
    }
  }, [currentUser, connectToSocket, fetchChats])

  // Subscribe to socket events
  useEffect(() => {
    if (!socketRef.current) return

    onNewMessage(handleNewMessage)
    onMessageRead(handleMessageRead)
    onUserStatus(handleUserStatus)

    return () => {
      offNewMessage(handleNewMessage)
      offMessageRead(handleMessageRead)
      offUserStatus(handleUserStatus)
    }
  }, [handleNewMessage, handleMessageRead, handleUserStatus])

  // ==================== Return API ====================
  return {
    chats,
    activeChat,
    messages,
    loading,
    sending,
    error,
    selectChat,
    createOrGetDM,
    sendMessage: handleSendMessage,
    refreshChats: fetchChats,
  }
}