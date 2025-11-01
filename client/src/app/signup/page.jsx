'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, MessageCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import './signup.css'

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/\d/)) strength++
    if (password.match(/[^a-zA-Z\d]/)) strength++
    return strength
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Sign up:', formData)
    setIsLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="signup-container">
      <div className="background-overlay"></div>

      <div className="signup-card">
        <div className="header">
          <Link href="/" className="brand">
            <div className="brand-icon"><MessageCircle /></div>
            <span>ChatFlow</span>
          </Link>
          <h1>Create Account</h1>
          <p>Join thousands of users worldwide</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label><User /> Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label><Mail /> Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label><Lock /> Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formData.password && (
              <div className="strength-bar">
                <div className={`strength strength-${passwordStrength}`}></div>
                <p>Password strength: {getStrengthText()}</p>
              </div>
            )}
          </div>

          <div className="field">
            <label><Lock /> Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="error-text">Passwords do not match</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="success-text"><CheckCircle /> Passwords match</p>
            )}
          </div>

          <div className="terms">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={isLoading || formData.password !== formData.confirmPassword}>
            {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight />
          </button>
        </form>

        <div className="divider">Or sign up with</div>

        <div className="socials">
          <button className="google-btn">Google</button>
          <button className="github-btn">GitHub</button>
        </div>

        <div className="signin-link">
          Already have an account? <Link href="/login">Sign in <Sparkles /></Link>
        </div>
      </div>
    </div>
  )
}
