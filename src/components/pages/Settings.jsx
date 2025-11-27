import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { create, getAll, update } from "@/services/api/companiesService";
import userService from "@/services/api/userService";
import profileService from "@/services/api/profileService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Company from "@/components/pages/Company";

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'My Profile', icon: 'User' },
    { id: 'company', label: 'Company Profile', icon: 'Building2' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'subscription', label: 'Subscription', icon: 'CreditCard' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'profile' && <MyProfileTab />}
        {activeTab === 'company' && <CompanyProfileTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'subscription' && <SubscriptionTab />}
      </div>
    </div>
  );
}

// My Profile Tab Component
function MyProfileTab() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    title: 'Sales Manager',
    department: 'Sales',
    timezone: 'America/New_York',
    language: 'English',
    profilePhoto: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileService.updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
};

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update form data with new photo
      setFormData(prev => ({ ...prev, profilePhoto: previewUrl }));
      
      // Here you would typically upload to a server
      // For now, we'll simulate an upload with profileService
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to update profile photo. Please try again.');
      // Reset to previous state on error
      setFormData(prev => ({ ...prev, profilePhoto: null }));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update your personal details and preferences</p>
        </div>

        {/* Avatar Section */}
        <div className="mb-6 flex items-center gap-6">
          <div className="relative">
