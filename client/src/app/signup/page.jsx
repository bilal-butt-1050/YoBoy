'use client'

import { useState , useEffect} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, AtSign, Mail, Lock, Eye, EyeOff, MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './signup.css'

export default function SignUp() {
  const { signup, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!')
    if (formData.password.length < 8) return setError('Password must be at least 8 characters')
    if (formData.username.length < 3) return setError('Username must be at least 3 characters')
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) return setError('Username can only contain letters, numbers, underscores')

    setLoading(true)
    const { confirmPassword, ...signupData } = formData
    const result = await signup(signupData)
    setLoading(false)

    if (result.success) {
      router.push('/login') // redirect to login after signup
    } else {
      setError(result.message)
    }
  }

  useEffect(() => {
  if (user) router.replace('/dashboard')
}, [user, router])

  return (
    <div className="signup-container">
      <div className="background-overlay"></div>
      <div className="signup-card">
        <div className="header">
          <div className="brand"><MessageCircle size={28} color="white" /> ChatFlow</div>
          <h1>Create Account</h1>
          <p>Join ChatFlow and start connecting</p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label><User size={16} /> Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={loading} placeholder="John Doe" />
          </div>

          <div className="field">
            <label><AtSign size={16} /> Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={loading} placeholder="johndoe" />
          </div>

          <div className="field">
            <label><Mail size={16} /> Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} placeholder="you@example.com" />
          </div>

          <div className="field">
            <label><Lock size={16} /> Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required disabled={loading} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label><Lock size={16} /> Confirm Password</label>
            <div className="password-wrapper">
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="terms">
            <input type="checkbox" id="terms" required disabled={loading} />
            <label htmlFor="terms">I agree to the <Link href="/terms">Terms</Link> & <Link href="/privacy">Privacy</Link></label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="spin" size={18} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="divider">Or sign up with</div>

        <div className="socials">
          <button type="button" onClick={() => window.location.href='/auth/google'}>Google</button>
        </div>

        <p className="signin-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
