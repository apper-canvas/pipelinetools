import { useState } from 'react'
import { toast } from 'react-toastify'
import TableManager from '@/components/organisms/TableManager'
import SearchBar from '@/components/molecules/SearchBar'
import FilterPanel from '@/components/molecules/FilterPanel'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Customize = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  })

  const availableStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const availableTypes = [
    { value: 'system', label: 'System Tables' },
    { value: 'custom', label: 'Custom Tables' }
  ]

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleExport = () => {
    toast.info('Export functionality coming soon')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Customization</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create and manage custom tables and fields for your CRM
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Download" size={16} />
            <span>Export Schema</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search tables..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
        
        <div className="lg:w-80">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableStatuses={availableStatuses}
            availableTypes={availableTypes}
            className="w-full"
          />
        </div>
      </div>

      {/* Table Manager */}
      <TableManager
        searchTerm={searchTerm}
        filters={filters}
      />
    </div>
  )
}

export default Customize