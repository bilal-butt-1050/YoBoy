import Link from 'next/link'
import { ArrowRight, MessageSquare, Shield, Zap, Users, Video, Lock } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Real-time Messaging',
      description: 'Send and receive messages instantly with our lightning-fast infrastructure'
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video & Voice Calls',
      description: 'Connect face-to-face with crystal-clear video and audio quality'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'End-to-End Encryption',
      description: 'Your conversations are private and secure with military-grade encryption'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Group Chats',
      description: 'Create groups and channels to collaborate with teams and communities'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Experience blazing-fast performance with optimized real-time sync'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'We never sell your data. Your privacy is our top priority'
    }
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-purple-900/20 to-dark-950"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">Now live and ready to connect</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold">
              <span className="gradient-text">Connect</span> with anyone,
              <br />
              <span className="text-white">anywhere, anytime</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of messaging. Fast, secure, and designed for the way you communicate today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <button className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/about">
                <button className="px-8 py-4 glass rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div>
                <div className="text-3xl font-bold gradient-text">1M+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">50M+</div>
                <div className="text-sm text-gray-400">Messages Sent</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to <span className="gradient-text">stay connected</span>
            </h2>
            <p className="text-xl text-gray-400">Powerful features designed for modern communication</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 text-center bg-gradient-to-br from-primary-900/30 to-purple-900/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join millions of users who trust ChatFlow for their daily communication
            </p>
            <Link href="/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 inline-flex items-center space-x-2">
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}