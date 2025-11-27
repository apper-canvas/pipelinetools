import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import SearchBar from '@/components/molecules/SearchBar';
import FilterPanel from '@/components/molecules/FilterPanel';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import salesOrdersService from '@/services/api/salesOrdersService';
import contactsService from '@/services/api/contactsService';
import companiesService from '@/services/api/companiesService';

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    amountRange: ''
  });
  const [sortField, setSortField] = useState('OrderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const statuses = ['Draft', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];
  const statusVariants = {
    'Draft': 'secondary',
    'Confirmed': 'info',
    'In Progress': 'warning', 
    'Shipped': 'info',
    'Delivered': 'success',
    'Cancelled': 'error'
  };

  useEffect(() => {
    loadOrders();
    loadContacts();
    loadCompanies();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchQuery, filters, sortField, sortDirection]);

  async function loadOrders() {
    try {
      setError(null);
      setLoading(true);
      const data = await salesOrdersService.getAll();
      setOrders(data);
    } catch (err) {
      setError('Failed to load sales orders. Please try again.');
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    try {
      const data = await contactsService.getAll();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  async function loadCompanies() {
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

  function filterAndSortOrders() {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.OrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.Description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.Status === filters.status);
    }

    // Apply amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter(order => {
        switch (filters.amountRange) {
          case 'under5k': return order.TotalAmount < 5000;
          case '5k-20k': return order.TotalAmount >= 5000 && order.TotalAmount < 20000;
          case '20k-50k': return order.TotalAmount >= 20000 && order.TotalAmount < 50000;
          case 'over50k': return order.TotalAmount >= 50000;
          default: return true;
        }
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.OrderDate);
        switch (filters.dateRange) {
          case 'today': 
            return orderDate.toDateString() === now.toDateString();
          case 'thisWeek':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'thisMonth':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'TotalAmount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField.includes('Date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(filtered);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handleEditOrder(order) {
    setEditingOrder(order);
    setShowModal(true);
  }

  async function handleDeleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this sales order?')) return;

    try {
      await salesOrdersService.delete(orderId);
      setOrders(prev => prev.filter(o => o.Id !== orderId));
      toast.success('Sales order deleted successfully');
    } catch (err) {
      toast.error('Failed to delete sales order');
    }
  }

  async function handleSaveOrder(orderData) {
    try {
      let savedOrder;
      if (editingOrder) {
        savedOrder = await salesOrdersService.update(editingOrder.Id, orderData);
        setOrders(prev => prev.map(o => o.Id === editingOrder.Id ? savedOrder : o));
        toast.success('Sales order updated successfully');
      } else {
        savedOrder = await salesOrdersService.create(orderData);
        setOrders(prev => [savedOrder, ...prev]);
        toast.success('Sales order created successfully');
      }
      setShowModal(false);
      setEditingOrder(null);
    } catch (err) {
      toast.error(`Failed to ${editingOrder ? 'update' : 'create'} sales order`);
    }
  }

  function handleAddOrder() {
    setEditingOrder(null);
    setShowModal(true);
  }

  function getContactName(contactId) {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.FirstName} ${contact.LastName}` : 'Unknown';
  }

  function getCompanyName(companyId) {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.Name : 'Unknown';
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function getStatusVariant(status) {
    return statusVariants[status] || 'secondary';
  }

  if (loading) return <Loading type="page" className="min-h-screen" />;
  if (error) return <ErrorView error={error} onRetry={loadOrders} />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Sales Orders</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track your sales orders
            </p>
          </div>
          <Button onClick={handleAddOrder} className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />
            New Order
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search orders..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableStatuses={statuses}
            customFilters={[
              {
                key: 'amountRange',
                label: 'Amount Range',
                type: 'select',
                options: [
                  { value: '', label: 'All Amounts' },
                  { value: 'under5k', label: 'Under $5K' },
                  { value: '5k-20k', label: '$5K - $20K' },
                  { value: '20k-50k', label: '$20K - $50K' },
                  { value: 'over50k', label: 'Over $50K' }
                ]
              },
              {
                key: 'dateRange',
                label: 'Date Range',
                type: 'select',
                options: [
                  { value: '', label: 'All Dates' },
                  { value: 'today', label: 'Today' },
                  { value: 'thisWeek', label: 'This Week' },
                  { value: 'thisMonth', label: 'This Month' }
                ]
              }
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <Empty
            title="No sales orders found"
            description="Get started by creating your first sales order"
            icon="ShoppingCart"
            actionLabel="Create Order"
            onAction={handleAddOrder}
          />
        ) : (
          <div className="h-full overflow-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('OrderNumber')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Order #
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort('Title')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Title
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('TotalAmount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Amount
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('OrderDate')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Order Date
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {filteredOrders.map((order) => (
                  <div
                    key={order.Id}
                    className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {order.OrderNumber}
                        </div>
                        {order.DeliveryDate && (
                          <div className="text-xs text-gray-500">
                            Due {format(new Date(order.DeliveryDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.Title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {getCompanyName(order.CompanyId)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {getContactName(order.ContactId)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.TotalAmount)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Badge variant={getStatusVariant(order.Status)}>
                          {order.Status}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">
                          {format(new Date(order.OrderDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            className="p-1"
                          >
                            <ApperIcon name="Edit2" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.Id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <OrderModal
          order={editingOrder}
          contacts={contacts}
          companies={companies}
          onSave={handleSaveOrder}
          onClose={() => {
            setShowModal(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderModal({ order, contacts, companies, onSave, onClose }) {
  const [formData, setFormData] = useState({
    OrderNumber: '',
    Title: '',
    ContactId: '',
    CompanyId: '',
    TotalAmount: '',
    Status: 'Draft',
    OrderDate: '',
    DeliveryDate: '',
    Description: '',
    Notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statuses = ['Draft', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    if (order) {
      setFormData({
        OrderNumber: order.OrderNumber || '',
        Title: order.Title || '',
        ContactId: order.ContactId?.toString() || '',
        CompanyId: order.CompanyId?.toString() || '',
        TotalAmount: order.TotalAmount?.toString() || '',
        Status: order.Status || 'Draft',
        OrderDate: order.OrderDate ? format(new Date(order.OrderDate), 'yyyy-MM-dd') : '',
        DeliveryDate: order.DeliveryDate ? format(new Date(order.DeliveryDate), 'yyyy-MM-dd') : '',
        Description: order.Description || '',
        Notes: order.Notes || ''
      });
    } else {
      // Generate order number for new orders
      const now = new Date();
      const year = now.getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        OrderNumber: `SO-${year}-${random}`,
        OrderDate: format(now, 'yyyy-MM-dd')
      }));
    }
  }, [order]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-populate company when contact changes
    if (name === 'ContactId' && value && contacts.length > 0) {
      const contact = contacts.find(c => c.Id === parseInt(value));
      if (contact && contact.CompanyId) {
        setFormData(prev => ({
          ...prev,
          CompanyId: contact.CompanyId.toString()
        }));
      }
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.Title.trim()) {
      newErrors.Title = 'Title is required';
    }

    if (!formData.ContactId) {
      newErrors.ContactId = 'Contact is required';
    }

    if (!formData.CompanyId) {
      newErrors.CompanyId = 'Company is required';
    }

    if (!formData.TotalAmount || isNaN(parseFloat(formData.TotalAmount)) || parseFloat(formData.TotalAmount) <= 0) {
      newErrors.TotalAmount = 'Valid amount is required';
    }

    if (!formData.OrderDate) {
      newErrors.OrderDate = 'Order date is required';
    }

    if (!formData.Description.trim()) {
      newErrors.Description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        ContactId: parseInt(formData.ContactId),
        CompanyId: parseInt(formData.CompanyId),
        TotalAmount: parseFloat(formData.TotalAmount),
        OrderDate: new Date(formData.OrderDate).toISOString(),
        DeliveryDate: formData.DeliveryDate ? new Date(formData.DeliveryDate).toISOString() : null
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

const contactOptions = contacts.map(contact => ({
    value: contact.Id.toString(),
    label: `${contact.name}${contact.company ? ` (${contact.company})` : ''}${contact.email ? ` - ${contact.email}` : ''}`
  }));

  const companyOptions = companies.map(company => ({
    value: company.Id.toString(),
    label: company.Name
  }));

  const statusOptions = statuses.map(status => ({
    value: status,
    label: status
  }));

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? 'Edit Sales Order' : 'Create Sales Order'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <ApperIcon name="X" size={16} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Number */}
            <div>
              <label htmlFor="OrderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <Input
                id="OrderNumber"
                name="OrderNumber"
                type="text"
                value={formData.OrderNumber}
                onChange={handleInputChange}
                placeholder="SO-2024-001"
                error={errors.OrderNumber}
                disabled={!!order} // Disable editing for existing orders
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="Status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                id="Status"
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                options={statusOptions}
                error={errors.Status}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="Title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              id="Title"
              name="Title"
              type="text"
              value={formData.Title}
              onChange={handleInputChange}
              placeholder="Enter order title"
              error={errors.Title}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact */}
            <div>
              <label htmlFor="ContactId" className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <Select
                id="ContactId"
                name="ContactId"
                value={formData.ContactId}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Select contact...' }, ...contactOptions]}
                error={errors.ContactId}
                required
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="CompanyId" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <Select
                id="CompanyId"
                name="CompanyId"
                value={formData.CompanyId}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Select company...' }, ...companyOptions]}
                error={errors.CompanyId}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Amount */}
            <div>
              <label htmlFor="TotalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount ($) *
              </label>
              <Input
                id="TotalAmount"
                name="TotalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.TotalAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                error={errors.TotalAmount}
                required
              />
            </div>

            {/* Order Date */}
            <div>
              <label htmlFor="OrderDate" className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <Input
                id="OrderDate"
                name="OrderDate"
                type="date"
                value={formData.OrderDate}
                onChange={handleInputChange}
                error={errors.OrderDate}
                required
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label htmlFor="DeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <Input
                id="DeliveryDate"
                name="DeliveryDate"
                type="date"
                value={formData.DeliveryDate}
                onChange={handleInputChange}
                error={errors.DeliveryDate}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleInputChange}
              placeholder="Describe the products/services in this order..."
              rows={4}
              error={errors.Description}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="Notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              id="Notes"
              name="Notes"
              value={formData.Notes}
              onChange={handleInputChange}
              placeholder="Additional notes, special instructions, etc..."
              rows={3}
              error={errors.Notes}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              {order ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalesOrders;