'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../../../lib/api';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Menu,
  X,
  Camera,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Settings
} from 'lucide-react';

const SellerProductsPage = () => {
  const { user, loading: authLoading, apiCall, uploadProfileImage, getProfileImage, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [profileImage, setProfileImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const fileInputRef = React.useRef(null);

  const sidebarItems = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/dashboard/products', icon: Package },
    { name: 'Orders', href: '/seller/dashboard/orders', icon: ShoppingCart },
    { name: 'Transactions', href: '/seller/dashboard/transactions', icon: DollarSign },
    { name: 'Settings', href: '/seller/dashboard/settings', icon: Settings }
  ];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.accountType !== 'supplier') {
      router.push('/buyer/dashboard');
      return;
    }

    fetchProducts();
    fetchProfileImage();
  }, [user, authLoading]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.PRODUCTS_MY(user._id));
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
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
      }
    } catch (error) {
      alert('Error uploading image');
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await apiCall(API_ENDPOINTS.PRODUCTS_DELETE(productId), {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const toggleStockStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      // Optimistic update
      setProducts(prev => prev.map(p => (p._id === productId || p.id === productId) ? { ...p, inStock: newStatus } : p));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inStock: newStatus })
      });

      if (!response.ok) {
        // Rollback
        setProducts(prev => prev.map(p => (p._id === productId || p.id === productId) ? { ...p, inStock: currentStatus } : p));
      }
    } catch (error) {
      console.error('Error toggling stock:', error);
      fetchProducts();
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Seller Portal</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

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
                  {user?.firstName || user?.first_name || 'Seller'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.companyName || user?.company_name || 'Company'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = item.href === '/seller/dashboard/products';
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
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">আমার পণ্যসমূহ | My Products</h1>
                  <p className="text-xs text-gray-500">মোট তালিকাভুক্ত পণ্য: {products.length} টি</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/seller/dashboard/products/quick-add">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200 transition-all font-bold text-sm">
                    <span>⚡ ৩০ সেকেন্ডে পণ্য যোগ</span>
                  </button>
                </Link>
                <Link href="/seller/dashboard/products/add">
                  <button className="hidden sm:flex items-center space-x-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xs font-semibold">
                    <Plus className="h-4 w-4" />
                    <span>বিস্তারিত ফর্ম</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Quick-Add Hero Banner for Sellers */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-5 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                📸
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg">সহজে ৩০ সেকেন্ডে পণ্য বিক্রি করুন</h3>
                <p className="text-xs text-emerald-100">
                  মোবাইল দিয়ে ছবি তুলুন, দরদাম ও পরিমাণ দিন আর তাৎক্ষণিক পাইকারি ক্রেতা পান!
                </p>
              </div>
            </div>
            <Link href="/seller/dashboard/products/quick-add" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-black text-sm shadow transition-all active:scale-95 whitespace-nowrap">
                ⚡ এখনই পণ্য আপলোড করুন →
              </button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="পণ্য বা ক্যাটাগরি খুঁজুন... / Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'সব ক্যাটাগরি (All Categories)' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isItemInStock = product.inStock !== false;
                return (
                  <div key={product._id || product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      {/* Product Image + Badges */}
                      <div className="relative">
                        <img
                          src={product.primaryImage || product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {/* InStock Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-sm ${
                            isItemInStock
                              ? 'bg-emerald-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {isItemInStock ? '✅ স্টক আছে' : '❌ স্টক শেষ'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 truncate text-base">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                        
                        <div className="flex items-baseline justify-between mb-3">
                          <p className="text-xl font-black text-emerald-600">
                            ৳{product.price?.toLocaleString() || 'N/A'}
                            <span className="text-xs font-normal text-gray-500 ml-1">
                              / {product.unit || 'unit'}
                            </span>
                          </p>
                          {product.minOrder && (
                            <span className="text-xs text-gray-400">
                              কমপক্ষে: {product.minOrder} {product.unit || ''}
                            </span>
                          )}
                        </div>

                        {/* 1-Click In-Stock Toggle Switch */}
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-700">
                            {isItemInStock ? 'স্টক পরিবর্তন করুন:' : 'স্টক আপডেট করুন:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleStockStatus(product._id || product.id, isItemInStock)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                              isItemInStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                                : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                            title="ক্লিক করে স্টকের অবস্থা পরিবর্তন করুন"
                          >
                            <span className={`w-2 h-2 rounded-full ${isItemInStock ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            <span>{isItemInStock ? 'স্টকে আছে' : 'স্টক শেষ'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="flex items-center space-x-2 pt-3">
                        <Link href={`/products/${product._id || product.id}`} className="flex-1">
                          <button className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold">
                            <Eye className="h-3.5 w-3.5" />
                            <span>দেখুন</span>
                          </button>
                        </Link>
                        <Link href={`/seller/dashboard/products/edit/${product._id || product.id}`}>
                          <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1">
                            <Edit className="h-3.5 w-3.5" />
                            <span>এডিট</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id || product.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📦
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'কোনো পণ্য পাওয়া যায়নি' : 'এখনও কোনো পণ্য যোগ করা হয়নি'}
              </h3>
              <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন'
                  : 'মাত্র ৩০ সেকেন্ডে মোবাইলের ক্যামেরা দিয়ে আপনার প্রথম কাঁচামালটি আপলোড করুন!'}
              </p>
              <Link href="/seller/dashboard/products/quick-add">
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-200 transition-all">
                  ⚡ ৩০ সেকেন্ডে নতুন পণ্য যোগ করুন
                </button>
              </Link>
            </div>
          )}
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

export default SellerProductsPage;
