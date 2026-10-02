"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import InvoiceModal from "@/components/InvoiceModal";
import { Printer } from "lucide-react";
const API_BASE_URL = ''; // relative path
export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedChallan, setSelectedChallan] = useState(null);
  useEffect(() => {
    fetchOrders();
  }, [filter]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      const url =
        filter === "all"
          ? `/api/buyers/orders`
          : `/api/buyers/orders?status=${filter}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      quote_sent: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      processing: "bg-purple-100 text-purple-800",
      shipping: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      quote_sent: "Quote Sent",
      confirmed: "Confirmed",
      processing: "Processing",
      shipping: "Shipping",
      delivered: "Delivered",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  const handleQuoteResponse = async (orderId, accepted) => {
    if (!confirm(`Are you sure you want to ${accepted ? 'accept' : 'reject'} this quote?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/buyers/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'quote_response',
          quoteAccepted: accepted
        })
      });

      if (response.ok) {
        toast.success(accepted ? 'Quote accepted successfully!' : 'Quote rejected');
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.message || `Failed to ${accepted ? 'accept' : 'reject'} quote`);
      }
    } catch (error) {
      console.error('Error responding to quote:', error);
      toast.error('Failed to respond to quote');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      <div className="container mx-auto px-4 py-8">
        {" "}
        <div className="flex items-center justify-between mb-6">
          {" "}
          <div>
            {" "}
            <Link
              href="/buyer/dashboard"
              className="text-blue-600 hover:underline text-sm mb-2 inline-block"
            >
              {" "}
              ← Back to Dashboard{" "}
            </Link>{" "}
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>{" "}
          </div>{" "}
        </div>{" "}
        {/* Filter Tabs */}{" "}
        <div className="bg-white rounded-lg shadow mb-6">
          {" "}
          <div className="flex space-x-4 p-4 overflow-x-auto">
            {" "}
            {[
              { value: "all", label: "All Orders" },
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "shipping", label: "Shipping" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === tab.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {" "}
                {tab.label}{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>
        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by browsing products and placing an order.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                    >
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>

                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={
                        order.product?.primaryImage ||
                        order.product?.images?.[0] ||
                        order.productSnapshot?.images?.[0] ||
                        "/placeholder.svg"
                      }
                      alt={order.productSnapshot?.name || "Product"}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {order.productSnapshot?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Supplier:{" "}
                        {order.supplier?.companyName ||
                          `${order.supplier?.firstName} ${order.supplier?.lastName}`}
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
                      <p className="text-xl font-bold text-gray-900">
                        ৳{order.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quote Details */}
                  {order.orderStatus === 'quote_sent' && order.quoteDetails?.quoteSent && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">New Quote Received!</h5>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-800">
                          <span className="font-medium">Quote Amount:</span> ৳{order.quoteDetails.quoteAmount?.toLocaleString()}
                        </p>
                        {order.quoteDetails.quoteValidUntil && (
                          <p className="text-blue-800">
                            <span className="font-medium">Valid Until:</span> {new Date(order.quoteDetails.quoteValidUntil).toLocaleDateString()}
                          </p>
                        )}
                        {order.quoteDetails.quoteNotes && (
                          <p className="text-blue-800">
                            <span className="font-medium">Notes:</span> {order.quoteDetails.quoteNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Payment:</span>{" "}
                      {order.paymentStatus}
                      {order.trackingNumber && (
                        <span className="ml-4">
                          <span className="font-medium">Tracking:</span>{" "}
                          {order.trackingNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {order.orderStatus === 'quote_sent' && (
                        <>
                          <button 
                            onClick={() => handleQuoteResponse(order._id, true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                          >
                            Accept Quote
                          </button>
                          <button 
                            onClick={() => handleQuoteResponse(order._id, false)}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                          >
                            Reject Quote
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setSelectedChallan(order)}
                        className="px-3.5 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span>চালান প্রিন্ট</span>
                      </button>
                      {order.orderStatus === "delivered" &&
                        !order.buyerRating && (
                          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Rate Order
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
