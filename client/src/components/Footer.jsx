import Link from 'next/link'
import { MessageCircle, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Sign Up' },
  ]

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/contact', label: 'Contact Us' },
  ]

  const socialLinks = [
    { href: 'https://github.com', icon: <Github className="w-5 h-5" />, label: 'GitHub' },
    { href: 'https://twitter.com', icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
    { href: 'https://linkedin.com', icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn' },
    { href: 'mailto:contact@chatflow.com', icon: <Mail className="w-5 h-5" />, label: 'Email' },
  ]

  return (
    <footer className="glass border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ChatFlow</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect, communicate, and collaborate in real-time with our modern messaging platform.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by ChatFlow Team</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group hover:scale-110"
                >
                  <div className="text-gray-400 group-hover:text-white transition-colors">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-gray-400 text-sm">
              © {currentYear} ChatFlow. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/sitemap" className="hover:text-primary-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}