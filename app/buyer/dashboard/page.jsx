'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ShoppingCart,
  Heart,
  LayoutDashboard,
  Settings,
  LogOut,
  Camera,
  Menu,
  X,
  Package,
  DollarSign,
  Clock
} from 'lucide-react';

const BuyerDashboard = () => {
  const { user, loading: authLoading, apiCall, uploadProfileImage, getProfileImage, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    ordersPlaced: 15,
    wishlistItems: 8,
    totalSpent: 12300
  });
  const [recentActivity, setRecentActivity] = useState([
    { 
      date: '24 Aug 2025', 
      activity: 'Order #2031 delivered', 
      status: 'delivered',
      statusLabel: 'Delivered',
      statusColor: 'bg-green-100 text-green-800'
    },
    { 
      date: '23 Aug 2025', 
      activity: 'Added "Handcrafted Vase" to wishlist', 
      status: 'wishlist',
      statusLabel: 'Wishlist',
      statusColor: 'bg-pink-100 text-pink-800'
    },
    { 
      date: '22 Aug 2025', 
      activity: 'Order #2029 shipped', 
      status: 'shipped',
      statusLabel: 'Shipped',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Dashboard', href: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/buyer/dashboard/orders', icon: ShoppingCart },
    { name: 'Wishlist', href: '/buyer/dashboard/wishlist', icon: Heart },
    { name: 'Transactions', href: '/buyer/dashboard/transactions', icon: DollarSign },
    { name: 'Settings', href: '/buyer/dashboard/settings', icon: Settings }
  ];

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) {
      console.log('🔄 Dashboard: Waiting for auth to complete...')
      return;
    }

    // After loading completes, check if user exists
    if (!user) {
      console.log('❌ Dashboard: No user after auth completed, redirecting to login')
      router.push('/auth/login');
      return;
    }

    // Check if user is a buyer
    if (user.accountType !== 'buyer') {
      console.log('⚠️ Dashboard: User is not a buyer, redirecting to seller dashboard')
      router.push('/seller/dashboard');
      return;
    }

    // User is authenticated and is a buyer - load dashboard data
    console.log('✅ Dashboard: User authenticated, loading dashboard data')
    fetchDashboardData();
    fetchProfileImage();
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      // TODO: Implement actual API calls to fetch buyer-specific data
      // For now, using mock data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const result = await getProfileImage();
      if (result.success && result.imageUrl) {
        setProfileImage(result.imageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadProfileImage(file);
      if (result.success) {
        setProfileImage(result.data.imageUrl);
        alert('Profile image updated successfully!');
      } else {
        alert(result.message || 'Failed to upload image');
      }
    } catch (error) {
      alert('Error uploading image');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Buyer Portal</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={profileImage || '/placeholder-user.jpg'}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Camera className="h-3 w-3 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || user?.first_name || 'Buyer'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'buyer@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders Placed</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.ordersPlaced}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.wishlistItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ৳{dashboardData.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-gray-100">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.statusColor}`}>
                          {activity.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link href="/products">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Browse Products</span>
                  </button>
                </Link>
                <Link href="/buyer/dashboard/wishlist">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">View Wishlist</span>
                  </button>
                </Link>
                <Link href="/buyer/dashboard/orders">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">Track Orders</span>
                  </button>
                </Link>
                <Link href="/buyer/dashboard/settings">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default BuyerDashboard;
