"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import InvoiceModal from '@/components/InvoiceModal';
import { Printer } from 'lucide-react';

const API_BASE_URL = ''; // relative path

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    quoteAmount: '',
    quoteValidUntil: '',
    quoteNotes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const url = filter === 'all' 
        ? `/api/suppliers/orders`
        : `/api/suppliers/orders?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      quote_sent: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800',
      shipping: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      quote_sent: 'Quote Sent',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipping: 'Shipping',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  const handleSendQuote = (order) => {
    setSelectedOrder(order);
    setQuoteForm({
      quoteAmount: order.totalAmount || '',
      quoteValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quoteNotes: ''
    });
    setShowQuoteModal(true);
  };

  const submitQuote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/suppliers/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_quote',
          quoteDetails: quoteForm
        })
      });

      if (response.ok) {
        toast.success('Quote sent successfully!');
        setShowQuoteModal(false);
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      let trackingNumber = null;
      
      if (newStatus === 'shipping') {
        trackingNumber = prompt('Please enter tracking number / truck plate:');
        if (!trackingNumber) return;
      }

      const response = await fetch(`/api/suppliers/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_status',
          orderStatus: newStatus,
          trackingNumber
        })
      });

      if (response.ok) {
        toast.success(`Order status updated to ${getStatusText(newStatus)}!`);
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const rejectOrder = async (orderId) => {
    await updateOrderStatus(orderId, 'rejected');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/seller/dashboard" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer orders for your products</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex space-x-4 p-4 overflow-x-auto">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipping', label: 'Shipping' },
              { value: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">Orders for your products will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>

                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={order.product?.primaryImage || order.product?.images?.[0] || order.productSnapshot?.images?.[0] || '/placeholder.svg'}
                      alt={order.productSnapshot?.name || 'Product'}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{order.productSnapshot?.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Buyer: {order.buyer?.companyName || `${order.buyer?.firstName} ${order.buyer?.lastName}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {order.buyer?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {order.quantity} {order.productSnapshot?.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unit Price: ৳{order.unitPrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">৳{order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {order.specialRequirements && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Special Requirements:</p>
                      <p className="text-sm text-gray-600">{order.specialRequirements}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Payment Method:</span> {order.paymentMethod.replace('_', ' ')}
                        <span className="ml-4">
                          <span className="font-medium">Payment Status:</span> {order.paymentStatus}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Status change dropdown */}
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={order.orderStatus}>{getStatusText(order.orderStatus)}</option>
                          {order.orderStatus === 'pending' && (
                            <>
                              <option value="confirmed">Confirm Order</option>
                              <option value="rejected">Reject Order</option>
                            </>
                          )}
                          {order.orderStatus === 'quote_sent' && (
                            <>
                              <option value="confirmed">Confirm Order</option>
                              <option value="rejected">Reject Order</option>
                            </>
                          )}
                          {order.orderStatus === 'confirmed' && (
                            <>
                              <option value="processing">Start Processing</option>
                              <option value="cancelled">Cancel Order</option>
                            </>
                          )}
                          {order.orderStatus === 'processing' && (
                            <>
                              <option value="shipping">Ship Order</option>
                              <option value="cancelled">Cancel Order</option>
                            </>
                          )}
                          {order.orderStatus === 'shipping' && (
                            <option value="delivered">Mark as Delivered</option>
                          )}
                        </select>

                        {/* Action buttons */}
                        {order.orderStatus === 'pending' && (
                          <button 
                            onClick={() => handleSendQuote(order)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Send Quote
                          </button>
                        )}
                        
                        <button 
                          onClick={() => setSelectedChallan(order)}
                          className="px-3.5 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          <span>চালান প্রিন্ট</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Delivery Address:</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Send Quote</h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  value={quoteForm.quoteAmount}
                  onChange={(e) => setQuoteForm({...quoteForm, quoteAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quote amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={quoteForm.quoteValidUntil}
                  onChange={(e) => setQuoteForm({...quoteForm, quoteValidUntil: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={quoteForm.quoteNotes}
                  onChange={(e) => setQuoteForm({...quoteForm, quoteNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuote}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Send Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedChallan && (
        <InvoiceModal
          isOpen={!!selectedChallan}
          order={selectedChallan}
          onClose={() => setSelectedChallan(null)}
        />
      )}
    </div>
  );
}
