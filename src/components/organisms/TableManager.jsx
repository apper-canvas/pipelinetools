import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import TableModal from '@/components/organisms/TableModal'
import FieldModal from '@/components/organisms/FieldModal'
import tablesService from '@/services/api/tablesService'

const TableManager = ({ searchTerm, filters }) => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [expandedTable, setExpandedTable] = useState(null)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tablesService.getAll()
      setTables(data)
    } catch (err) {
      setError('Failed to load tables')
      console.error('Error loading tables:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || table.status === filters.status
    const matchesType = !filters.type || table.type === filters.type
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleAddTable = () => {
    setEditingTable(null)
    setIsTableModalOpen(true)
  }

  const handleEditTable = (table) => {
    setEditingTable(table)
    setIsTableModalOpen(true)
  }

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      return
    }

    try {
      await tablesService.delete(tableId)
      setTables(prev => prev.filter(t => t.Id !== tableId))
      toast.success('Table deleted successfully')
    } catch (err) {
      toast.error('Failed to delete table')
      console.error('Error deleting table:', err)
    }
  }

  const handleSaveTable = async (tableData) => {
    try {
      if (editingTable) {
        const updated = await tablesService.update(editingTable.Id, tableData)
        setTables(prev => prev.map(t => t.Id === editingTable.Id ? updated : t))
        toast.success('Table updated successfully')
      } else {
        const created = await tablesService.create(tableData)
        setTables(prev => [...prev, created])
        toast.success('Table created successfully')
      }
      setIsTableModalOpen(false)
    } catch (err) {
      toast.error('Failed to save table')
      console.error('Error saving table:', err)
    }
  }

  const handleAddField = (table) => {
    setSelectedTable(table)
    setIsFieldModalOpen(true)
  }

  const handleSaveField = async (fieldData) => {
    try {
      const updated = await tablesService.addField(selectedTable.Id, fieldData)
      setTables(prev => prev.map(t => t.Id === selectedTable.Id ? updated : t))
      setIsFieldModalOpen(false)
      toast.success('Field added successfully')
    } catch (err) {
      toast.error('Failed to add field')
      console.error('Error adding field:', err)
    }
  }

  const handleDeleteField = async (tableId, fieldName) => {
    if (!confirm(`Are you sure you want to delete the field "${fieldName}"?`)) {
      return
    }

    try {
      const updated = await tablesService.deleteField(tableId, fieldName)
      setTables(prev => prev.map(t => t.Id === tableId ? updated : t))
      toast.success('Field deleted successfully')
    } catch (err) {
      toast.error('Failed to delete field')
      console.error('Error deleting field:', err)
    }
  }

  const toggleExpandTable = (tableId) => {
    setExpandedTable(expandedTable === tableId ? null : tableId)
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      default: return 'default'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system': return 'Database'
      case 'custom': return 'Plus'
      default: return 'Table'
    }
  }

  const getFieldTypeIcon = (type) => {
    switch (type) {
      case 'text': return 'Type'
      case 'number': return 'Hash'
      case 'email': return 'Mail'
      case 'date': return 'Calendar'
      case 'boolean': return 'ToggleLeft'
      default: return 'Minus'
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorView message={error} />
  if (filteredTables.length === 0 && tables.length > 0) {
    return <Empty message="No tables match your current filters" />
  }
  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty message="No tables found. Create your first custom table to get started." />
        <Button onClick={handleAddTable} className="mt-4">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Table
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Add Table Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Tables ({filteredTables.length})
          </h2>
          <Button onClick={handleAddTable}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Table
          </Button>
        </div>

        {/* Tables List */}
        <div className="space-y-4">
          {filteredTables.map((table) => (
            <div key={table.Id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
              {/* Table Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name={getTypeIcon(table.type)} size={20} className="text-slate-500" />
                    <div>
                      <h3 className="font-medium text-slate-900">{table.name}</h3>
                      <p className="text-sm text-slate-600">{table.description}</p>
                    </div>
                    <Badge variant={getStatusVariant(table.status)}>
                      {table.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpandTable(table.Id)}
                    >
                      <ApperIcon 
                        name={expandedTable === table.Id ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddField(table)}
                    >
                      <ApperIcon name="Plus" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTable(table)}
                    >
                      <ApperIcon name="Edit3" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTable(table.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Fields */}
              {expandedTable === table.Id && (
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 mb-3">
                    Fields ({table.fields?.length || 0})
                  </h4>
                  
                  {table.fields && table.fields.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {table.fields.map((field) => (
                        <div key={field.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <ApperIcon 
                              name={getFieldTypeIcon(field.type)} 
                              size={16} 
                              className="text-slate-500" 
                            />
                            <div>
                              <span className="font-medium text-sm text-slate-900">
                                {field.name}
                              </span>
                              <div className="text-xs text-slate-500">
                                {field.type} {field.required && '• Required'}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(table.Id, field.name)}
                            className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ApperIcon name="X" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <ApperIcon name="Database" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No fields defined yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddField(table)}
                        className="mt-2"
                      >
                        Add First Field
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {isTableModalOpen && (
        <TableModal
          table={editingTable}
          onSave={handleSaveTable}
          onClose={() => setIsTableModalOpen(false)}
        />
      )}

      {isFieldModalOpen && (
        <FieldModal
          table={selectedTable}
          onSave={handleSaveField}
          onClose={() => setIsFieldModalOpen(false)}
        />
      )}
    </>
  )
}

export default TableManager