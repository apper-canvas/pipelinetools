import { useState, useEffect } from 'react'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'
import ApperIcon from '@/components/ApperIcon'
import { cn } from '@/utils/cn'

function CompanyModal({ company, isOpen, onClose, onSave, isCreating }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    employees: '',
    revenue: '',
    status: 'Active',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (company && !isCreating) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        employees: company.employees?.toString() || '',
        revenue: company.revenue || '',
        status: company.status || 'Active',
        description: company.description || ''
      })
    } else {
      setFormData({
        name: '',
        industry: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        employees: '',
        revenue: '',
        status: 'Active',
        description: ''
      })
    }
    setErrors({})
  }, [company, isCreating, isOpen])

  const industries = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Construction',
    'Transportation',
    'Energy',
    'Entertainment',
    'Food & Beverage',
    'Consulting',
    'Logistics',
    'Design',
    'Renewable Energy',
    'Travel & Tourism',
    'Other'
  ].sort()

  const statuses = ['Active', 'Prospect', 'Inactive']

  function validateForm() {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://'
    }
    
    if (formData.employees && (isNaN(formData.employees) || parseInt(formData.employees) < 0)) {
      newErrors.employees = 'Employees must be a positive number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    const submitData = {
      ...formData,
      employees: formData.employees ? parseInt(formData.employees) : null,
      website: formData.website || null,
      phone: formData.phone || null,
      address: formData.address || null,
      revenue: formData.revenue || null,
      description: formData.description || null
    }
    
    try {
      await onSave(submitData)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isCreating ? 'Add New Company' : 'Edit Company'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                  className={cn(errors.name && "border-red-500")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Industry *
                </label>
                <Select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={cn(errors.industry && "border-red-500")}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </Select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  className={cn(errors.email && "border-red-500")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://company.com"
                  className={cn(errors.website && "border-red-500")}
                />
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employees
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                  placeholder="100"
                  className={cn(errors.employees && "border-red-500")}
                />
                {errors.employees && (
                  <p className="text-red-500 text-sm mt-1">{errors.employees}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Revenue
                </label>
                <Input
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  placeholder="$10M"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the company..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
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
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {isCreating ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} className="mr-2" />
                  {isCreating ? 'Create Company' : 'Update Company'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyModal