'use client';

import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api-client';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  idNumber?: string;
  customerType: 'WALK_IN' | 'CORPORATE' | 'REGULAR';
  hasAccount: boolean;
  creditLimit?: number;
  sponsorCompanyId?: number;
  employeeId?: string;
  department?: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [itemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    customerType: 'REGULAR' as 'WALK_IN' | 'CORPORATE' | 'REGULAR',
    hasAccount: false,
    creditLimit: '',
    employeeId: '',
    department: '',
  });

  // User role (get from auth context or localStorage)
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from localStorage or auth context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');

    fetchClients();
  }, [currentPage, searchQuery, customerTypeFilter]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (customerTypeFilter) {
        params.customerType = customerTypeFilter;
      }

      const response = await apiClient.getClients(params);

      if (response && response.data && Array.isArray(response.data)) {
        setClients(response.data);
        setTotalClients(response.total || response.data.length);
      } else {
        setClients([]);
        setTotalClients(0);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setCustomerTypeFilter(filter);
    setCurrentPage(1);
  };

  const canCreateOrEdit = () => {
    return ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(
      userRole
    );
  };

  const canDelete = () => {
    return ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
  };

  const handleCreateClick = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      idNumber: '',
      customerType: 'REGULAR',
      hasAccount: false,
      creditLimit: '',
      employeeId: '',
      department: '',
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      idNumber: client.idNumber || '',
      customerType: client.customerType,
      hasAccount: client.hasAccount,
      creditLimit: client.creditLimit?.toString() || '',
      employeeId: client.employeeId || '',
      department: client.department || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const clientData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        customerType: formData.customerType,
        hasAccount: formData.hasAccount,
      };

      // Only include optional fields if they have non-empty values
      // This avoids validation errors for empty strings
      if (formData.email && formData.email.trim()) {
        clientData.email = formData.email.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        clientData.phone = formData.phone.trim();
      }
      if (formData.address && formData.address.trim()) {
        clientData.address = formData.address.trim();
      }
      if (formData.idNumber && formData.idNumber.trim()) {
        clientData.idNumber = formData.idNumber.trim();
      }
      if (formData.creditLimit && formData.creditLimit.trim()) {
        const creditValue = parseFloat(formData.creditLimit);
        if (!isNaN(creditValue) && creditValue > 0) {
          clientData.creditLimit = creditValue;
        }
      }
      if (formData.employeeId && formData.employeeId.trim()) {
        clientData.employeeId = formData.employeeId.trim();
      }
      if (formData.department && formData.department.trim()) {
        clientData.department = formData.department.trim();
      }

      console.log('Creating client with data:', clientData);

      await apiClient.createClient(clientData);
      setSuccessMessage('Client created successfully!');
      setShowCreateModal(false);
      fetchClients();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error creating client:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create client';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const clientData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        customerType: formData.customerType,
        hasAccount: formData.hasAccount,
      };

      // Only include optional fields if they have non-empty values
      if (formData.email && formData.email.trim()) {
        clientData.email = formData.email.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        clientData.phone = formData.phone.trim();
      }
      if (formData.address && formData.address.trim()) {
        clientData.address = formData.address.trim();
      }
      if (formData.idNumber && formData.idNumber.trim()) {
        clientData.idNumber = formData.idNumber.trim();
      }
      if (formData.creditLimit && formData.creditLimit.trim()) {
        const creditValue = parseFloat(formData.creditLimit);
        if (!isNaN(creditValue) && creditValue > 0) {
          clientData.creditLimit = creditValue;
        }
      }
      if (formData.employeeId && formData.employeeId.trim()) {
        clientData.employeeId = formData.employeeId.trim();
      }
      if (formData.department && formData.department.trim()) {
        clientData.department = formData.department.trim();
      }

      await apiClient.updateClient(selectedClient.id, clientData);
      setSuccessMessage('Client updated successfully!');
      setShowEditModal(false);
      fetchClients();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating client:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update client';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;

    try {
      setIsProcessing(true);
      setError('');

      await apiClient.deleteClient(selectedClient.id);
      setSuccessMessage('Client deleted successfully!');
      setShowDeleteModal(false);
      fetchClients();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete client';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = Math.ceil(totalClients / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalClients);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">
              Manage your clients and customers
            </p>
          </div>
          {canCreateOrEdit() && (
            <Button
              onClick={handleCreateClick}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Client</span>
            </Button>
          )}
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                customerTypeFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => handleFilterChange('REGULAR')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                customerTypeFilter === 'REGULAR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => handleFilterChange('CORPORATE')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                customerTypeFilter === 'CORPORATE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Corporate
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clients found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || customerTypeFilter
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'}
            </p>
            {canCreateOrEdit() && !searchQuery && !customerTypeFilter && (
              <Button onClick={handleCreateClick}>
                <Plus className="h-5 w-5 mr-2" />
                Add Client
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    {canCreateOrEdit() && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {client.customerType === 'CORPORATE' ? (
                              <Building2 className="h-5 w-5 text-blue-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </div>
                            {client.idNumber && (
                              <div className="text-sm text-gray-500">
                                ID: {client.idNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.customerType === 'CORPORATE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {client.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.hasAccount ? (
                            <span className="text-green-600 font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="text-gray-500">No Account</span>
                          )}
                        </div>
                        {client.creditLimit && (
                          <div className="text-xs text-gray-500">
                            Credit: ${client.creditLimit.toFixed(2)}
                          </div>
                        )}
                      </td>
                      {canCreateOrEdit() && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              onClick={() => handleEditClick(client)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            {canDelete() && (
                              <Button
                                onClick={() => handleDeleteClick(client)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalClients}</span> clients
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Client
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="optional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <Input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                      placeholder="optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Type
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerType: e.target.value as
                            | 'WALK_IN'
                            | 'CORPORATE'
                            | 'REGULAR',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INDIVIDUAL">Regular</option>
                      <option value="CORPORATE">Corporate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Limit
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditLimit: e.target.value,
                        })
                      }
                      placeholder="optional"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="hasAccount"
                      checked={formData.hasAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasAccount: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hasAccount"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Has Account
                    </label>
                  </div>
                </div>

                {formData.customerType === 'CORPORATE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <Input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeId: e.target.value,
                          })
                        }
                        placeholder="optional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        type="text"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        placeholder="optional"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Client'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Same as create but with edit handler */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Client
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Same form fields as create modal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <Input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Type
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerType: e.target.value as
                            | 'WALK_IN'
                            | 'CORPORATE'
                            | 'REGULAR',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INDIVIDUAL">Regular</option>
                      <option value="CORPORATE">Corporate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Limit
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditLimit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="hasAccountEdit"
                      checked={formData.hasAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasAccount: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hasAccountEdit"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Has Account
                    </label>
                  </div>
                </div>

                {formData.customerType === 'CORPORATE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <Input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeId: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        type="text"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Client'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Client
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {selectedClient.firstName} {selectedClient.lastName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
