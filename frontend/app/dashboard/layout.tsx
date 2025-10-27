// frontend/app/dashboard/layout.tsx
'use client';

import {
  Bell,
  Calendar,
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Package,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/login');
          return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        try {
          const profileData = await apiClient.getProfile();
          console.log('Profile data received:', profileData);

          setUser(profileData.user || profileData);
          localStorage.setItem(
            'user',
            JSON.stringify(profileData.user || profileData)
          );

          setIsLoading(false);
        } catch (error: any) {
          console.error('Profile fetch error:', error);

          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login?error=session_expired');
          } else {
            if (storedUser) {
              setIsLoading(false);
            } else {
              router.push('/login');
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      current: pathname === '/dashboard',
    },

    {
      name: 'Users',
      icon: Users,
      href: '/dashboard/users',
      current: pathname === '/dashboard/users',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], // Only admins and managers can see this
    },
    {
      name: 'Clients',
      icon: Users,
      href: '/dashboard/clients',
      current: pathname === '/dashboard/clients',
    },

    {
      name: 'Rooms',
      icon: Hotel,
      href: '/dashboard/rooms',
      current: pathname === '/dashboard/rooms',
    },
    {
      name: 'Bookings',
      icon: Calendar,
      href: '/dashboard/bookings',
      current: pathname === '/dashboard/bookings',
    },
    {
      name: 'Categories',
      icon: Package,
      href: '/dashboard/categories',
      current: pathname === '/dashboard/categories',
    },
    {
      name: 'Products',
      icon: ShoppingBag,
      href: '/dashboard/products',
      current: pathname === '/dashboard/products',
    },
    {
      name: 'Restaurant Tables',
      icon: Utensils,
      href: '/dashboard/restaurant-tables',
      current: pathname === '/dashboard/restaurant-tables',
    },
    {
      name: 'Restaurant POS',
      icon: Monitor,
      href: '/dashboard/restaurant-orders/pos',
      current: pathname === '/dashboard/restaurant-orders/pos',
    },
    {
      name: 'Restaurant Orders',
      icon: Receipt,
      href: '/dashboard/restaurant-orders',
      current: pathname === '/dashboard/restaurant-orders',
    },
    {
      name: 'Guests',
      icon: Users,
      href: '/dashboard/guests',
      current: pathname === '/dashboard/guests',
    },
    {
      name: 'Reports',
      icon: TrendingUp,
      href: '/dashboard/reports',
      current: pathname === '/dashboard/reports',
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      current: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HotelPro</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
