import quotesData from '@/services/mockData/quotes.json';

class QuotesService {
  constructor() {
    this.quotes = [...quotesData];
    this.nextId = Math.max(...this.quotes.map(q => q.Id)) + 1;
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.quotes];
  }

  async getById(id) {
    await this.delay();
    const quote = this.quotes.find(q => q.Id === parseInt(id));
    if (!quote) {
      throw new Error(`Quote with Id ${id} not found`);
    }
    return { ...quote };
  }

  async create(quoteData) {
    await this.delay();
    
    const newQuote = {
      ...quoteData,
      Id: this.nextId++,
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString()
    };

    this.quotes.push(newQuote);
    return { ...newQuote };
  }

  async update(id, updateData) {
    await this.delay();
    
    const index = this.quotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Quote with Id ${id} not found`);
    }

    const updatedQuote = {
      ...this.quotes[index],
      ...updateData,
      Id: parseInt(id), // Ensure Id doesn't change
      UpdatedDate: new Date().toISOString()
    };

    this.quotes[index] = updatedQuote;
    return { ...updatedQuote };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.quotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Quote with Id ${id} not found`);
    }

    const deletedQuote = this.quotes.splice(index, 1)[0];
    return { ...deletedQuote };
  }

  async getByContactId(contactId) {
    await this.delay();
    return this.quotes.filter(q => q.ContactId === parseInt(contactId));
  }

  async getByStatus(status) {
    await this.delay();
    return this.quotes.filter(q => q.Status === status);
  }
}

export default new QuotesService();