<div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold overflow-hidden">
            {formData.profilePhoto ? (
              <img 
                src={formData.profilePhoto} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              'JD'
            )}
          </div>
          <button 
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <ApperIcon 
              name={uploading ? "Loader2" : "Camera"} 
              size={16} 
              className={`text-gray-600 ${uploading ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-600">Upload a new avatar. JPG, PNG or GIF format. Max 5MB.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={triggerFileInput}
            disabled={uploading}
          >
            <ApperIcon name={uploading ? "Loader2" : "Upload"} size={16} className={uploading ? 'animate-spin' : ''} />
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
          </div>

          <Input
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            />
            <Input
              label="Language"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? <ApperIcon name="Loader2" size={16} className="animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Company Profile Tab Component
function CompanyProfileTab() {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
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
  });

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profileData = { ...formData };
      if (logoFile) {
        profileData.logo = logoFile;
      }
      await profileService.updateCompanyProfile(profileData);
      toast.success('Company profile updated successfully');
    } catch (error) {
      toast.error('Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setLogoUploading(true);
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
      setFormData(prev => ({ ...prev, logo: file.name }));
      toast.success('Logo selected successfully');
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoFile(null);
    setFormData(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update your organization's details</p>
        </div>

        {/* Company Logo Section */}
        <div className="mb-6 flex items-center gap-6">
<div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Company logo preview" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <ApperIcon name="Building2" size={24} className="text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Company Logo</h3>
            <p className="text-sm text-gray-600">Upload your company logo. Recommended size: 200x200px, max 5MB</p>
            <div className="flex items-center gap-2 mt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleLogoUpload}
                disabled={logoUploading}
              >
                {logoUploading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Upload" size={16} />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </>
                )}
              </Button>
              {logoPreview && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleRemoveLogo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={16} />
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            required
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            />
            <Input
              label="Company Size"
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
          </div>

          <Input
            label="Country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? <ApperIcon name="Loader2" size={16} className="animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// User Management Tab Component
// User Management Tab Component
function UserManagementTab() {
const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRemoveUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    
    try {
      await userService.delete(userId);
      setUsers(prev => prev.filter(user => user.Id !== userId));
      toast.success('User removed successfully');
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };
const handleEditUser = (user) => {
    setEditUser(user);
  };

  const handleUserUpdated = async () => {
    setEditUser(null);
    await loadUsers();
  };
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600 mt-1">Manage users and their permissions</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <ApperIcon name="UserPlus" size={16} />
          Invite User
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
<Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <ApperIcon name="Edit" size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(user.Id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <ApperIcon name="Trash2" size={14} />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal 
          onClose={() => setShowInviteModal(false)}
onUserInvited={loadUsers}
        />
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal 
          user={editUser}
          onClose={() => setEditUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onUserUpdated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email || '',
    role: user.role || 'user',
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.update(user.Id, formData);
      toast.success('User updated successfully');
      onUserUpdated();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <ApperIcon name="Loader2" size={16} className="animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subscription Tab Component
function SubscriptionTab() {
  const [isLoading, setIsLoading] = useState(false);
  
  const downloadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate subscription data
      const subscriptionData = [
        ['Date', 'Plan', 'Amount', 'Status', 'Invoice'],
        ['2024-01-15', 'Professional', '$49.00', 'Paid', 'INV-2024-001'],
        ['2023-12-15', 'Professional', '$49.00', 'Paid', 'INV-2023-012'],
        ['2023-11-15', 'Professional', '$49.00', 'Paid', 'INV-2023-011'],
        ['2023-10-15', 'Professional', '$49.00', 'Paid', 'INV-2023-010'],
        ['2023-09-15', 'Professional', '$49.00', 'Paid', 'INV-2023-009'],
        ['', '', '', '', ''],
        ['Usage Statistics', '', '', '', ''],
        ['Total Users', '12', '', '', ''],
        ['Active Pipelines', '8', '', '', ''],
        ['Deals Closed', '156', '', '', ''],
        ['Storage Used', '2.3 GB', '', '', ''],
      ];
      
      // Convert to CSV
      const csvContent = subscriptionData
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `subscription-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Subscription data downloaded successfully');
    } catch (error) {
      toast.error('Failed to download subscription data');
    } finally {
setIsLoading(false);
    }
  };

  // Subscription data and handlers at component level
  const subscription = {
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-02-15',
    amount: '$49.99',
    users: 12,
    maxUsers: 25,
    storage: '8.2 GB',
    maxStorage: '100 GB'
  };

  const handleUpdateBilling = async () => {
    try {
      setIsLoading(true);
      toast.info('Redirecting to billing management...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Simulate billing portal redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would redirect to Stripe/payment provider
      window.open('https://billing.stripe.com/login', '_blank');
      
      toast.success('Billing portal opened successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to access billing management. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    try {
      setIsLoading(true);
      toast.info('Loading upgrade options...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // In a real implementation, this would show upgrade modal or redirect
      const confirmed = window.confirm(
        'Upgrade to Pro Plan?\n\n• Unlimited contacts and deals\n• Advanced analytics\n• Premium support\n\n$29/month'
      );
      
      if (confirmed) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Plan upgrade initiated! Check your email for confirmation.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.info('Plan upgrade cancelled', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error('Failed to load upgrade options. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Subscription & Billing</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your subscription and view usage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                <p className="text-sm text-gray-600">Your subscription details</p>
              </div>
              <Badge variant="default">{subscription.status}</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-medium">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <span className="text-sm font-medium">{subscription.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Next Billing</span>
                <span className="text-sm font-medium">{subscription.nextBilling}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleUpdateBilling}>
                <ApperIcon name="CreditCard" size={16} />
                Update Billing
              </Button>
              <Button onClick={handleUpgradePlan}>
                <ApperIcon name="ArrowUp" size={16} />
                Upgrade Plan
              </Button>
            </div>
          </Card>
        </div>

        {/* Usage Stats */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Users</span>
                  <span className="font-medium">{subscription.users}/{subscription.maxUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(subscription.users / subscription.maxUsers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium">{subscription.storage}/{subscription.maxStorage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: '8%' }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Billing History */}
      <Card className="mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { date: '2024-01-15', amount: '$49.99', status: 'paid' },
              { date: '2023-12-15', amount: '$49.99', status: 'paid' },
              { date: '2023-11-15', amount: '$49.99', status: 'paid' }
            ].map((invoice, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="text-sm font-medium">{invoice.date}</span>
                  <span className="text-sm text-gray-600 ml-3">{invoice.amount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">Paid</Badge>
<Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadSubscriptionData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ApperIcon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <ApperIcon name="Download" size={14} />
                    )}
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Invite User Modal Component
function InviteUserModal({ onClose, onUserInvited }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'user',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.create(formData);
      toast.success('User invitation sent successfully');
      onUserInvited();
      onClose();
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invite User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <ApperIcon name="Loader2" size={16} className="animate-spin" /> : null}
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;