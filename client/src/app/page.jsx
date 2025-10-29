import Link from 'next/link'
import { ArrowRight, MessageSquare, Shield, Zap, Users, Video, Lock, Sparkles, CheckCircle, TrendingUp } from 'lucide-react'

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

  const benefits = [
    'Unlimited messages',
    'HD video calls',
    'File sharing up to 2GB',
    '24/7 customer support'
  ]

  const stats = [
    { value: '1M+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
    { value: '50M+', label: 'Messages Sent', icon: <MessageSquare className="w-5 h-5" /> },
    { value: '99.9%', label: 'Uptime', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '150+', label: 'Countries', icon: <Sparkles className="w-5 h-5" /> }
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-purple-900/20 to-dark-950"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full animate-fade-in-scale">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-300 font-medium">Now live and ready to connect</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="gradient-text block">Connect</span>
                <span className="text-white">with anyone, anywhere, anytime</span>
              </h2>
              
              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Experience the next generation of messaging. Fast, secure, and designed for the way you communicate today.
              </p>
            </div>



            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/signup">
                <button className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold text-lg hover:scale-105 hover:shadow-glow transition-all duration-300 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/about">
                <button className="px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                  Learn More
                </button>
              </Link>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-center mb-2 text-primary-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white/40 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-radial opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-300">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to <span className="gradient-text">stay connected</span>
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features designed for modern communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex justify-center -space-x-4 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 border-2 border-dark-950 flex items-center justify-center text-sm font-bold"
                  >
                    {i}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-dark-950 flex items-center justify-center text-xs font-bold">
                  +1M
                </div>
              </div>
              
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-2xl md:text-3xl font-semibold text-white">
                "The best messaging platform I've ever used. ChatFlow has transformed how our team communicates."
              </p>
              
              <div className="pt-4">
                <p className="font-semibold text-lg">Sarah Johnson</p>
                <p className="text-gray-400">CEO, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 text-center bg-gradient-to-br from-primary-900/30 to-purple-900/30 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to get <span className="gradient-text">started?</span>
              </h2>
              <p className="text-xl text-gray-400">
                Join millions of users who trust ChatFlow for their daily communication
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/signup">
                  <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold text-lg hover:scale-105 hover:shadow-glow transition-all duration-300 inline-flex items-center space-x-2">
                    <span>Create Free Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}