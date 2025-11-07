'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, MessageCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './login.css'

export default function Login() {
  const { login, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailResent, setEmailResent] = useState(false)

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again or use email/password.')
    }
  }, [searchParams])

  useEffect(() => {
  if (user) router.replace('/dashboard')
}, [user, router])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)

    const result = await login(formData)

    if (!result.success) {
      setError(result.message)
      if (result.message?.toLowerCase().includes('verify')) setNeedsVerification(true)
    } else {
      router.push('/dashboard') // redirect after successful login
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
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include'
      })
      setEmailResent(true)
    } catch (err) {
      setError(err?.message || 'Failed to resend verification email')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleOAuthLogin = (provider) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    window.location.href = `${API_URL}/auth/${provider}`
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-icon-wrapper">
            <MessageCircle size={32} color="white" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to ChatFlow</p>
        </div>

        {error && <div className="alert error"><AlertCircle size={18} /> {error}</div>}

        {needsVerification && (
          <div className="alert info">
            <p>Your email isn’t verified yet. Please verify your account.</p>
            <button onClick={handleResendVerification} disabled={resendingEmail}>
              {resendingEmail ? 'Resending...' : 'Resend Verification Email'}
            </button>
            {emailResent && <p className="success-text">Verification email sent successfully!</p>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-links">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><Loader2 className="spin" size={20} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="divider">Or</div>

        <div className="socials">
          <button onClick={() => handleOAuthLogin('google')}>Sign in with Google</button>
        </div>

        <div className="footer">
          Don’t have an account? <Link href="/signup">Sign up for free</Link>
        </div>
      </div>
    </div>
  )}

