import dealsData from "@/services/mockData/deals.json"

class DealsService {
  constructor() {
    this.deals = [...dealsData]
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.deals]
  }

  async getById(id) {
    await this.delay()
    const deal = this.deals.find(d => d.Id === parseInt(id))
    if (!deal) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    return { ...deal }
  }

  async create(dealData) {
    await this.delay()
    
    // Find the highest existing Id and add 1
    const maxId = this.deals.length > 0 
      ? Math.max(...this.deals.map(d => d.Id))
      : 0
    
    const newDeal = {
      ...dealData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.deals.push(newDeal)
    return { ...newDeal }
  }

  async update(id, updateData) {
    await this.delay()
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    this.deals[index] = {
      ...this.deals[index],
      ...updateData,
      Id: parseInt(id), // Ensure Id remains an integer
      updatedAt: new Date().toISOString()
    }
    
    return { ...this.deals[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`)
    }
    
    this.deals.splice(index, 1)
    return true
  }

  async getByContactId(contactId) {
    await this.delay()
    return this.deals.filter(d => d.contactId === contactId).map(d => ({ ...d }))
  }

  async getByStage(stage) {
    await this.delay()
    return this.deals.filter(d => d.stage === stage).map(d => ({ ...d }))
  }
}

export default new DealsService()