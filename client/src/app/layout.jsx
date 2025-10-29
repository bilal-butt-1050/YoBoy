import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'ChatFlow - Modern Messaging Platform',
  description: 'Connect with friends and colleagues in real-time with our modern chat application',
  keywords: ['chat', 'messaging', 'real-time', 'communication', 'video calls'],
  authors: [{ name: 'ChatFlow Team' }],
  openGraph: {
    title: 'ChatFlow - Modern Messaging Platform',
    description: 'Connect with friends and colleagues in real-time',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
