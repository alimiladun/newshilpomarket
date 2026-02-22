'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';

const BuyerTransactions = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalRefunds: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.accountType !== 'buyer') {
      router.push('/seller/dashboard');
      return;
    }

    fetchTransactions();
  }, [user, authLoading]);

  const fetchTransactions = async () => {
    if (!user || !user._id) {
      console.log('User not ready yet');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching transactions for buyer:', user._id);
      const response = await fetch(`/api/transactions?userId=${user._id}&userType=buyer`);
      const data = await response.json();

      console.log('Transactions response:', data);

      if (data.success) {
        setTransactions(data.transactions || []);
        
        // Calculate stats
        const totalSpent = data.transactions
          .filter(t => t.type === 'payment' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalRefunds = data.transactions
          .filter(t => t.type === 'refund' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const pendingAmount = data.transactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({ totalSpent, totalRefunds, pendingAmount });
      } else {
        console.error('Failed to fetch transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">View your transaction history</p>
          </div>
          <Link href="/buyer/dashboard">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">৳{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-green-600">৳{stats.totalRefunds.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">৳{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List or Empty State */}
        {transactions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        transaction.type === 'refund' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          transaction.type === 'refund' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-600">{transaction.transactionId}</p>
                        </div>
                        {transaction.order && (
                          <p className="text-xs text-blue-600 mt-1">
                            Order: {transaction.order.orderNumber || transaction.metadata?.orderNumber}
                          </p>
                        )}
                        {transaction.seller && (
                          <p className="text-xs text-gray-500 mt-1">
                            Seller: {transaction.seller.companyName || transaction.seller.firstName}
                          </p>
                        )}
                        {transaction.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.metadata.productName && (
                              <p>Product: {transaction.metadata.productName}</p>
                            )}
                            {transaction.metadata.quantity && (
                              <p>Quantity: {transaction.metadata.quantity} units</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'refund' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'refund' ? '+' : '-'}৳{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      {transaction.metadata?.subtotal && (
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          <p>Subtotal: ৳{transaction.metadata.subtotal.toLocaleString()}</p>
                          {transaction.metadata.shippingCost > 0 && (
                            <p>Shipping: ৳{transaction.metadata.shippingCost.toLocaleString()}</p>
                          )}
                          {transaction.metadata.tax > 0 && (
                            <p>Tax: ৳{transaction.metadata.tax.toLocaleString()}</p>
                          )}
                        </div>
                      )}
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your transaction history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerTransactions;
