'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, MessageCircle, Loader2, AtSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './signup.css'

export default function SignUp() {
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setLoading(true)
    const { confirmPassword, ...signupData } = formData
    const result = await signup(signupData)
    if (!result.success) setError(result.message)
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="signup-container">
      <div className="background-overlay"></div>

      <div className="signup-card">
        <div className="header">
          <div className="brand">
            <span className="brand-icon"><MessageCircle size={28} color="white" /></span>
            ChatFlow
          </div>
          <h1>Create Account</h1>
          <p>Join ChatFlow and start connecting</p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="name"><User size={16}/> Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="John Doe"
            />
          </div>

          <div className="field">
            <label htmlFor="username"><AtSign size={16}/> Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="johndoe"
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>

          <div className="field">
            <label htmlFor="email"><Mail size={16}/> Email Address</label>
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

          <div className="field">
            <label htmlFor="password"><Lock size={16}/> Password</label>
            <div className="password-wrapper">
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword"><Lock size={16}/> Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="terms">
            <input type="checkbox" id="terms" required disabled={loading}/>
            <label htmlFor="terms">
              I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18}/>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="divider">Or sign up with</div>

        <div className="socials">
          <button type="button">Google</button>
          <button type="button">GitHub</button>
        </div>

        <p className="signin-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}