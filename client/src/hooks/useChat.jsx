import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  connectSocket, disconnectSocket, 
  joinChat, sendMessage, 
  onNewMessage, offNewMessage, 
  onMessageRead, offMessageRead, 
  onUserStatus, offUserStatus 
} from '../lib/socket'
import { chatsAPI, messagesAPI } from '../lib/api'

export default function useChat(currentUser) {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const socketRef = useRef(null)
  const reconnectRef = useRef(null)
  const activeChatRef = useRef(null)

  // Keep activeChat ref in sync
  useEffect(() => { activeChatRef.current = activeChat }, [activeChat])

  // ------------------ Socket Connection ------------------
  const connectToSocket = useCallback(() => {
    if (!currentUser) return
    try {
      socketRef.current = connectSocket()
      console.log('🔌 Socket connected in useChat:', socketRef.current.id)
    } catch (err) {
      console.error('Socket connection failed:', err)
      reconnectRef.current = setTimeout(connectToSocket, 3000)
    }
  }, [currentUser])

  // ------------------ Fetch Chats ------------------
  const fetchChats = useCallback(async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      const res = await chatsAPI.getUserChats()
      setChats(res.chats || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch chats:', err)
      setError('Failed to load chats')
    } finally { setLoading(false) }
  }, [currentUser])

  // ------------------ Fetch Messages ------------------
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return
    try {
      setLoading(true)
      const res = await messagesAPI.getMessages(chatId)
      setMessages(res.messages || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setMessages([])
      setError('Failed to load messages')
    } finally { setLoading(false) }
  }, [])

  // ------------------ Select Chat ------------------
  const selectChat = useCallback(async (chat) => {
    if (!chat?._id) return
    setActiveChat(chat)
    await fetchMessages(chat._id)

    if (socketRef.current) {
      joinChat(chat._id, (ack) => {
        if (ack?.success) console.log('✅ Joined chat room:', chat._id)
      })
    }
  }, [fetchMessages])

  // ------------------ Create/Get DM ------------------
  const createOrGetDM = useCallback(async (otherUser) => {
    if (!otherUser?._id) return
    try {
      setLoading(true)
      const res = await chatsAPI.createOrGetDM(otherUser._id)
      const chat = res.chat

      setChats(prev => prev.find(c => c._id === chat._id) ? prev : [chat, ...prev])
      await selectChat(chat)
      setError(null)
      return chat
    } catch (err) {
      console.error('Failed to create/get DM:', err)
      setError('Failed to start conversation')
    } finally { setLoading(false) }
  }, [selectChat])

  // ------------------ Send Message ------------------
  const handleSendMessage = useCallback((content, retries = 3) => {
    if (!activeChatRef.current?._id || !content.trim() || !socketRef.current) return

    const trimmed = content.trim()
    setSending(true)

    sendMessage({ chatId: activeChatRef.current._id, content: trimmed }, (ack) => {
      setSending(false)
      if (ack?.success) console.log('✅ Message sent:', trimmed)
      else if (retries > 0) {
        console.warn(`⚠️ Message failed, retrying (${retries} left)`)
        setTimeout(() => handleSendMessage(content, retries - 1), 1000)
      } else {
        console.error('❌ Message send failed after retries')
        setError('Failed to send message')
      }
    })
  }, [])

  // ------------------ Socket Event Handlers ------------------
  const handleNewMessage = useCallback((message) => {
    console.log('📨 New message:', message)
    if (activeChatRef.current?._id === message.chat) setMessages(prev => [...prev, message])

    setChats(prev => {
      const idx = prev.findIndex(c => c._id === message.chat)
      if (idx === -1) return prev
      const updated = [...prev]
      updated.splice(idx, 1)
      return [{ ...prev[idx], lastMessage: message }, ...updated]
    })
  }, [])

  const handleMessageRead = useCallback(({ messageId, by }) => {
    console.log('✓✓ Message read:', messageId, 'by:', by)
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRead: true } : m))
  }, [])

  const handleUserStatus = useCallback(({ userId, status }) => {
    console.log('👤 User status changed:', userId, status)
    setChats(prev => prev.map(chat => ({
      ...chat,
      members: chat.members?.map(m => m._id === userId ? { ...m, status } : m)
    })))
  }, [])

  // ------------------ Effects ------------------
  useEffect(() => {
    if (!currentUser) return
    connectToSocket()
    fetchChats()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      disconnectSocket()
    }
  }, [currentUser, connectToSocket, fetchChats])

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
