import salesOrdersData from '@/services/mockData/salesOrders.json';

// In-memory data store (simulates database)
let salesOrders = [...salesOrdersData];
let nextId = Math.max(...salesOrders.map(order => order.Id)) + 1;

// Simulate network delay
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class SalesOrdersService {
  // Get all sales orders
  async getAll() {
    await delay();
    return [...salesOrders];
  }

  // Get sales order by ID
  async getById(id) {
    await delay();
    const order = salesOrders.find(order => order.Id === parseInt(id));
    if (!order) {
      throw new Error('Sales order not found');
    }
    return { ...order };
  }

  // Create new sales order
async create(orderData) {
    await delay();
    
    // Calculate total amount from products if provided
    let calculatedTotal = 0;
    if (orderData.products && orderData.products.length > 0) {
      calculatedTotal = orderData.products.reduce((sum, product) => {
        const subtotal = product.Quantity * product.SalePrice;
        const discountAmount = subtotal * (product.Discount / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (product.Tax / 100);
        return sum + (taxableAmount + taxAmount);
      }, 0);
    }
    
    const newOrder = {
      ...orderData,
      Id: nextId++,
      QuoteId: orderData.QuoteId || null,
      TotalAmount: orderData.products && orderData.products.length > 0 ? calculatedTotal : (orderData.TotalAmount || 0),
      products: orderData.products || [],
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString()
    };

    salesOrders.unshift(newOrder);
    return { ...newOrder };
  }

  // Update existing sales order
  async update(id, updateData) {
    await delay();
    
const index = salesOrders.findIndex(order => order.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Sales order not found');
    }

    // Calculate total amount from products if provided
    let calculatedTotal = 0;
    if (updateData.products && updateData.products.length > 0) {
      calculatedTotal = updateData.products.reduce((sum, product) => {
        const subtotal = product.Quantity * product.SalePrice;
        const discountAmount = subtotal * (product.Discount / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (product.Tax / 100);
        return sum + (taxableAmount + taxAmount);
      }, 0);
    }

    const updatedOrder = {
      ...salesOrders[index],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      QuoteId: updateData.QuoteId || null,
      TotalAmount: updateData.products && updateData.products.length > 0 ? calculatedTotal : (updateData.TotalAmount || salesOrders[index].TotalAmount || 0),
      products: updateData.products || salesOrders[index].products || [],
      UpdatedDate: new Date().toISOString()
    };

    salesOrders[index] = updatedOrder;
    return { ...updatedOrder };
  }

  // Delete sales order
  async delete(id) {
    await delay();
    
    const index = salesOrders.findIndex(order => order.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Sales order not found');
    }

    salesOrders.splice(index, 1);
    return true;
  }

  // Get orders by contact ID
  async getByContactId(contactId) {
    await delay();
    return salesOrders.filter(order => order.ContactId === parseInt(contactId));
  }

  // Get orders by company ID
  async getByCompanyId(companyId) {
    await delay();
    return salesOrders.filter(order => order.CompanyId === parseInt(companyId));
  }

  // Get orders by status
  async getByStatus(status) {
    await delay();
    return salesOrders.filter(order => order.Status === status);
  }

  // Get orders within date range
  async getByDateRange(startDate, endDate) {
    await delay();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return salesOrders.filter(order => {
      const orderDate = new Date(order.OrderDate);
      return orderDate >= start && orderDate <= end;
    });
  }

  // Get orders by amount range
async getByAmountRange(minAmount, maxAmount) {
    await delay();
    return salesOrders.filter(order => 
      order.TotalAmount >= minAmount && order.TotalAmount <= maxAmount
    );
  }

  // Get summary statistics
  async getSummary() {
    await delay();
    
const totalOrders = salesOrders.length;
    const totalRevenue = salesOrders.reduce((sum, order) => sum + (order.TotalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = {};
    const statuses = ['Draft', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];
    
    statuses.forEach(status => {
      statusCounts[status] = salesOrders.filter(order => order.Status === status).length;
    });

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts
    };
  }
}

// Export singleton instance
const salesOrdersService = new SalesOrdersService();
export default salesOrdersService;