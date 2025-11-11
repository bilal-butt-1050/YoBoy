'use client'

import { useState, useEffect } from 'react'
import { Camera, Mail, Calendar, User as UserIcon, AtSign, Edit2, Save, X } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './profile.css'

export default function Profile() {
  const { user, loading, checkAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    avatar: '', // will hold base64 or URL
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // Convert image to base64 string
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setFormData((prev) => ({ ...prev, avatar: base64String }))
      setAvatarPreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      // send as JSON, since backend expects base64 avatar
      const payload = { ...formData }

      console.log('🧠 Sending profile update:', payload)

      await usersAPI.updateProfile(payload)
      await checkAuth() // refresh user info
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Profile save error:', err)
      setError(err.message || 'Failed to save changes')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
    })
    setAvatarPreview(user.avatar || null)
    setIsEditing(false)
    setError(null)
  }

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??'

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  if (loading || !user)
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
      </div>
    )

  return (
    <div className="profile-container profile-animate">
      <div className="profile-header">
        <div className="profile-header-content">
          <h2>My Profile</h2>
          <p>Manage your personal info and preferences</p>
          {success && <div className="profile-btn profile-btn-primary">Profile updated successfully!</div>}
          {error && <div className="profile-btn profile-btn-error">{error}</div>}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            {avatarPreview ? (
              <img className="profile-avatar" src={avatarPreview} alt={formData.name} />
            ) : (
              <div className="profile-avatar-placeholder">{getUserInitials(user.name)}</div>
            )}
            <label className="profile-avatar-edit-btn">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            {isEditing ? (
              <>
                {[
                  { icon: UserIcon, label: 'Full Name', name: 'name', type: 'text' },
                  { icon: AtSign, label: 'Username', name: 'username', type: 'text' },
                  { icon: Mail, label: 'Email', name: 'email', type: 'email' },
                ].map((field) => (
                  <div key={field.name} className="profile-form-group">
                    <label className="profile-form-label">
                      <field.icon size={18} /> {field.label}
                    </label>
                    <input
                      className="profile-form-input"
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <Edit2 size={18} /> Bio
                  </label>
                  <textarea
                    className="profile-form-textarea"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    maxLength="150"
                  />
                  <span className="profile-info-value">{formData.bio.length}/150</span>
                </div>

                <div className="profile-btn-group">
                  <button className="profile-btn profile-btn-primary" onClick={handleSave}>
                    <Save size={18} /> Save Changes
                  </button>
                  <button className="profile-btn profile-btn-secondary" onClick={handleCancel}>
                    <X size={18} /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-email">@{user.username}</p>

                <div className="profile-btn-group">
                  <button className="profile-btn profile-btn-primary" onClick={() => setIsEditing(true)}>
                    <Edit2 size={18} /> Edit Profile
                  </button>
                </div>

                <ul className="profile-info-list">
                  <li className="profile-info-item">
                    <Mail size={20} />
                    <div>
                      <span className="profile-info-label">Email:   </span>
                      <span className="profile-info-value">{user.email}</span>
                    </div>
                  </li>
                  <li className="profile-info-item">
                    <Calendar size={20} />
                    <div>
                      <span className="profile-info-label">Joined:  </span>
                      <span className="profile-info-value">{formatDate(user.createdAt)}</span>
                    </div>
                  </li>
                </ul>

                <div className="profile-section">
                  <h4 className="profile-section-title">About</h4>
                  <p className="profile-info-value">{user.bio}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
