'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

const BuyerWishlist = () => {
  // Mock wishlist data
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Handcrafted Vase',
      price: 1200,
      image: '/placeholder.jpg',
      seller: 'Artisan Crafts',
      inStock: true
    },
    {
      id: 2,
      name: 'Wooden Bowl Set',
      price: 850,
      image: '/placeholder.jpg',
      seller: 'Wood Works',
      inStock: true
    },
    {
      id: 3,
      name: 'Ceramic Tea Set',
      price: 2100,
      image: '/placeholder.jpg',
      seller: 'Pottery Studio',
      inStock: false
    }
  ]);

  const handleRemove = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">Items you want to buy later</p>
          </div>
          <Link href="/buyer/dashboard">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.inStock && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {item.seller}</p>
                  <p className="text-xl font-bold text-blue-600 mb-4">৳{item.price.toLocaleString()}</p>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={!item.inStock}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                        item.inStock
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Add items you like to your wishlist</p>
            <Link href="/products">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerWishlist;
