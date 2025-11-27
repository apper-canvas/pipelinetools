import { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Badge from "@/components/atoms/Badge"

const FilterPanel = ({ 
  filters = {}, 
  onFiltersChange, 
  availableStatuses = [],
  availableTags = [],
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({})
    }
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Filter" size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="primary" size="sm">{activeFilterCount}</Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                Clear all
              </Button>
            )}
          </div>
          <ApperIcon 
            name={isOpen ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-slate-400"
          />
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {availableStatuses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <Select
                value={filters.tag || ""}
                onChange={(e) => handleFilterChange("tag", e.target.value)}
              >
                <option value="">All tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel