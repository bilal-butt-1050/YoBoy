'use client'

import { useState } from 'react'
import { 
  User, Mail, Lock, Bell, Shield, Palette, Globe, 
  Smartphone, Eye, EyeOff, Save, X, Check, 
  Moon, Sun, Monitor, Languages, Volume2, Download,
  Trash2, LogOut, AlertCircle
} from 'lucide-react'
import './settings.css'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Account Settings State
  const [accountData, setAccountData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    phone: '+1 234 567 8900',
    bio: 'Passionate developer and tech enthusiast'
  })

  // Security Settings State
  const [securityData, setSecurityData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    biometricEnabled: false
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    messageAlerts: true,
    groupAlerts: true,
    callAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true
  })

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    accentColor: 'purple',
    fontSize: 'medium',
    compactMode: false,
    animations: true
  })

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends',
    onlineStatus: true,
    readReceipts: true,
    lastSeen: true,
    typingIndicator: true,
    allowGroupInvites: true
  })

  // Language & Region Settings
  const [languageSettings, setLanguageSettings] = useState({
    language: 'en',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })

  const handleAccountChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    })
  }

  const handleSecurityChange = (e) => {
    setSecurityData({
      ...securityData,
      [e.target.name]: e.target.value
    })
  }

  const handleNotificationToggle = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    })
  }

  const handleAppearanceChange = (key, value) => {
    setAppearanceSettings({
      ...appearanceSettings,
      [key]: value
    })
  }

  const handlePrivacyToggle = (key) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: !privacySettings[key]
    })
  }

  const handleLanguageChange = (key, value) => {
    setLanguageSettings({
      ...languageSettings,
      [key]: value
    })
  }

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    console.log('Settings saved:', {
      account: accountData,
      security: securityData,
      notifications: notificationSettings,
      appearance: appearanceSettings,
      privacy: privacySettings,
      language: languageSettings
    })
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested')
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'language', label: 'Language & Region', icon: Globe }
  ]

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor }
  ]

  const accentColors = [
    { value: 'purple', color: '#8b5cf6' },
    { value: 'blue', color: '#3b82f6' },
    { value: 'green', color: '#10b981' },
    { value: 'pink', color: '#ec4899' },
    { value: 'orange', color: '#f59e0b' }
  ]

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account settings and preferences</p>
      </div>

      {saveSuccess && (
        <div className="settings-success-alert">
          <Check className="settings-alert-icon" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="settings-content">
        {/* Sidebar */}
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="settings-tab-icon" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="settings-main">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <User className="settings-section-icon" />
                Account Information
              </h2>

              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={accountData.fullName}
                    onChange={handleAccountChange}
                    className="settings-input"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Email Address</label>
                  <div className="settings-input-group">
                    <Mail className="settings-input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={accountData.email}
                      onChange={handleAccountChange}
                      className="settings-input"
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={accountData.username}
                    onChange={handleAccountChange}
                    className="settings-input"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Phone Number</label>
                  <div className="settings-input-group">
                    <Smartphone className="settings-input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={accountData.phone}
                      onChange={handleAccountChange}
                      className="settings-input"
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Bio</label>
                  <textarea
                    name="bio"
                    value={accountData.bio}
                    onChange={handleAccountChange}
                    className="settings-textarea"
                    rows={4}
                  />
                </div>

                <button onClick={handleSave} className="settings-btn settings-btn-primary">
                  <Save className="settings-btn-icon" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <Shield className="settings-section-icon" />
                Security Settings
              </h2>

              <div className="settings-form">
                <h3 className="settings-subsection-title">Change Password</h3>

                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <div className="settings-password-input">
                    <Lock className="settings-input-icon" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      name="oldPassword"
                      value={securityData.oldPassword}
                      onChange={handleSecurityChange}
                      className="settings-input"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="settings-password-toggle"
                    >
                      {showOldPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">New Password</label>
                  <div className="settings-password-input">
                    <Lock className="settings-input-icon" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      className="settings-input"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="settings-password-toggle"
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Confirm New Password</label>
                  <div className="settings-password-input">
                    <Lock className="settings-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      className="settings-input"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="settings-password-toggle"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button onClick={handleSave} className="settings-btn settings-btn-primary">
                  Update Password
                </button>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Two-Factor Authentication
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Enable 2FA</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={() => setSecurityData({
                        ...securityData,
                        twoFactorEnabled: !securityData.twoFactorEnabled
                      })}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Biometric Authentication</h4>
                    <p>Use fingerprint or face recognition</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={securityData.biometricEnabled}
                      onChange={() => setSecurityData({
                        ...securityData,
                        biometricEnabled: !securityData.biometricEnabled
                      })}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <Bell className="settings-section-icon" />
                Notification Preferences
              </h2>

              <div className="settings-form">
                <h3 className="settings-subsection-title">Notification Channels</h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationToggle('emailNotifications')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Push Notifications</h4>
                    <p>Receive push notifications on this device</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={() => handleNotificationToggle('pushNotifications')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>SMS Notifications</h4>
                    <p>Receive important alerts via SMS</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationToggle('smsNotifications')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Alert Types
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Message Alerts</h4>
                    <p>Get notified for new messages</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.messageAlerts}
                      onChange={() => handleNotificationToggle('messageAlerts')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Group Alerts</h4>
                    <p>Notifications for group activities</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.groupAlerts}
                      onChange={() => handleNotificationToggle('groupAlerts')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Call Alerts</h4>
                    <p>Get notified for incoming calls</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.callAlerts}
                      onChange={() => handleNotificationToggle('callAlerts')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Sound & Vibration
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Sound</h4>
                    <p>Play sound for notifications</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.soundEnabled}
                      onChange={() => handleNotificationToggle('soundEnabled')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Vibration</h4>
                    <p>Vibrate on notifications</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.vibrationEnabled}
                      onChange={() => handleNotificationToggle('vibrationEnabled')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <Palette className="settings-section-icon" />
                Appearance Settings
              </h2>

              <div className="settings-form">
                <h3 className="settings-subsection-title">Theme</h3>
                <div className="settings-theme-options">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAppearanceChange('theme', option.value)}
                        className={`settings-theme-btn ${appearanceSettings.theme === option.value ? 'active' : ''}`}
                      >
                        <Icon className="settings-theme-icon" />
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Accent Color
                </h3>
                <div className="settings-color-options">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleAppearanceChange('accentColor', color.value)}
                      className={`settings-color-btn ${appearanceSettings.accentColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.color }}
                    >
                      {appearanceSettings.accentColor === color.value && <Check />}
                    </button>
                  ))}
                </div>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Font Size
                </h3>
                <select
                  value={appearanceSettings.fontSize}
                  onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                  className="settings-select"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Display Options
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Compact Mode</h4>
                    <p>Show more content on screen</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={appearanceSettings.compactMode}
                      onChange={() => handleAppearanceChange('compactMode', !appearanceSettings.compactMode)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Animations</h4>
                    <p>Enable smooth transitions and effects</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={appearanceSettings.animations}
                      onChange={() => handleAppearanceChange('animations', !appearanceSettings.animations)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <Lock className="settings-section-icon" />
                Privacy Settings
              </h2>

              <div className="settings-form">
                <h3 className="settings-subsection-title">Profile Visibility</h3>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                  className="settings-select"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Activity Status
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Online Status</h4>
                    <p>Show when you're online</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.onlineStatus}
                      onChange={() => handlePrivacyToggle('onlineStatus')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Read Receipts</h4>
                    <p>Let others know when you've read their messages</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.readReceipts}
                      onChange={() => handlePrivacyToggle('readReceipts')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Last Seen</h4>
                    <p>Show when you were last active</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.lastSeen}
                      onChange={() => handlePrivacyToggle('lastSeen')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Typing Indicator</h4>
                    <p>Show when you're typing</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.typingIndicator}
                      onChange={() => handlePrivacyToggle('typingIndicator')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <h3 className="settings-subsection-title" style={{ marginTop: '2rem' }}>
                  Groups & Invites
                </h3>

                <div className="settings-toggle-item">
                  <div className="settings-toggle-info">
                    <h4>Allow Group Invites</h4>
                    <p>Let others add you to groups</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowGroupInvites}
                      onChange={() => handlePrivacyToggle('allowGroupInvites')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Language & Region Settings */}
          {activeTab === 'language' && (
            <div className="settings-section settings-animate">
              <h2 className="settings-section-title">
                <Globe className="settings-section-icon" />
                Language & Region
              </h2>

              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-label">Language</label>
                  <select
                    value={languageSettings.language}
                    onChange={(e) => handleLanguageChange('language', e.target.value)}
                    className="settings-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Time Zone</label>
                  <select
                    value={languageSettings.timezone}
                    onChange={(e) => handleLanguageChange('timezone', e.target.value)}
                    className="settings-select"
                  >
                    <option value="UTC-12">UTC-12:00</option>
                    <option value="UTC-11">UTC-11:00</option>
                    <option value="UTC-10">UTC-10:00</option>
                    <option value="UTC-9">UTC-09:00</option>
                    <option value="UTC-8">UTC-08:00</option>
                    <option value="UTC-7">UTC-07:00</option>
                    <option value="UTC-6">UTC-06:00</option>
                    <option value="UTC-5">UTC-05:00</option>
                    <option value="UTC-4">UTC-04:00</option>
                    <option value="UTC-3">UTC-03:00</option>
                    <option value="UTC-2">UTC-02:00</option>
                    <option value="UTC-1">UTC-01:00</option>
                    <option value="UTC+0">UTC+00:00</option>
                    <option value="UTC+1">UTC+01:00</option>
                    <option value="UTC+2">UTC+02:00</option>
                    <option value="UTC+3">UTC+03:00</option>
                    <option value="UTC+4">UTC+04:00</option>
                    <option value="UTC+5">UTC+05:00</option>
                    <option value="UTC+6">UTC+06:00</option>
                    <option value="UTC+7">UTC+07:00</option>
                    <option value="UTC+8">UTC+08:00</option>
                    <option value="UTC+9">UTC+09:00</option>
                    <option value="UTC+10">UTC+10:00</option>
                    <option value="UTC+11">UTC+11:00</option>
                    <option value="UTC+12">UTC+12:00</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Date Format</label>
                  <select
                    value={languageSettings.dateFormat}
                    onChange={(e) => handleLanguageChange('dateFormat', e.target.value)}
                    className="settings-select"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Time Format</label>
                  <select
                    value={languageSettings.timeFormat}
                    onChange={(e) => handleLanguageChange('timeFormat', e.target.value)}
                    className="settings-select"
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-danger-zone">
        <h3 className="settings-danger-title">
          <AlertCircle className="settings-danger-icon" />
          Danger Zone
        </h3>
        <div className="settings-danger-actions">
          <button className="settings-btn settings-btn-danger">
            <Download className="settings-btn-icon" />
            Export Data
          </button>
          <button onClick={handleDeleteAccount} className="settings-btn settings-btn-danger">
            <Trash2 className="settings-btn-icon" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}