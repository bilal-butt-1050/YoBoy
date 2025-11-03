'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { AuthProvider } from '../context/AuthContext'
import { SocketProvider } from '../context/SocketContext'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  
  // Hide footer on dashboard and chat pages
  const hideFooter = pathname === '/dashboard' || pathname === '/chat'
  // Hide navbar on dashboard
  const hideNavbar = pathname === '/dashboard'

  return (
    <html lang="en">
      <head>
        <title>ChatFlow - Modern Messaging Platform</title>
        <meta name="description" content="Connect with friends and colleagues in real-time with our modern chat application" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col">
              {!hideNavbar && <Navbar />}
              <main className={hideFooter ? 'flex-grow' : 'flex-grow'}>{children}</main>
              {!hideFooter && <Footer />}
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}