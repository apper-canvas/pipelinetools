// Mock profile service for user and company profile management
let mockUserProfile = {
  Id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  title: 'Sales Manager',
  department: 'Sales',
  timezone: 'America/New_York',
  language: 'English',
  avatar: null
};

let mockCompanyProfile = {
  Id: 1,
  companyName: 'Acme Corporation',
  website: 'https://acme.com',
  industry: 'Technology',
  companySize: '50-200',
  address: '123 Business Ave',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  logo: null
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const profileService = {
  // Get user profile
  async getUserProfile() {
    await delay(300);
    return { ...mockUserProfile };
  },

  // Update user profile
  async updateProfile(profileData) {
    await delay(500);
    mockUserProfile = { ...mockUserProfile, ...profileData };
    return { ...mockUserProfile };
  },

  // Get company profile
  async getCompanyProfile() {
    await delay(300);
    return { ...mockCompanyProfile };
  },

  // Update company profile
  async updateCompanyProfile(companyData) {
    await delay(500);
    mockCompanyProfile = { ...mockCompanyProfile, ...companyData };
    return { ...mockCompanyProfile };
  },

  // Upload avatar (simulated)
  async uploadAvatar(file) {
    await delay(1000);
    const avatarUrl = URL.createObjectURL(file);
    mockUserProfile.avatar = avatarUrl;
    return { avatarUrl };
  },

  // Upload company logo (simulated)
  async uploadLogo(file) {
    await delay(1000);
    const logoUrl = URL.createObjectURL(file);
    mockCompanyProfile.logo = logoUrl;
    return { logoUrl };
  }
};

export default profileService;