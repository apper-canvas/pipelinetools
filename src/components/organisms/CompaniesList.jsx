import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import SearchBar from '@/components/molecules/SearchBar'
import FilterPanel from '@/components/molecules/FilterPanel'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import CompanyModal from '@/components/organisms/CompanyModal'
import companiesService from '@/services/api/companiesService'

function CompaniesList() {
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    let filtered = [...companies]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query) ||
        (company.description && company.description.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company => company.status.toLowerCase() === filterStatus.toLowerCase())
    }

    // Apply industry filter
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry.toLowerCase() === filterIndustry.toLowerCase())
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'employees' || sortBy === 'Id') {
        aValue = parseInt(aValue) || 0
        bValue = parseInt(bValue) || 0
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredCompanies(filtered)
  }, [companies, searchQuery, filterStatus, filterIndustry, sortBy, sortOrder])

  async function loadCompanies() {
    try {
      setLoading(true)
      setError(null)
      const data = await companiesService.getAll()
      setCompanies(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  function handleSort(key) {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  function handleEditCompany(company) {
    setSelectedCompany(company)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  async function handleDeleteCompany(companyId) {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return
    }

    try {
      await companiesService.delete(companyId)
      setCompanies(prev => prev.filter(c => c.Id !== companyId))
      toast.success('Company deleted successfully')
    } catch (err) {
      toast.error('Failed to delete company')
    }
  }

  async function handleSaveCompany(companyData) {
    try {
      if (isCreating) {
        const newCompany = await companiesService.create(companyData)
        setCompanies(prev => [...prev, newCompany])
        toast.success('Company created successfully')
      } else {
        const updatedCompany = await companiesService.update(selectedCompany.Id, companyData)
        setCompanies(prev => prev.map(c => c.Id === updatedCompany.Id ? updatedCompany : c))
        toast.success('Company updated successfully')
      }
      setIsModalOpen(false)
      setSelectedCompany(null)
    } catch (err) {
      toast.error(isCreating ? 'Failed to create company' : 'Failed to update company')
    }
  }

  function handleAddCompany() {
    setSelectedCompany(null)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  function getStatusVariant(status) {
    switch (status.toLowerCase()) {
      case 'active': return 'default'
      case 'prospect': return 'secondary'
      case 'inactive': return 'destructive'
      default: return 'outline'
    }
  }

  const industries = [...new Set(companies.map(c => c.industry))].sort()
  const statuses = [...new Set(companies.map(c => c.status))].sort()

  const filterOptions = [
    {
      label: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      options: [
        { value: 'all', label: 'All Statuses' },
        ...statuses.map(status => ({ value: status.toLowerCase(), label: status }))
      ]
    },
    {
      label: 'Industry',
      value: filterIndustry,
      onChange: setFilterIndustry,
      options: [
        { value: 'all', label: 'All Industries' },
        ...industries.map(industry => ({ value: industry.toLowerCase(), label: industry }))
      ]
    }
  ]

  if (loading) return <Loading type="page" />
  if (error) return <ErrorView error={error} onRetry={loadCompanies} />

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search companies..."
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <FilterPanel 
            filters={filterOptions}
            onClear={() => {
              setFilterStatus('all')
              setFilterIndustry('all')
            }}
          />
          
          <Button onClick={handleAddCompany} className="whitespace-nowrap">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Companies Table */}
      {filteredCompanies.length === 0 ? (
        <Empty
          title="No companies found"
          description={searchQuery || filterStatus !== 'all' || filterIndustry !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Get started by adding your first company"}
          icon="Building2"
          action={
            !(searchQuery || filterStatus !== 'all' || filterIndustry !== 'all') && {
              label: "Add Company",
              onClick: handleAddCompany
            }
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      {sortBy === 'name' && (
                        <ApperIcon 
                          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          size={14} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('industry')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Industry</span>
                      {sortBy === 'industry' && (
                        <ApperIcon 
                          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          size={14} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('employees')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Employees</span>
                      {sortBy === 'employees' && (
                        <ApperIcon 
                          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          size={14} 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Updated</span>
                      {sortBy === 'updatedAt' && (
                        <ApperIcon 
                          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                          size={14} 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.Id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{company.name}</div>
                          <div className="text-sm text-slate-500">{company.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{company.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {company.employees?.toLocaleString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{company.revenue || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(company.status)} size="sm">
                        {company.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(company.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCompany(company.Id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isModalOpen && (
        <CompanyModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCompany(null)
          }}
          onSave={handleSaveCompany}
          isCreating={isCreating}
        />
      )}
    </div>
  )
}

export default CompaniesList