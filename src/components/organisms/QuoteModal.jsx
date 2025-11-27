import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';

function QuoteModal({ quote, contacts, companies, onSave, onClose }) {
const [formData, setFormData] = useState({
    QuoteNumber: '',
    Title: '',
    ContactId: '',
    CompanyId: '',
    Amount: '',
    Status: 'Draft',
    ValidUntil: '',
    Description: '',
    Terms: '',
    BillingStreet: '',
    BillingCity: '',
    BillingState: '',
    BillingCountry: '',
    BillingPin: '',
    ShippingStreet: '',
    ShippingCity: '',
    ShippingState: '',
    ShippingCountry: '',
    ShippingPin: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statuses = ['Draft', 'Sent', 'Under Review', 'Accepted', 'Rejected', 'Expired'];

  useEffect(() => {
if (quote) {
      setFormData({
        QuoteNumber: quote.QuoteNumber || '',
        Title: quote.Title || '',
        ContactId: quote.ContactId?.toString() || '',
        CompanyId: quote.CompanyId?.toString() || '',
        Amount: quote.Amount?.toString() || '',
        Status: quote.Status || 'Draft',
        ValidUntil: quote.ValidUntil ? format(new Date(quote.ValidUntil), 'yyyy-MM-dd') : '',
        Description: quote.Description || '',
        Terms: quote.Terms || '',
        BillingStreet: quote.BillingStreet || '',
        BillingCity: quote.BillingCity || '',
        BillingState: quote.BillingState || '',
        BillingCountry: quote.BillingCountry || '',
        BillingPin: quote.BillingPin || '',
        ShippingStreet: quote.ShippingStreet || '',
        ShippingCity: quote.ShippingCity || '',
        ShippingState: quote.ShippingState || '',
        ShippingCountry: quote.ShippingCountry || '',
        ShippingPin: quote.ShippingPin || ''
      });
    } else {
      // Generate quote number for new quotes
      const now = new Date();
      const year = now.getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        QuoteNumber: `Q-${year}-${random}`,
        ValidUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 30 days from now
      }));
    }
  }, [quote]);

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
function copyBillingToShipping() {
    setFormData(prev => ({
      ...prev,
      ShippingStreet: prev.BillingStreet,
      ShippingCity: prev.BillingCity,
      ShippingState: prev.BillingState,
      ShippingCountry: prev.BillingCountry,
      ShippingPin: prev.BillingPin
    }));

    // Clear any shipping address errors since we're copying valid billing data
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.ShippingStreet;
      delete newErrors.ShippingCity;
      delete newErrors.ShippingState;
      delete newErrors.ShippingCountry;
      delete newErrors.ShippingPin;
      return newErrors;
    });
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

    if (!formData.Amount || isNaN(parseFloat(formData.Amount)) || parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = 'Valid amount is required';
    }

    if (!formData.ValidUntil) {
      newErrors.ValidUntil = 'Valid until date is required';
    } else if (new Date(formData.ValidUntil) <= new Date()) {
      newErrors.ValidUntil = 'Valid until date must be in the future';
    }
if (!formData.Description.trim()) {
      newErrors.Description = 'Description is required';
    }

    // Billing Address Validation
    if (!formData.BillingStreet.trim()) {
      newErrors.BillingStreet = 'Billing street is required';
    }
    if (!formData.BillingCity.trim()) {
      newErrors.BillingCity = 'Billing city is required';
    }
    if (!formData.BillingState.trim()) {
      newErrors.BillingState = 'Billing state is required';
    }
    if (!formData.BillingCountry.trim()) {
      newErrors.BillingCountry = 'Billing country is required';
    }
    if (!formData.BillingPin.trim()) {
      newErrors.BillingPin = 'Billing PIN is required';
    }

    // Shipping Address Validation
    if (!formData.ShippingStreet.trim()) {
      newErrors.ShippingStreet = 'Shipping street is required';
    }
    if (!formData.ShippingCity.trim()) {
      newErrors.ShippingCity = 'Shipping city is required';
    }
    if (!formData.ShippingState.trim()) {
      newErrors.ShippingState = 'Shipping state is required';
    }
    if (!formData.ShippingCountry.trim()) {
      newErrors.ShippingCountry = 'Shipping country is required';
    }
    if (!formData.ShippingPin.trim()) {
      newErrors.ShippingPin = 'Shipping PIN is required';
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
        Amount: parseFloat(formData.Amount),
        ValidUntil: new Date(formData.ValidUntil).toISOString()
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving quote:', error);
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
    label: `${contact.name}${contact.email ? ` (${contact.email})` : ''}`
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
            {quote ? 'Edit Quote' : 'Create Quote'}
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
            {/* Quote Number */}
            <div>
              <label htmlFor="QuoteNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Quote Number
              </label>
              <Input
                id="QuoteNumber"
                name="QuoteNumber"
                type="text"
                value={formData.QuoteNumber}
                onChange={handleInputChange}
                placeholder="Q-2024-001"
                error={errors.QuoteNumber}
                disabled={!!quote} // Disable editing for existing quotes
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
              placeholder="Enter quote title"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label htmlFor="Amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($) *
              </label>
              <Input
                id="Amount"
                name="Amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.Amount}
                onChange={handleInputChange}
                placeholder="0.00"
                error={errors.Amount}
                required
              />
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="ValidUntil" className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <Input
                id="ValidUntil"
                name="ValidUntil"
                type="date"
                value={formData.ValidUntil}
                onChange={handleInputChange}
                error={errors.ValidUntil}
                required
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
              placeholder="Describe the products/services included in this quote..."
              rows={4}
              error={errors.Description}
              required
            />
          </div>

          {/* Terms */}
          <div>
            <label htmlFor="Terms" className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <Textarea
              id="Terms"
              name="Terms"
              value={formData.Terms}
              onChange={handleInputChange}
              placeholder="Payment terms, delivery conditions, etc..."
              rows={3}
              error={errors.Terms}
/>
          </div>

          {/* Billing Address Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <Input
                  name="BillingStreet"
                  value={formData.BillingStreet}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  error={errors.BillingStreet}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  name="BillingCity"
                  value={formData.BillingCity}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  error={errors.BillingCity}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <Input
                  name="BillingState"
                  value={formData.BillingState}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  error={errors.BillingState}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <Input
                  name="BillingCountry"
                  value={formData.BillingCountry}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  error={errors.BillingCountry}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <Input
                  name="BillingPin"
                  value={formData.BillingPin}
                  onChange={handleInputChange}
                  placeholder="Enter PIN code"
                  error={errors.BillingPin}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
<div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyBillingToShipping}
                className="flex items-center gap-2 text-sm"
              >
                <ApperIcon name="Copy" size={16} />
                Copy from Billing Address
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <Input
                  name="ShippingStreet"
                  value={formData.ShippingStreet}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  error={errors.ShippingStreet}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  name="ShippingCity"
                  value={formData.ShippingCity}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  error={errors.ShippingCity}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <Input
                  name="ShippingState"
                  value={formData.ShippingState}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  error={errors.ShippingState}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <Input
                  name="ShippingCountry"
                  value={formData.ShippingCountry}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  error={errors.ShippingCountry}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <Input
                  name="ShippingPin"
                  value={formData.ShippingPin}
                  onChange={handleInputChange}
                  placeholder="Enter PIN code"
                  error={errors.ShippingPin}
                  className="w-full"
                />
              </div>
            </div>
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
              {quote ? 'Update Quote' : 'Create Quote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuoteModal;