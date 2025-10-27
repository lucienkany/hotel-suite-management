'use client';

import {
  AlertCircle,
  CreditCard,
  DollarSign,
  Eye,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api-client';

interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

interface RestaurantOrder {
  id: number;
  orderNumber: string;
  stayId: number | null;
  clientId: number;
  clientName?: string;
  serviceMode: string;
  tableNumber: string | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryName?: string;
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(
    null
  );

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Create order form
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [serviceMode, setServiceMode] = useState<string>('WALK_IN');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [searchProduct, setSearchProduct] = useState<string>('');

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchClients();
  }, [selectedStatus, selectedPaymentStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params: any = {};

      if (selectedStatus) params.status = selectedStatus;
      if (selectedPaymentStatus) params.paymentStatus = selectedPaymentStatus;

      const response = await apiClient.getRestaurantOrders(params);

      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          setOrders(response);
        } else if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }

      setError('');
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts({});
      if (response && response.data && Array.isArray(response.data)) {
        setProducts(
          response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            categoryName: p.category?.name,
          }))
        );
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiClient.getClients({});
      if (response && response.data && Array.isArray(response.data)) {
        setClients(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setOrderItems([]);
    setSelectedClientId('');
    setServiceMode('WALK_IN');
    setTableNumber('');
    setSearchProduct('');
    setIsCreateModalOpen(true);
    setError('');
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setOrderItems([]);
    setError('');
  };

  const handleAddProduct = (product: Product) => {
    const existingItem = orderItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
        },
      ]);
    }
    setSearchProduct('');
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter((item) => item.productId !== productId));
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      const orderData = {
        clientId: parseInt(selectedClientId),
        serviceMode,
        tableNumber: tableNumber || undefined,
        status: 'PENDING',
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await apiClient.createRestaurantOrder(orderData);
      setSuccessMessage('Order created successfully!');
      handleCloseCreateModal();
      fetchOrders();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error creating order:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create order';
      setError(errorMessage);
    }
  };

  const handleOpenViewModal = (order: RestaurantOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenPaymentModal = (order: RestaurantOrder) => {
    setSelectedOrder(order);
    const remainingAmount = order.totalAmount - order.paidAmount;
    setPaymentAmount(remainingAmount.toFixed(2));
    setPaymentMethod('CASH');
    setPaymentNotes('');
    setPaymentReference('');
    setIsPaymentModalOpen(true);
    setError('');
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
    setPaymentAmount('');
    setError('');
  };

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;

    try {
      const paymentData = {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: paymentNotes || undefined,
        reference: paymentReference || undefined,
      };

      await apiClient.payRestaurantOrder(selectedOrder.id, paymentData);
      setSuccessMessage('Payment processed successfully!');
      handleClosePaymentModal();
      fetchOrders();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to process payment';
      setError(errorMessage);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await apiClient.cancelRestaurantOrder(orderId);
      setSuccessMessage('Order cancelled successfully!');
      fetchOrders();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to cancel order';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePrintInvoice = (order: RestaurantOrder) => {
    // Simple print functionality
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            .totals div { margin: 5px 0; }
            .total-amount { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Order #${order.orderNumber}</p>
          </div>
          <div class="invoice-details">
            <p><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleString()}</p>
            <p><strong>Client:</strong> ${order.clientName || 'N/A'}</p>
            <p><strong>Service Mode:</strong> ${order.serviceMode}</p>
            ${
              order.tableNumber
                ? `<p><strong>Table:</strong> ${order.tableNumber}</p>`
                : ''
            }
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>Subtotal: $${order.subtotal.toFixed(2)}</div>
            ${order.tax > 0 ? `<div>Tax: $${order.tax.toFixed(2)}</div>` : ''}
            ${
              order.discount > 0
                ? `<div>Discount: -$${order.discount.toFixed(2)}</div>`
                : ''
            }
            <div class="total-amount">Total: $${order.totalAmount.toFixed(
              2
            )}</div>
            <div>Paid: $${order.paidAmount.toFixed(2)}</div>
            <div>Balance: $${(order.totalAmount - order.paidAmount).toFixed(
              2
            )}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
      PREPARING: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
      READY: { label: 'Ready', color: 'bg-green-100 text-green-800' },
      DELIVERED: { label: 'Delivered', color: 'bg-teal-100 text-teal-800' },
      COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: any = {
      UNPAID: { label: 'Unpaid', color: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: {
        label: 'Partially Paid',
        color: 'bg-orange-100 text-orange-800',
      },
      PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
      REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.UNPAID;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurant Orders
        </h1>
        <p className="text-gray-600">
          Manage orders, process payments, and generate invoices
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isCreateModalOpen && !isPaymentModalOpen && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          >
            <option value="">All Payment Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <Button onClick={handleOpenCreateModal} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus || selectedPaymentStatus
              ? 'Try adjusting your filters'
              : 'Get started by creating your first order'}
          </p>
          {!selectedStatus && !selectedPaymentStatus && (
            <Button onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.serviceMode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.tableNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenViewModal(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.paymentStatus !== 'PAID' &&
                          order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenPaymentModal(order)}
                              className="text-green-600 hover:text-green-800"
                              title="Process payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Print invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {order.status !== 'CANCELLED' &&
                          order.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Order
              </h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left: Order Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={serviceMode}
                    onChange={(e) => setServiceMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WALK_IN">Walk In</option>
                    <option value="DINE_IN">Dine In</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number (Optional)
                  </label>
                  <Input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., T12"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items:</span>
                      <span>{orderItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span>
                        {orderItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Product Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {searchProduct && (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredProducts.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">
                        No products found
                      </p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              {product.categoryName && (
                                <p className="text-xs text-gray-500">
                                  {product.categoryName}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Order Items
                  </h4>
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No items added yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {orderItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${item.unitPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="ml-4 text-sm font-medium text-gray-900">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateOrder}
                className="flex-1"
                disabled={orderItems.length === 0 || !selectedClientId}
              >
                Create Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">
                    {selectedOrder.clientName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Mode</p>
                  <p className="font-medium">{selectedOrder.serviceMode}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Table</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {item.productName || 'Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid:</span>
                    <span>${selectedOrder.paidAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.totalAmount - selectedOrder.paidAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600 font-medium">
                      <span>Balance:</span>
                      <span>
                        $
                        {(
                          selectedOrder.totalAmount - selectedOrder.paidAmount
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrintInvoice(selectedOrder)}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button
                type="button"
                onClick={handleCloseViewModal}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Process Payment
              </h2>
              <button
                onClick={handleClosePaymentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Paid:</span>
                <span className="font-medium text-green-600">
                  ${selectedOrder.paidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Balance Due:</span>
                <span className="font-bold text-lg">
                  $
                  {(
                    selectedOrder.totalAmount - selectedOrder.paidAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference (Optional)
                </label>
                <Input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Payment notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClosePaymentModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleProcessPayment}
                className="flex-1"
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
