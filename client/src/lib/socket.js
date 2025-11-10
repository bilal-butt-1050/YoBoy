import { io } from 'socket.io-client'
import cookie from 'cookie'

let socket = null

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  try {
    const parsed = cookie.parse(document.cookie || '')
    return parsed.token || null
  } catch (e) {
    console.warn('Failed to parse cookie:', e.message)
    return null
  }
}

// Connect socket (singleton per tab)
export function connectSocket({ url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', token } = {}) {
  if (socket && socket.connected) return socket

  const tokenToSend = token || getTokenFromCookie()

  socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
    auth: { token: tokenToSend },
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connect_error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason)
  })

  return socket
}

// Disconnect socket (clean per tab)
export function disconnectSocket() {
  if (!socket) return
  try {
    socket.disconnect()
    console.log('🔌 Socket manually disconnected')
    socket = null
  } catch (err) {
    console.warn('disconnectSocket error:', err.message)
  }
}

// ---------- Socket helpers ----------
export function joinChat(chatId, cb) {
  if (!socket) return
  socket.emit('chat:join', { chatId }, cb)
  console.log(`➡️ joinChat emitted: ${chatId}`)
}

export function leaveChat(chatId, cb) {
  if (!socket) return
  socket.emit('chat:leave', { chatId }, cb)
  console.log(`⬅️ leaveChat emitted: ${chatId}`)
}

export function sendMessage({ chatId, content, messageType = 'text' }, ack) {
  if (!socket) return
  socket.emit('message:send', { chatId, content, messageType }, ack)
  console.log(`➡️ message:send emitted to chat:${chatId}`, content)
}

export function markAsRead(messageId, ack) {
  if (!socket) return
  socket.emit('message:read', { messageId }, ack)
  console.log(`✔️ message:read emitted: ${messageId}`)
}

// ---------- Event listeners ----------
export function onNewMessage(handler) {
  if (!socket) return
  socket.on('message:receive', handler)
  console.log('👂 Listening for message:receive')
}

export function offNewMessage(handler) {
  if (!socket) return
  socket.off('message:receive', handler)
  console.log('🛑 Stopped listening for message:receive')
}

export function onMessageRead(handler) {
  if (!socket) return
  socket.on('message:read', handler)
  console.log('👂 Listening for message:read')
}

export function offMessageRead(handler) {
  if (!socket) return
  socket.off('message:read', handler)
  console.log('🛑 Stopped listening for message:read')
}

export function onUserStatus(handler) {
  if (!socket) return
  socket.on('user:status', handler)
  console.log('👂 Listening for user:status')
}

export function offUserStatus(handler) {
  if (!socket) return
  socket.off('user:status', handler)
  console.log('🛑 Stopped listening for user:status')
}

// Access socket directly if needed
export function getSocket() {
  return socket
}
