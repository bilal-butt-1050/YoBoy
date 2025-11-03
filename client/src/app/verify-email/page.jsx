'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react'
import axios from 'axios'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token found.')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await axios.get(`${API_URL}/auth/verify-email/${token}`)
      
      setStatus('success')
      setMessage(response.data.message || 'Email verified successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(
        error.response?.data?.message || 
        'Failed to verify email. The link may be invalid or expired.'
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 gradient-text">
            Email Verification
          </h1>

          {/* Status Content */}
          <div className="mt-8 mb-6">
            {status === 'verifying' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
                <p className="text-gray-400">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Success! 🎉
                  </h2>
                  <p className="text-gray-400">{message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-400">{message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <Link href="/login">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform">
                  Go to Login
                </button>
              </Link>
            )}

            {status === 'error' && (
              <>
                <Link href="/login">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform">
                    Try Logging In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="w-full px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all">
                    Create New Account
                  </button>
                </Link>
              </>
            )}

            <Link href="/">
              <button className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}