import { Target, Heart, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function About() {
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'User-Centric Design',
      description: 'Every feature we build starts with understanding what our users need and want.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Innovation First',
      description: 'We constantly push boundaries to deliver cutting-edge messaging experiences.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Driven',
      description: 'Our community shapes our roadmap. We listen, learn, and evolve together.'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Quality Excellence',
      description: 'We never compromise on quality, security, or performance in our platform.'
    }
  ]

  const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-Founder', initials: 'SC' },
    { name: 'Marcus Rodriguez', role: 'CTO & Co-Founder', initials: 'MR' },
    { name: 'Emma Thompson', role: 'Head of Design', initials: 'ET' },
    { name: 'James Wilson', role: 'Head of Engineering', initials: 'JW' },
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-purple-900/20 to-dark-950"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Building the <span className="gradient-text">future</span> of communication
            </h1>
            <p className="text-xl text-gray-400">
              ChatFlow was born from a simple idea: communication should be instant, secure, and delightful. 
              We're on a mission to connect the world, one conversation at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Our Story</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  Founded in 2023, ChatFlow emerged from a shared frustration with existing messaging 
                  platforms that prioritized profit over user experience. Our founders, a team of 
                  passionate engineers and designers, set out to create something different.
                </p>
                <p>
                  Today, ChatFlow serves over 1 million users worldwide, processing millions of messages 
                  every day. But we're just getting started. Our vision extends far beyond simple 
                  messaging—we're building a platform that brings people together in meaningful ways.
                </p>
                <p>
                  Every line of code we write, every feature we ship, and every decision we make is 
                  guided by one principle: putting our users first. Your privacy, security, and 
                  satisfaction aren't just priorities—they're the foundation of everything we do.
                </p>
              </div>
            </div>
            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                    1M+
                  </div>
                  <div>
                    <div className="font-semibold">Active Users</div>
                    <div className="text-sm text-gray-400">Growing every day</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                    150+
                  </div>
                  <div>
                    <div className="font-semibold">Countries</div>
                    <div className="text-sm text-gray-400">Worldwide reach</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                    24/7
                  </div>
                  <div>
                    <div className="font-semibold">Support</div>
                    <div className="text-sm text-gray-400">Always here for you</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-xl text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-gray-400">The passionate people behind ChatFlow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 text-center bg-gradient-to-br from-primary-900/30 to-purple-900/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join us on this journey
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Be part of the ChatFlow community and experience the future of communication
            </p>
            <Link href="/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform duration-300">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}