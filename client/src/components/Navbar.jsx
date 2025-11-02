'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MessageCircle, Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ]

  const authLinks = isAuthenticated
    ? [
        { href: '/chat', label: 'Chat' },
      ]
    : [
        { href: '/login', label: 'Login' },
        { href: '/signup', label: 'Sign Up' },
      ]

  const navLinks = [...publicLinks, ...authLinks]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ChatFlow</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-semibold">{user.name?.charAt(0)}</span>
                  </div>
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="font-semibold">{user.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}