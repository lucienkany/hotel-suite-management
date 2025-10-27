'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api-client';

interface RestaurantTable {
  id: number;
  tableNumber: string;
  capacity: number;
  location: string | null;
  description: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

interface TableStatistics {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
}

export default function RestaurantTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [statistics, setStatistics] = useState<TableStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null
  );
  const [deletingTable, setDeletingTable] = useState<RestaurantTable | null>(
    null
  );
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    location: '',
    description: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    fetchTables();
    fetchStatistics();
  }, [selectedStatus]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const params: any = {};

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await apiClient.getRestaurantTables(params);

      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          setTables(response);
        } else if (response.data && Array.isArray(response.data)) {
          setTables(response.data);
        } else {
          setTables([]);
        }
      } else {
        setTables([]);
      }

      setError('');
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables');
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await apiClient.getRestaurantTableStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleOpenModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity.toString(),
        location: table.location || '',
        description: table.description || '',
        status: table.status,
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNumber: '',
        capacity: '',
        location: '',
        description: '',
        status: 'AVAILABLE',
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '',
      location: '',
      description: '',
      status: 'AVAILABLE',
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const tableData: any = {
        tableNumber: formData.tableNumber,
        capacity: parseInt(formData.capacity),
        location: formData.location || undefined,
        description: formData.description || undefined,
      };

      if (editingTable) {
        tableData.status = formData.status;
        await apiClient.updateRestaurantTable(editingTable.id, tableData);
        setSuccessMessage('Table updated successfully!');
      } else {
        await apiClient.createRestaurantTable(tableData);
        setSuccessMessage('Table created successfully!');
      }

      handleCloseModal();
      fetchTables();
      fetchStatistics();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error saving table:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save table';
      setError(errorMessage);
    }
  };

  const handleOpenDeleteModal = (table: RestaurantTable) => {
    setDeletingTable(table);
    setIsDeleteModalOpen(true);
    setError('');
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTable(null);
    setError('');
  };

  const handleDelete = async () => {
    if (!deletingTable) return;

    try {
      await apiClient.deleteRestaurantTable(deletingTable.id);
      setSuccessMessage('Table deleted successfully!');
      handleCloseDeleteModal();
      fetchTables();
      fetchStatistics();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting table:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete table';
      setError(errorMessage);
    }
  };

  const handleStatusAction = async (
    tableId: number,
    action: 'reserve' | 'unreserve' | 'clear'
  ) => {
    try {
      if (action === 'reserve') {
        await apiClient.reserveRestaurantTable(tableId);
        setSuccessMessage('Table reserved successfully!');
      } else if (action === 'unreserve') {
        await apiClient.unreserveRestaurantTable(tableId);
        setSuccessMessage('Table unreserved successfully!');
      } else if (action === 'clear') {
        await apiClient.clearRestaurantTable(tableId);
        setSuccessMessage('Table cleared successfully!');
      }

      fetchTables();
      fetchStatistics();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error(`Error ${action} table:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to ${action} table`;
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: {
        label: 'Available',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      OCCUPIED: {
        label: 'Occupied',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
      RESERVED: {
        label: 'Reserved',
        color: 'bg-blue-100 text-blue-800',
        icon: Calendar,
      },
      CLEANING: {
        label: 'Cleaning',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.AVAILABLE;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getStatusActions = (table: RestaurantTable) => {
    switch (table.status) {
      case 'AVAILABLE':
        return (
          <button
            onClick={() => handleStatusAction(table.id, 'reserve')}
            className="text-sm px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            Reserve
          </button>
        );
      case 'RESERVED':
        return (
          <button
            onClick={() => handleStatusAction(table.id, 'unreserve')}
            className="text-sm px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
          >
            Unreserve
          </button>
        );
      case 'OCCUPIED':
      case 'CLEANING':
        return (
          <button
            onClick={() => handleStatusAction(table.id, 'clear')}
            className="text-sm px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
          >
            Clear Table
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurant Tables
        </h1>
        <p className="text-gray-600">
          Manage your restaurant tables and reservations
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total Tables</div>
            <div className="text-2xl font-bold text-gray-900">
              {statistics.total}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-sm text-green-600 mb-1">Available</div>
            <div className="text-2xl font-bold text-green-700">
              {statistics.available}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600 mb-1">Occupied</div>
            <div className="text-2xl font-bold text-red-700">
              {statistics.occupied}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-sm text-blue-600 mb-1">Reserved</div>
            <div className="text-2xl font-bold text-blue-700">
              {statistics.reserved}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-sm text-yellow-600 mb-1">Cleaning</div>
            <div className="text-2xl font-bold text-yellow-700">
              {statistics.cleaning}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="CLEANING">Cleaning</option>
          </select>
        </div>
        <Button onClick={() => handleOpenModal()} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tables found
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus
              ? 'Try adjusting your filter'
              : 'Get started by creating your first table'}
          </p>
          {!selectedStatus && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Table {table.tableNumber}
                  </h3>
                  {getStatusBadge(table.status)}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Capacity: {table.capacity} people</span>
                </div>
                {table.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{table.location}</span>
                  </div>
                )}
                {table.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {table.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {getStatusActions(table)}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(table)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit table"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(table)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete table"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Table Number"
                    name="tableNumber"
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, tableNumber: e.target.value })
                    }
                    placeholder="e.g., 1, A1, VIP-1"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="Number of people"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Location (Optional)"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Window Side, Terrace"
                  />
                </div>

                {editingTable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="CLEANING">Cleaning</option>
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Additional notes about the table"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTable ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Delete Table</h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete "
                <span className="font-semibold">
                  Table {deletingTable.tableNumber}
                </span>
                "? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
