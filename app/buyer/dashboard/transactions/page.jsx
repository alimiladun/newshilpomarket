'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const BuyerTransactions = () => {
  // Mock transactions data
  const transactions = [
    {
      id: 'TXN001',
      date: '24 Aug 2025',
      description: 'Payment for Order #2031',
      amount: -2500,
      status: 'completed',
      statusLabel: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'TXN002',
      date: '23 Aug 2025',
      description: 'Payment for Order #2030',
      amount: -1800,
      status: 'completed',
      statusLabel: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'TXN003',
      date: '20 Aug 2025',
      description: 'Refund for Order #2025',
      amount: 1200,
      status: 'completed',
      statusLabel: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'TXN004',
      date: '18 Aug 2025',
      description: 'Payment for Order #2024',
      amount: -3500,
      status: 'completed',
      statusLabel: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  const totalSpent = transactions.reduce((sum, txn) => sum + (txn.amount < 0 ? Math.abs(txn.amount) : 0), 0);
  const totalRefunds = transactions.reduce((sum, txn) => sum + (txn.amount > 0 ? txn.amount : 0), 0);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">৳{totalSpent.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-green-600">৳{totalRefunds.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${transaction.amount < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                      <DollarSign className={`h-5 w-5 ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-600">{transaction.date}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-600">{transaction.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}৳{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${transaction.statusColor}`}>
                      {transaction.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (if no transactions) */}
        {transactions.length === 0 && (
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
