'use client';

import {
  AlertCircle,
  Loader2,
  LogOut,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../lib/api-client';

interface OrderItem {
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  barcode?: string;
  imageUrl?: string;
  stock?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [serviceMode, setServiceMode] = useState<string>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // User info from localStorage or auth context
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productsPerPage = 50;

  useEffect(() => {
    // Get user info from localStorage or your auth system
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.firstName || user.username || 'User');
    setUserRole(user.role || 'CASHIER');

    fetchCategories();
    fetchClients();
  }, []);

  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [searchQuery, selectedCategoryId]);

  const fetchProducts = async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: any = {
        page,
        limit: productsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategoryId) {
        params.categoryId = parseInt(selectedCategoryId);
      }

      const response = await apiClient.getProducts(params);

      let fetchedProducts: Product[] = [];
      let total = 0;

      if (response && response.data && Array.isArray(response.data)) {
        fetchedProducts = response.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          categoryId: p.categoryId,
          categoryName: p.category?.name,
          barcode: p.barcode,
          imageUrl: p.imageUrl,
          stock: p.stock,
        }));
        total = response.total || fetchedProducts.length;
      }

      if (reset || page === 1) {
        setProducts(fetchedProducts);
      } else {
        setProducts((prev) => [...prev, ...fetchedProducts]);
      }

      setTotalProducts(total);
      setHasMore(fetchedProducts.length === productsPerPage);
      setError('');
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories({});
      if (response && Array.isArray(response)) {
        setCategories(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(nextPage, false);
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
          productImage: product.imageUrl,
          quantity: 1,
          unitPrice: product.price,
        },
      ]);
    }
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

  const calculateSubtotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleClearOrder = () => {
    if (orderItems.length === 0) return;
    if (!confirm('Clear all items from the order?')) return;
    setOrderItems([]);
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
      setIsProcessing(true);
      setError('');

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

      setOrderItems([]);
      setTableNumber('');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error creating order:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create order';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      {/* Header with User Info and Logout */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant POS
              </h1>
              <p className="text-sm text-gray-600">
                {totalProducts > 0 && `${totalProducts} products available`}
              </p>
            </div>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            )}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Search and Filters */}
          <div className="bg-white border-b border-gray-200 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products by name or barcode..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategoryId === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id.toString())}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategoryId === category.id.toString()
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategoryId
                      ? 'Try adjusting your search or filters'
                      : 'No products available'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-400 transition-all group"
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {product.stock !== undefined && product.stock <= 5 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Low Stock
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 text-left">
                          {product.name}
                        </h3>
                        {product.categoryName && (
                          <p className="text-xs text-gray-500 mb-2 text-left">
                            {product.categoryName}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.stock !== undefined && (
                            <span className="text-xs text-gray-500">
                              Stock: {product.stock}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-6 mb-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          Load More Products
                          <span className="ml-2 text-xs text-gray-500">
                            ({products.length} of {totalProducts})
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">
                      All {totalProducts} products loaded
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Order Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Current Order
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Mode
                  </label>
                  <select
                    value={serviceMode}
                    onChange={(e) => setServiceMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="WALK_IN">Walk In</option>
                    <option value="DINE_IN">Dine In</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table #
                  </label>
                  <Input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="T12"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Receipt className="mx-auto h-16 w-16 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No items added yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Click on products to add them
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium text-gray-900">
                  ${calculateTax().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleCreateOrder}
                disabled={
                  orderItems.length === 0 || !selectedClientId || isProcessing
                }
                className="w-full py-3 text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Create Order
                  </>
                )}
              </Button>

              {orderItems.length > 0 && (
                <Button
                  onClick={handleClearOrder}
                  variant="outline"
                  className="w-full py-2 text-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
