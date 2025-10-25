// frontend/app/page.tsx
'use client';

import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './components/ui/Button';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Building2,
      title: 'Multi-Property Management',
      description:
        'Manage multiple hotels and properties from a single dashboard',
    },
    {
      icon: Calendar,
      title: 'Smart Booking System',
      description: 'Real-time availability and automated booking confirmations',
    },
    {
      icon: Users,
      title: 'Guest Management',
      description: 'Complete guest profiles and personalized service tracking',
    },
    {
      icon: DollarSign,
      title: 'Revenue Analytics',
      description: 'Track revenue, occupancy rates, and financial performance',
    },
    {
      icon: BarChart3,
      title: 'Advanced Reporting',
      description: 'Comprehensive reports and insights for better decisions',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee',
    },
  ];

  const benefits = [
    'No setup fees or hidden costs',
    'Cancel anytime with no penalties',
    'Free updates and new features',
    '24/7 customer support',
    'Mobile apps for iOS and Android',
    'Unlimited users and properties',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                HotelSuite
              </span>
            </div>
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="h-4 w-4" />
              <span>Trusted by 500+ hotels worldwide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Hotel Management
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              The all-in-one platform to manage your hotel operations, bookings,
              guests, and revenue with ease. Start your free trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-4"
                onClick={() => router.push('/signup-company')}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-4"
                onClick={() => router.push('/login')}
              >
                Sign In to Your Account
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial • Setup in 5 minutes
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to run your hotel
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for modern hotel management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why hotels choose HotelSuite
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join hundreds of successful hotels that have streamlined their
                operations and increased revenue with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <p className="text-blue-100 text-sm uppercase tracking-wide mb-2">
                  Special Offer
                </p>
                <h3 className="text-3xl font-bold mb-2">
                  Start Free for 14 Days
                </h3>
                <p className="text-blue-100">
                  No credit card required. Cancel anytime.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => router.push('/signup-company')}
              >
                Start Your Free Trial
              </Button>
              <p className="text-center text-blue-100 text-sm mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-white font-semibold underline hover:no-underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your hotel management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get started today and see why thousands of hotels trust HotelSuite
            to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => router.push('/signup-company')}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">HotelSuite</span>
          </div>
          <p className="mb-4">© 2025 HotelSuite. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
