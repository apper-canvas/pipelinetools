import contactsData from "@/services/mockData/contacts.json"

class ContactsService {
  constructor() {
    this.contacts = [...contactsData]
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.contacts]
  }

  async getById(id) {
    await this.delay()
    const contact = this.contacts.find(c => c.Id === parseInt(id))
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`)
    }
    return { ...contact }
  }

  async create(contactData) {
    await this.delay()
    
    // Find the highest existing Id and add 1
    const maxId = this.contacts.length > 0 
      ? Math.max(...this.contacts.map(c => c.Id))
      : 0
    
const newContact = {
      ...contactData,
      Id: maxId + 1,
      CompanyId: contactData.CompanyId || null,
      createdAt: new Date().toISOString(),
      lastContactedAt: null
    }
    
    this.contacts.push(newContact)
    return { ...newContact }
  }

  async update(id, updateData) {
    await this.delay()
    
    const index = this.contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found`)
    }
    
this.contacts[index] = {
      ...this.contacts[index],
      ...updateData,
      Id: parseInt(id), // Ensure Id remains an integer
      CompanyId: updateData.CompanyId ? parseInt(updateData.CompanyId) : this.contacts[index].CompanyId
    }
    
    return { ...this.contacts[index] }
  }

  async delete(id) {
    await this.delay()
    
    const index = this.contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found`)
    }
    
    this.contacts.splice(index, 1)
    return true
  }

  async updateLastContacted(id) {
    await this.delay()
    
    const index = this.contacts.findIndex(c => c.Id === parseInt(id))
    if (index !== -1) {
      this.contacts[index].lastContactedAt = new Date().toISOString()
      return { ...this.contacts[index] }
    }
    
    throw new Error(`Contact with ID ${id} not found`)
  }
}

export default new ContactsService()