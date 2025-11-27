import { useState, useEffect } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'

const TableModal = ({ table, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    type: 'custom'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name || '',
        description: table.description || '',
        status: table.status || 'active',
        type: table.type || 'custom'
      })
    }
  }, [table])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Table name is required'
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name.trim())) {
      newErrors.name = 'Table name must start with a letter and contain only letters, numbers, and underscores'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const tableData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    }

    onSave(tableData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {table ? 'Edit Table' : 'Create New Table'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Table Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Table Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., CustomerProjects"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of what this table stores"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <option value="custom">Custom Table</option>
              <option value="system">System Table</option>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {table ? 'Update Table' : 'Create Table'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TableModal