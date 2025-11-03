'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, MessageCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import './login.css'

export default function Login() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again or use email/password.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)

    const result = await login(formData)

    if (!result.success) {
      setError(result.message)
      if (result.message?.toLowerCase().includes('verify')) {
        setNeedsVerification(true)
      }
    }

    setLoading(false)
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    setResendingEmail(true)
    setError('')
    setEmailResent(false)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      await axios.post(`${API_URL}/auth/resend-verification`, {
        email: formData.email
      })
      setEmailResent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleOAuthLogin = (provider) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    window.location.href = `${API_URL}/auth/${provider}`
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div
              style={{
                padding: '0.8rem',
                borderRadius: '1rem',
                background: 'linear-gradient(to bottom right, #8b5cf6, #6d28d9)'
              }}
            >
              <MessageCircle size={32} color="white" />
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to ChatFlow</p>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.4)',
              textAlign: 'center',
              color: '#f87171',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {needsVerification && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              textAlign: 'center',
              color: '#3b82f6',
              marginBottom: '1rem'
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              Your email isn’t verified yet. Please verify your account.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resendingEmail}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {resendingEmail ? 'Resending...' : 'Resend Verification Email'}
            </button>
            {emailResent && (
              <p style={{ marginTop: '0.5rem', color: '#16a34a' }}>
                Verification email sent successfully!
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-links">
            <label>
              <input type="checkbox" style={{ marginRight: '0.4rem' }} /> Remember me
            </label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={20} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="socials">
          <button onClick={() => handleOAuthLogin('google')}>Google</button>
          <button onClick={() => handleOAuthLogin('github')}>GitHub</button>
        </div>

        <div className="footer">
          Don’t have an account? <Link href="/signup">Sign up for free</Link>
        </div>
      </div>
    </div>
  )
}
