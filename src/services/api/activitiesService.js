import activitiesData from "@/services/mockData/activities.json"

class ActivitiesService {
  constructor() {
    this.activities = [...activitiesData]
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.activities]
  }

  async getById(id) {
    await this.delay()
    const activity = this.activities.find(a => a.Id === parseInt(id))
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`)
    }
    return { ...activity }
  }

  async create(activityData) {
    await this.delay()
    
    // Find the highest existing Id and add 1
    const maxId = this.activities.length > 0 
      ? Math.max(...this.activities.map(a => a.Id))
      : 0
    
    const newActivity = {
      ...activityData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    }
    
    this.activities.push(newActivity)
    return { ...newActivity }
  }

  async update(id, updateData) {
    await this.delay()
    
    const index = this.activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`)
    }
    
    this.activities[index] = {
      ...this.activities[index],
      ...updateData,
      Id: parseInt(id) // Ensure Id remains an integer
    }
    
    return { ...this.activities[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`)
    }
    
    this.activities.splice(index, 1)
    return true
  }

  async getByContactId(contactId) {
    await this.delay()
    return this.activities
      .filter(a => a.contactId === contactId)
      .map(a => ({ ...a }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  async getByDealId(dealId) {
    await this.delay()
    return this.activities
      .filter(a => a.dealId === dealId)
      .map(a => ({ ...a }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  async getByType(type) {
    await this.delay()
    return this.activities
      .filter(a => a.type === type)
      .map(a => ({ ...a }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

export default new ActivitiesService()