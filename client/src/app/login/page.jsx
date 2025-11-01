'use client'
import './login.css'
import { Mail, Lock } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button className="login-btn" type="submit">Sign In</button>
        </form>

        <div className="divider">Or continue with</div>
        <div className="socials">
          <button>Google</button>
          <button>GitHub</button>
        </div>

        <div className="footer">
          <p>By signing in, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  )
}
