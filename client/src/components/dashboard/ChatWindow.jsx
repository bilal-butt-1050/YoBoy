'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import { messagesAPI } from '../../lib/api'
import './chatWindow.css'

export default function ChatWindow({ selectedChat, currentUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat.id)
  }, [selectedChat])

  useEffect(() => scrollToBottom(), [messages])

  const fetchMessages = async (userId) => {
    try {
      const res = await messagesAPI.getMessages(userId)
      setMessages(res.data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await messagesAPI.sendMessage({
        receiver: selectedChat.id,
        content: newMessage.trim(),
      })
      setMessages([...messages, res.data])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getUserInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (!selectedChat) return (
    <div className="chat-window-empty">
      <h3>Select a conversation</h3>
    </div>
  )

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedChat.avatar ? <img src={selectedChat.avatar} alt={selectedChat.name} /> : getUserInitials(selectedChat.name)}
            {selectedChat.status === 'online' && <div className="online-dot" />}
          </div>
          <div>
            <h3>{selectedChat.name}</h3>
            <p>{selectedChat.status === 'online' ? 'Active now' : 'Offline'}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn"><Phone size={20} /></button>
          <button className="action-btn"><Video size={20} /></button>
          <button className="action-btn"><MoreVertical size={20} /></button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet.</p>
        ) : (
          messages.map(msg => {
            const isOwn = msg.sender._id === currentUser.id || msg.sender === currentUser.id
            return (
              <div key={msg._id} className={`message ${isOwn ? 'sent' : 'received'}`}>
                {!isOwn && <div className="message-avatar">{getUserInitials(selectedChat.name)}</div>}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                  </div>
                  <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <button type="button" className="input-action-btn"><Paperclip size={20} /></button>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="message-input"
        />
        <button type="button" className="input-action-btn"><Smile size={20} /></button>
        <button type="submit" className="send-btn" disabled={!newMessage.trim() || sending}>
          {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}
