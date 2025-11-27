import mockTables from '@/services/mockData/tables.json'

// Mock service for table management
// This will be replaced with actual API calls when database is available
class TablesService {
  constructor() {
    this.tables = [...mockTables]
    this.nextId = Math.max(...this.tables.map(t => t.Id)) + 1
  }

  // Get all tables
  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.tables.map(table => ({ ...table }))
  }

  // Get table by ID
  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const table = this.tables.find(t => t.Id === parseInt(id))
    if (!table) {
      throw new Error('Table not found')
    }
    return { ...table }
  }

  // Create new table
  async create(tableData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newTable = {
      Id: this.nextId++,
      name: tableData.name,
      description: tableData.description,
      status: tableData.status || 'active',
      type: tableData.type || 'custom',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.tables.push(newTable)
    return { ...newTable }
  }

  // Update table
  async update(id, tableData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = this.tables.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Table not found')
    }
    
    this.tables[index] = {
      ...this.tables[index],
      name: tableData.name,
      description: tableData.description,
      status: tableData.status,
      type: tableData.type,
      updatedAt: new Date().toISOString()
    }
    
    return { ...this.tables[index] }
  }

  // Delete table
  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.tables.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Table not found')
    }
    
    this.tables.splice(index, 1)
    return true
  }

  // Add field to table
  async addField(tableId, fieldData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const table = this.tables.find(t => t.Id === parseInt(tableId))
    if (!table) {
      throw new Error('Table not found')
    }
    
    // Check if field already exists
    if (table.fields.some(f => f.name.toLowerCase() === fieldData.name.toLowerCase())) {
      throw new Error('Field with this name already exists')
    }
    
    const newField = {
      name: fieldData.name,
      type: fieldData.type,
      required: fieldData.required || false,
      defaultValue: fieldData.defaultValue || null
    }
    
    table.fields.push(newField)
    table.updatedAt = new Date().toISOString()
    
    return { ...table }
  }

  // Delete field from table
  async deleteField(tableId, fieldName) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const table = this.tables.find(t => t.Id === parseInt(tableId))
    if (!table) {
      throw new Error('Table not found')
    }
    
    const fieldIndex = table.fields.findIndex(f => f.name === fieldName)
    if (fieldIndex === -1) {
      throw new Error('Field not found')
    }
    
    table.fields.splice(fieldIndex, 1)
    table.updatedAt = new Date().toISOString()
    
    return { ...table }
  }

  // Update field in table
  async updateField(tableId, fieldName, fieldData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const table = this.tables.find(t => t.Id === parseInt(tableId))
    if (!table) {
      throw new Error('Table not found')
    }
    
    const fieldIndex = table.fields.findIndex(f => f.name === fieldName)
    if (fieldIndex === -1) {
      throw new Error('Field not found')
    }
    
    table.fields[fieldIndex] = {
      ...table.fields[fieldIndex],
      ...fieldData
    }
    table.updatedAt = new Date().toISOString()
    
    return { ...table }
  }
}

const tablesService = new TablesService()
export default tablesService