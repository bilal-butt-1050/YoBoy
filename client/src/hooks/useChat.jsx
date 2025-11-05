'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { messagesAPI, usersAPI } from '@/lib/api'

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function useChat(currentUser) {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [isTyping, setIsTyping] = useState(false)
  
  const socketRef = useRef(null)
  const currentChatRef = useRef(null)

  // -------------------- SOCKET --------------------
  useEffect(() => {
    if (!currentUser) return

    const token = getTokenFromCookie()
    if (!token) return

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => console.log('Socket connected'))
    socket.on('disconnect', () => console.log('Socket disconnected'))

    socket.on('users:online', ids => setOnlineUsers(new Set(ids.map(id => id.toString()))))
    socket.on('user:online', ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId.toString()])))
    socket.on('user:offline', ({ userId }) => setOnlineUsers(prev => { const copy = new Set(prev); copy.delete(userId.toString()); return copy }))

    socket.on('message:receive', message => {
      const currentId = currentChatRef.current?.id
      const senderId = message.sender?._id?.toString() || message.sender?.toString()
      const receiverId = message.receiver?._id?.toString() || message.receiver?.toString()

      // if message belongs to current chat
      if (currentId && (senderId === currentId || receiverId === currentId)) {
        setMessages(prev => [...prev, message])
      }

      // update lastMessage in conversations
      setConversations(prev => prev.map(c => {
        const convId = c.user?._id?.toString() || c.user?.toString()
        if (convId === (senderId === currentUser?.id ? receiverId : senderId)) {
          return { ...c, lastMessage: message }
        }
        return c
      }))
    })

    socket.on('typing:start', ({ userId }) => {
      if (currentChatRef.current?.id === userId.toString()) setIsTyping(true)
    })
    socket.on('typing:stop', ({ userId }) => {
      if (currentChatRef.current?.id === userId.toString()) setIsTyping(false)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUser])

  // -------------------- API --------------------
  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await messagesAPI.getConversations()
      setConversations(res?.conversations || res || [])
    } catch (err) {
      console.error('fetchConversations', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return setMessages([])
    setLoading(true)
    try {
      const res = await messagesAPI.getMessages(userId)
      setMessages(res?.messages || res || [])
    } catch (err) {
      console.error('fetchMessages', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // -------------------- ACTIONS --------------------
  const joinConversation = useCallback((userId) => {
    if (!socketRef.current || !userId) return
    currentChatRef.current = { id: userId.toString() }
    socketRef.current.emit('conversation:join', userId.toString())
    fetchMessages(userId)
  }, [fetchMessages])

  const sendMessage = useCallback(({ receiverId, content }) => {
    if (!socketRef.current || !receiverId || !content?.trim()) return
    const optimistic = {
      _id: `temp_${Date.now()}`,
      content,
      sender: { _id: currentUser?._id || currentUser?.id, name: currentUser?.name },
      receiver: { _id: receiverId },
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages(prev => [...prev, optimistic])
    socketRef.current.emit('message:send', { receiverId: receiverId.toString(), content })

    setConversations(prev => {
      const copy = [...prev]
      const idx = copy.findIndex(c => (c.user?._id || c.user?.toString()) === receiverId.toString())
      if (idx > -1) copy[idx].lastMessage = optimistic
      else copy.unshift({ user: { _id: receiverId }, lastMessage: optimistic })
      return copy
    })
  }, [currentUser])

  const startTyping = useCallback((receiverId) => {
    if (socketRef.current && receiverId) socketRef.current.emit('typing:start', receiverId.toString())
  }, [])

  const stopTyping = useCallback((receiverId) => {
    if (socketRef.current && receiverId) socketRef.current.emit('typing:stop', receiverId.toString())
  }, [])

  return {
    loading,
    conversations,
    messages,
    onlineUsers,
    isTyping,
    socketConnected: !!socketRef.current,
    fetchConversations,
    fetchMessages,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping,
  }
}
