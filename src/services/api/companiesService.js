import companiesData from '@/services/mockData/companies.json'

// Mock delay to simulate API calls
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class CompaniesService {
  constructor() {
    this.companies = [...companiesData]
    this.nextId = Math.max(...this.companies.map(c => c.Id)) + 1
  }

  async getAll() {
    await delay()
return this.companies.map(company => ({
      ...company,
      Name: company.name || company.Name
    }));
  }

  async getById(id) {
    await delay()
    const company = this.companies.find(c => c.Id === parseInt(id))
    if (!company) {
      throw new Error('Company not found')
    }
    return { ...company }
  }

  async create(companyData) {
    await delay()
    const newCompany = {
      ...companyData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.companies.push(newCompany)
    return { ...newCompany }
  }

  async update(id, updateData) {
    await delay()
    const index = this.companies.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Company not found')
    }
    
    const updatedCompany = {
      ...this.companies[index],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }
    
    this.companies[index] = updatedCompany
    return { ...updatedCompany }
  }

  async delete(id) {
    await delay()
    const index = this.companies.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Company not found')
    }
    
    const deletedCompany = { ...this.companies[index] }
    this.companies.splice(index, 1)
    return deletedCompany
  }
}

const companiesService = new CompaniesService()

export async function getAll() {
  return await companiesService.getAll()
}

export async function getById(id) {
  return await companiesService.getById(id)
}

export async function create(companyData) {
  return await companiesService.create(companyData)
}

export async function update(id, updateData) {
  return await companiesService.update(id, updateData)
}

export async function deleteCompany(id) {
  return await companiesService.delete(id)
}

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteCompany
}