// lib/socket.js (client)
import { io } from 'socket.io-client'
import cookie from 'cookie'

/**
 * Simple singleton socket helper.
 * - Reads token from document.cookie (cookie name: token)
 * - Connects with { auth: { token } } AND withCredentials true (so server can read cookie too).
 * - Exposes useful methods and event registration helpers.
 */

let socket = null

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  try {
    const parsed = cookie.parse(document.cookie || '')
    return parsed.token || null
  } catch (e) {
    return null
  }
}

export function connectSocket({ url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', token } = {}) {
  if (socket && socket.connected) return socket

  const tokenToSend = token || getTokenFromCookie()

  socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
    auth: { token: tokenToSend }, // fallback when cookie is not forwarded
  })

  socket.on('connect', () => {
    console.log('✅ socket connected', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('⚠️ socket connect_error', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 socket disconnected', reason)
  })

  return socket
}

export function disconnectSocket() {
  try {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  } catch (err) {
    console.warn('disconnectSocket error', err)
  }
}

// --------- helpers ------------
// Join a chat room (server verifies membership)
export function joinChat(chatId, cb) {
  if (!socket) return
  socket.emit('chat:join', { chatId }, cb)
}

export function leaveChat(chatId, cb) {
  if (!socket) return
  socket.emit('chat:leave', { chatId }, cb)
}

// Send message; ack receives { success, message }
export function sendMessage({ chatId, content, messageType = 'text' }, ack) {
  if (!socket) return
  socket.emit('message:send', { chatId, content, messageType }, ack)
}

// Mark a message as read
export function markAsRead(messageId, ack) {
  if (!socket) return
  socket.emit('message:read', { messageId }, ack)
}

// Convenience event binding
export function onNewMessage(handler) {
  if (!socket) return
  socket.on('message:receive', handler)
}
export function offNewMessage(handler) {
  if (!socket) return
  socket.off('message:receive', handler)
}

export function onMessageRead(handler) {
  if (!socket) return
  socket.on('message:read', handler)
}
export function offMessageRead(handler) {
  if (!socket) return
  socket.off('message:read', handler)
}

export function onUserStatus(handler) {
  if (!socket) return
  socket.on('user:status', handler)
}
export function offUserStatus(handler) {
  if (!socket) return
  socket.off('user:status', handler)
}

// Export the socket instance for advanced usage (if needed)
export function getSocket() {
  return socket
}
