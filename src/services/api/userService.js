// Mock user service for user management functionality
let mockUsers = [
  {
    Id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    status: 'active',
    lastActive: '2 hours ago',
    joinedDate: '2023-01-15'
  },
  {
    Id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    role: 'manager',
    status: 'active',
    lastActive: '1 day ago',
    joinedDate: '2023-03-22'
  },
  {
    Id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    role: 'user',
    status: 'active',
    lastActive: '3 days ago',
    joinedDate: '2023-06-10'
  },
  {
    Id: 4,
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    role: 'user',
    status: 'pending',
    lastActive: 'Never',
    joinedDate: '2024-01-08'
  }
];

let nextId = 5;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  // Get all users
  async getAll() {
    await delay(300);
    return mockUsers.map(user => ({ ...user }));
  },

  // Get user by ID
  async getById(id) {
    await delay(200);
    const user = mockUsers.find(u => u.Id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  },

  // Create new user (invite)
  async create(userData) {
    await delay(500);
    const newUser = {
      Id: nextId++,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role || 'user',
      status: 'pending',
      lastActive: 'Never',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    mockUsers.push(newUser);
    return { ...newUser };
  },

  // Update user
  async update(id, userData) {
    await delay(400);
    const userIndex = mockUsers.findIndex(u => u.Id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    return { ...mockUsers[userIndex] };
  },

  // Delete user
  async delete(id) {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.Id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);
    return { ...deletedUser };
  },

  // Update user role
  async updateRole(id, role) {
    await delay(300);
    return this.update(id, { role });
  },

  // Update user status
  async updateStatus(id, status) {
    await delay(300);
    return this.update(id, { status });
  },

  // Resend invitation
  async resendInvitation(id) {
    await delay(500);
    const user = await this.getById(id);
    if (user.status !== 'pending') {
      throw new Error('User is already active');
    }
    // In real implementation, this would send an email
    return { success: true, message: 'Invitation resent successfully' };
  }
};

export default userService;