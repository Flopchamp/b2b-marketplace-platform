"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TruckIcon,
  CreditCardIcon,
  UserIcon,
  CalendarIcon,
  BuildingIcon
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  retailerId: string;
  retailerInfo: {
    name: string;
    email: string;
    businessName?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  notes?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function CompanyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch('/api/company/orders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      if (result.success) {
        setOrders(result.data.orders);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/auth/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'company') {
        router.push('/auth/signin');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/signin');
      return;
    }

    fetchOrders();
  }, [router, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/company/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh orders
        fetchOrders();
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
        }

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = `Order status updated to ${newStatus}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Failed to update order status';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <PackageIcon className="h-5 w-5 text-purple-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/company')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <BuildingIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PackageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.confirmedOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Shipped</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.shippedOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatPrice(stats.totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Order</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatPrice(stats.averageOrderValue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { key: 'all', label: 'All Orders', count: stats.totalOrders },
                { key: 'pending', label: 'Pending', count: stats.pendingOrders },
                { key: 'confirmed', label: 'Confirmed', count: stats.confirmedOrders },
                { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                { key: 'shipped', label: 'Shipped', count: stats.shippedOrders },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`${
                      filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                    } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Orders {filter !== 'all' && `(${filter})`}
            </h3>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No orders found</h4>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? "You haven't received any orders yet. Orders from retailers will appear here."
                    : `No orders with status "${filter}" found.`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.retailerInfo.businessName || order.retailerInfo.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.retailerInfo.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </button>
                            
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Confirm
                              </button>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'processing')}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Process
                              </button>
                            )}
                            
                            {order.status === 'processing' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'shipped')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Ship
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details - #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">{selectedOrder.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-lg font-medium text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order Date</label>
                  <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment Status</label>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedOrder.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedOrder.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedOrder.retailerInfo.businessName || selectedOrder.retailerInfo.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.retailerInfo.email}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatPrice(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'confirmed');
                      setShowOrderModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Confirm Order
                  </button>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'processing');
                      setShowOrderModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                  >
                    Start Processing
                  </button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'shipped');
                      setShowOrderModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
