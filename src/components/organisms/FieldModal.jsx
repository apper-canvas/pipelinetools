import { useState } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'

const FieldModal = ({ table, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    required: false,
    defaultValue: ''
  })
  const [errors, setErrors] = useState({})

  const fieldTypes = [
    { value: 'text', label: 'Text', description: 'Short text up to 255 characters' },
    { value: 'number', label: 'Number', description: 'Integer or decimal numbers' },
    { value: 'email', label: 'Email', description: 'Email address with validation' },
    { value: 'date', label: 'Date', description: 'Date picker field' },
    { value: 'boolean', label: 'Boolean', description: 'True/false checkbox' }
  ]

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required'
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name.trim())) {
      newErrors.name = 'Field name must start with a letter and contain only letters, numbers, and underscores'
    } else if (table?.fields?.some(field => field.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      newErrors.name = 'A field with this name already exists'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const fieldData = {
      name: formData.name.trim(),
      type: formData.type,
      required: formData.required,
      defaultValue: formData.defaultValue.trim() || null
    }

    onSave(fieldData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getSelectedFieldType = () => {
    return fieldTypes.find(type => type.value === formData.type)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Field to {table?.name}
            </h2>
            <p className="text-sm text-slate-600">
              Define a new field for this table
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Field Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., customerEmail"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Field Type *
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            {getSelectedFieldType() && (
              <p className="text-sm text-slate-500 mt-1">
                {getSelectedFieldType().description}
              </p>
            )}
          </div>

          {/* Required */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="required" className="text-sm font-medium text-slate-700">
              Required field
            </label>
          </div>

          {/* Default Value */}
          {formData.type !== 'boolean' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Default Value (Optional)
              </label>
              <Input
                type={formData.type === 'number' ? 'number' : 
                      formData.type === 'date' ? 'date' : 
                      formData.type === 'email' ? 'email' : 'text'}
                value={formData.defaultValue}
                onChange={(e) => handleChange('defaultValue', e.target.value)}
                placeholder={
                  formData.type === 'number' ? '0' :
                  formData.type === 'date' ? 'YYYY-MM-DD' :
                  formData.type === 'email' ? 'user@example.com' :
                  'Default value'
                }
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Field
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FieldModal