'use client'

import { useState } from 'react'
import { Camera, Mail, Calendar, User as UserIcon, AtSign, Edit2, Save, X } from 'lucide-react'
import { usersAPI } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './profile.css'

export default function Profile() {
  const { user, loading, checkAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSave = async () => {
    try {
      await usersAPI.updateProfile(formData)
      await checkAuth()
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = () => console.log('Upload avatar')

  const getUserInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  if (loading || !user) return <div className="loading-state">Loading...</div>

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <h2>My Profile</h2>
        <p>Manage your personal info and preferences</p>
        {success && <div className="success-toast">Profile updated successfully!</div>}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-banner"></div>

          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : getUserInitials(user.name)}
              </div>
              <button className="avatar-upload-btn" onClick={handleAvatarUpload} title="Change avatar">
                <Camera size={18} />
              </button>
            </div>
          </div>

          <div className="profile-body">
            {isEditing ? (
              <div className="profile-edit-form">
                {[
                  { icon: UserIcon, label: 'Full Name', name: 'name', type: 'text' },
                  { icon: AtSign, label: 'Username', name: 'username', type: 'text' },
                  { icon: Mail, label: 'Email', name: 'email', type: 'email' },
                ].map((field) => (
                  <div key={field.name} className="form-group">
                    <label htmlFor={field.name}>
                      <field.icon size={18} />
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label htmlFor="bio">
                    <Edit2 size={18} />
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    maxLength="150"
                  />
                  <span className="char-count">{formData.bio.length}/150</span>
                </div>

                <div className="form-actions">
                  <button className="btn-save" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                <div className="profile-name-section">
                  <h3>{user.name}</h3>
                  <p className="profile-username">@{user.username}</p>
                </div>

                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <Edit2 size={18} />
                  Edit Profile
                </button>

                <div className="profile-info-grid">
                  <div className="info-item">
                    <Mail size={20} />
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Calendar size={20} />
                    <div className="info-content">
                      <span className="info-label">Joined</span>
                      <span className="info-value">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-bio-section">
                  <h4>About</h4>
                  <p>{user.bio}</p>
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Friends</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Chats</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
