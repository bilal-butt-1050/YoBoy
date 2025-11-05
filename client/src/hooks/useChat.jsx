'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { messagesAPI } from '@/lib/api'

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

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    const token = getTokenFromCookie()
    if (!token || !currentUser?._id) return

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('socket connected ✅')
    })

    socket.on('users:online', (list) => setOnlineUsers(new Set(list)))

    socket.on('user:online', ({ userId }) =>
      setOnlineUsers((prev) => new Set([...prev, userId]))
    )

    socket.on('user:offline', ({ userId }) =>
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    )

    // receive message for both sender + receiver
    socket.on('message:receive', (msg) => {
      const currentChat = currentChatRef.current
      if (!currentChat) return

      const activeChatId = currentChat.id?.toString()
      if (
        msg.sender._id === activeChatId ||
        msg.receiver._id === activeChatId ||
        msg.sender._id === currentUser._id
      ) {
        setMessages((prev) => [...prev, msg])
      }

      // update conversation preview
      setConversations((prev) => {
        const copy = [...prev]
        const idx = copy.findIndex(
          (c) =>
            (c.user?._id || c.user) ===
            (msg.sender._id === currentUser._id
              ? msg.receiver._id
              : msg.sender._id)
        )

        if (idx > -1) copy[idx].lastMessage = msg
        else
          copy.unshift({
            user:
              msg.sender._id === currentUser._id
                ? msg.receiver
                : msg.sender,
            lastMessage: msg,
          })
        return copy
      })
    })

    // acknowledgement of sent message
    socket.on('message:sent', (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id)
        return exists ? prev : [...prev, msg]
      })
    })

    socket.on('typing:start', () => setIsTyping(true))
    socket.on('typing:stop', () => setIsTyping(false))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUser])

  // ---------------- FETCHERS ----------------
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await messagesAPI.getConversations()
      setConversations(data || [])
    } catch (err) {
      console.error('fetchConversations error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (receiverId) => {
    try {
      setLoading(true)
      const data = await messagesAPI.getMessages(receiverId)
      setMessages(data || [])
    } catch (err) {
      console.error('fetchMessages error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ---------------- ACTIONS ----------------
  const joinConversation = useCallback(
    (userId) => {
      if (!socketRef.current || !userId) return
      currentChatRef.current = { id: userId.toString() }
      socketRef.current.emit('conversation:join', userId.toString())
      fetchMessages(userId)
    },
    [fetchMessages]
  )

  const sendMessage = useCallback(
    async ({ receiverId, content, messageType = 'text' }) => {
      if (!socketRef.current || !receiverId || !content?.trim()) return
      const socket = socketRef.current

      try {
        const msg = await messagesAPI.sendMessage({
          receiverId,
          content,
          messageType,
        })

        // Emit through socket after successful DB save
        socket.emit('message:send', msg)
        setMessages((prev) => [...prev, msg])

        // update conversation preview instantly
        setConversations((prev) => {
          const copy = [...prev]
          const idx = copy.findIndex(
            (c) => (c.user?._id || c.user) === receiverId
          )
          if (idx > -1) copy[idx].lastMessage = msg
          else copy.unshift({ user: { _id: receiverId }, lastMessage: msg })
          return copy
        })
      } catch (err) {
        console.error('sendMessage error:', err)
      }
    },
    []
  )

  const startTyping = useCallback((receiverId) => {
    if (!socketRef.current) return
    socketRef.current.emit('typing:start', receiverId)
  }, [])

  const stopTyping = useCallback((receiverId) => {
    if (!socketRef.current) return
    socketRef.current.emit('typing:stop', receiverId)
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
