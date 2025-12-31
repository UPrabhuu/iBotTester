import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  Lock, 
  Link2, 
  Save, 
  Edit2, 
  X, 
  Check,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import { settingsApi } from '../services/api';
import { useAlert } from '../contexts/AlertContext';
import { Button, Input, Heading, Text, Card, CardHeader, CardTitle, CardContent, Badge } from './ui';

interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  avatar?: string;
}

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  billingAddress: string;
  country: string;
  zipCode: string;
}

interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  config?: {
    url?: string;
    apiKey?: string;
    workspace?: string;
  };
}

interface SettingsViewProps {
  onSave?: (data: any) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSave }) => {
  const { showSuccess, showError } = useAlert();
  const [activeSection, setActiveSection] = useState<'profile' | 'payment' | 'security' | 'integrations' | 'pricing' | 'connection'>('profile');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // User profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    avatar: '',
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);

  // Payment state
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '**** **** **** 4242',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    billingAddress: '123 Main St, San Francisco',
    country: 'United States',
    zipCode: '94102',
  });
  const [editedPayment, setEditedPayment] = useState<PaymentDetails>(paymentDetails);

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: 'Jira',
      icon: '🎯',
      connected: false,
      config: { url: '', apiKey: '' },
    },
    {
      name: 'GitLab',
      icon: '🦊',
      connected: false,
      config: { url: '', apiKey: '' },
    },
    {
      name: 'Slack',
      icon: '💬',
      connected: false,
      config: { workspace: '', apiKey: '' },
    },
  ]);
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setProfileError('Not authenticated. Please log in.');
          setIsLoadingProfile(false);
          return;
        }

        const response = await settingsApi.getProfile();
        
        if (response.success && response.data) {
          const userData = response.data as any;
          const profile: UserProfile = {
            id: userData.id || '',
            name: userData.name || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            company: userData.company || '',
            role: userData.role || '',
            avatar: userData.avatar || '',
          };
          setUserProfile(profile);
          setEditedProfile(profile);
        } else {
          setProfileError(response.error || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError('Failed to load profile data');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Profile handlers
  const handleEditProfile = () => {
    setEditedProfile(userProfile);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        name: editedProfile.name || '',
        phone: editedProfile.phone || '',
        company: editedProfile.company || '',
        role: editedProfile.role || '',
        avatar: editedProfile.avatar || '',
      };

      const response = await settingsApi.updateProfile(updateData);
      
      if (response.success && response.data) {
        const userData = response.data as any;
        const profile: UserProfile = {
          id: userData.id || '',
          name: userData.name || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          role: userData.role || '',
          avatar: userData.avatar || '',
        };
        setUserProfile(profile);
        setEditedProfile(profile);
        setIsEditingProfile(false);
        onSave?.({ type: 'profile', data: profile });
        showNotification('Profile updated successfully!');
      } else {
        showNotification(response.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleCancelProfileEdit = () => {
    setEditedProfile(userProfile);
    setIsEditingProfile(false);
  };

  // Payment handlers
  const handleEditPayment = () => {
    setEditedPayment(paymentDetails);
    setIsEditingPayment(true);
  };

  const handleSavePayment = () => {
    setPaymentDetails(editedPayment);
    setIsEditingPayment(false);
    onSave?.({ type: 'payment', data: editedPayment });
    showNotification('Payment details updated successfully!');
  };

  const handleCancelPaymentEdit = () => {
    setEditedPayment(paymentDetails);
    setIsEditingPayment(false);
  };

  // Password handlers
  const handleResetPassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('Please fill in all password fields', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      const response = await settingsApi.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onSave?.({ type: 'password', data: passwordData });
        showNotification('Password updated successfully!');
      } else {
        showNotification(response.error || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Failed to update password', 'error');
    }
  };

  // Integration handlers
  const handleToggleIntegration = (integrationName: string) => {
    const integration = integrations.find(i => i.name === integrationName);
    
    if (integration?.connected) {
      // Disconnect
      setIntegrations(prev =>
        prev.map(i =>
          i.name === integrationName
            ? { ...i, connected: false, config: i.name === 'Slack' ? { workspace: '', apiKey: '' } : { url: '', apiKey: '' } }
            : i
        )
      );
      onSave?.({ type: 'integration-disconnect', integration: integrationName });
      showNotification(`${integrationName} disconnected successfully!`);
    } else {
      // Start editing to connect
      setEditingIntegration(integrationName);
    }
  };

  const handleSaveIntegration = (integrationName: string) => {
    const integration = integrations.find(i => i.name === integrationName);
    
    if (integration?.config) {
      const isValid = integrationName === 'Slack' 
        ? integration.config.workspace && integration.config.apiKey
        : integration.config.url && integration.config.apiKey;

      if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      setIntegrations(prev =>
        prev.map(i =>
          i.name === integrationName ? { ...i, connected: true } : i
        )
      );
      setEditingIntegration(null);
      onSave?.({ type: 'integration-connect', integration: integrationName, config: integration.config });
      showNotification(`${integrationName} connected successfully!`);
    }
  };

  const handleCancelIntegrationEdit = (integrationName: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.name === integrationName
          ? { ...i, config: i.name === 'Slack' ? { workspace: '', apiKey: '' } : { url: '', apiKey: '' } }
          : i
      )
    );
    setEditingIntegration(null);
  };

  const updateIntegrationConfig = (integrationName: string, field: string, value: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.name === integrationName
          ? { ...i, config: { ...i.config, [field]: value } }
          : i
      )
    );
  };

  // Notification helper - now using custom alert
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
      <p className="text-slate-600 mb-8">Manage your account settings and preferences</p>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'profile'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User size={20} />
              <span>User Profile</span>
            </button>
            <button
              onClick={() => setActiveSection('payment')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'payment'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CreditCard size={20} />
              <span>Payment Details</span>
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'security'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Lock size={20} />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveSection('integrations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'integrations'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Link2 size={20} />
              <span>Integrations</span>
            </button>
            <button
              onClick={() => setActiveSection('pricing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'pricing'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pricing & Plans</span>
            </button>
            <button
              onClick={() => setActiveSection('connection' as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === 'connection'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Activity size={20} />
              <span>Connection Status</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* User Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
                  <p className="text-slate-600 mt-1">Manage your personal information</p>
                </div>
                {!isEditingProfile && !isLoadingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Loading State */}
              {isLoadingProfile && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-slate-600">Loading profile...</p>
                </div>
              )}

              {/* Error State */}
              {profileError && !isLoadingProfile && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{profileError}</p>
                </div>
              )}

              {/* Profile Content */}
              {!isLoadingProfile && !profileError && (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {userProfile.firstName?.[0] || userProfile.name?.[0] || 'U'}{userProfile.lastName?.[0] || userProfile.name?.[1] || ''}
                    </div>
                    {isEditingProfile && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Change Avatar
                      </button>
                    )}
                  </div>

                  {/* Profile Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? (editedProfile.name || '') : (userProfile.name || '')}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email || ''}
                        disabled={true}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                        title="Email cannot be changed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={isEditingProfile ? (editedProfile.phone || '') : (userProfile.phone || '')}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? (editedProfile.company || '') : (userProfile.company || '')}
                        onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="Enter company name"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? (editedProfile.role || '') : (userProfile.role || '')}
                        onChange={(e) => setEditedProfile({ ...editedProfile, role: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="Enter your role"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditingProfile && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelProfileEdit}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Details Section */}
          {activeSection === 'payment' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Payment Details</h2>
                  <p className="text-slate-600 mt-1">Manage your billing information</p>
                </div>
                {!isEditingPayment && (
                  <button
                    onClick={handleEditPayment}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit Payment
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Card Preview */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div className="text-sm font-medium opacity-80">Credit Card</div>
                    <div className="text-2xl">💳</div>
                  </div>
                  <div className="text-xl font-mono mb-6 tracking-wider">
                    {isEditingPayment ? editedPayment.cardNumber : paymentDetails.cardNumber}
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs opacity-60 mb-1">Card Holder</div>
                      <div className="font-medium">
                        {isEditingPayment ? editedPayment.cardHolder : paymentDetails.cardHolder}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs opacity-60 mb-1">Expires</div>
                      <div className="font-medium">
                        {isEditingPayment ? editedPayment.expiryDate : paymentDetails.expiryDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.cardNumber : paymentDetails.cardNumber}
                      onChange={(e) => setEditedPayment({ ...editedPayment, cardNumber: e.target.value })}
                      disabled={!isEditingPayment}
                      placeholder="**** **** **** ****"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.cardHolder : paymentDetails.cardHolder}
                      onChange={(e) => setEditedPayment({ ...editedPayment, cardHolder: e.target.value })}
                      disabled={!isEditingPayment}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.expiryDate : paymentDetails.expiryDate}
                      onChange={(e) => setEditedPayment({ ...editedPayment, expiryDate: e.target.value })}
                      disabled={!isEditingPayment}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.zipCode : paymentDetails.zipCode}
                      onChange={(e) => setEditedPayment({ ...editedPayment, zipCode: e.target.value })}
                      disabled={!isEditingPayment}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.billingAddress : paymentDetails.billingAddress}
                      onChange={(e) => setEditedPayment({ ...editedPayment, billingAddress: e.target.value })}
                      disabled={!isEditingPayment}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={isEditingPayment ? editedPayment.country : paymentDetails.country}
                      onChange={(e) => setEditedPayment({ ...editedPayment, country: e.target.value })}
                      disabled={!isEditingPayment}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditingPayment && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSavePayment}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check size={16} />
                      Save Payment Details
                    </button>
                    <button
                      onClick={handleCancelPaymentEdit}
                      className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Security Settings</h2>
                <p className="text-slate-600 mt-1">Update your password and security preferences</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Lock size={16} />
                  Reset Password
                </button>

                {/* Additional Security Options */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Additional Security</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-slate-800">Two-Factor Authentication</div>
                        <div className="text-sm text-slate-600">Add an extra layer of security</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-slate-800">Login Notifications</div>
                        <div className="text-sm text-slate-600">Get notified of new login attempts</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Integrations</h2>
                <p className="text-slate-600 mt-1">Connect your favorite tools and services</p>
              </div>

              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{integration.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{integration.name}</h3>
                          <p className="text-sm text-slate-600">
                            {integration.connected ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Check size={14} /> Connected
                              </span>
                            ) : (
                              'Not connected'
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleIntegration(integration.name)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          integration.connected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Configuration Form */}
                    {editingIntegration === integration.name && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                        {integration.name === 'Slack' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Workspace Name
                              </label>
                              <input
                                type="text"
                                value={integration.config?.workspace || ''}
                                onChange={(e) => updateIntegrationConfig(integration.name, 'workspace', e.target.value)}
                                placeholder="your-workspace"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                API Token
                              </label>
                              <input
                                type="password"
                                value={integration.config?.apiKey || ''}
                                onChange={(e) => updateIntegrationConfig(integration.name, 'apiKey', e.target.value)}
                                placeholder="xoxb-your-token"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                {integration.name} URL
                              </label>
                              <input
                                type="url"
                                value={integration.config?.url || ''}
                                onChange={(e) => updateIntegrationConfig(integration.name, 'url', e.target.value)}
                                placeholder={`https://${integration.name.toLowerCase()}.example.com`}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                API Key
                              </label>
                              <input
                                type="password"
                                value={integration.config?.apiKey || ''}
                                onChange={(e) => updateIntegrationConfig(integration.name, 'apiKey', e.target.value)}
                                placeholder="Enter your API key"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveIntegration(integration.name)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check size={16} />
                            Save & Connect
                          </button>
                          <button
                            onClick={() => handleCancelIntegrationEdit(integration.name)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Connected Configuration Display */}
                    {integration.connected && editingIntegration !== integration.name && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-sm">
                          <div className="text-slate-600 mb-2">Configuration:</div>
                          {integration.name === 'Slack' ? (
                            <div className="text-slate-800">
                              <strong>Workspace:</strong> {integration.config?.workspace}
                            </div>
                          ) : (
                            <div className="text-slate-800">
                              <strong>URL:</strong> {integration.config?.url}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Integration Benefits */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Why integrate?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sync test results with your project management tools</li>
                  <li>• Get real-time notifications in Slack</li>
                  <li>• Automate workflows with GitLab CI/CD</li>
                  <li>• Link test cases to Jira tickets</li>
                </ul>
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {activeSection === 'pricing' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Pricing & Plans</h2>
                <p className="text-slate-600 mt-1">Choose the perfect plan for your testing needs</p>
              </div>

              {/* Billing Toggle */}
              <div className="mb-8 inline-flex items-center bg-slate-100 rounded-full p-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    billingPeriod === 'annual'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>

              {/* Current Plan */}
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">Current Plan</div>
                    <h3 className="text-2xl font-bold text-slate-900">Professional</h3>
                    <p className="text-slate-600 mt-1">Up to 1,000 test executions/month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">
                      ${billingPeriod === 'monthly' ? '99' : '82'}
                      <span className="text-lg font-normal text-slate-600">/mo</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {billingPeriod === 'annual' ? 'Billed annually' : 'Billed monthly'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Available Plans</h3>
                
                {/* Starter Plan */}
                <div className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Starter</h4>
                      <p className="text-slate-600 text-sm mt-1">Perfect for individuals and small teams</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        ${billingPeriod === 'monthly' ? '29' : '24'}
                        <span className="text-sm font-normal text-slate-600">/mo</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Up to 100 test executions/month
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      3 team members
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Basic test automation
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                    Downgrade to Starter
                  </button>
                </div>

                {/* Professional Plan (Current) */}
                <div className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg relative">
                  <div className="absolute -top-3 left-6">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Professional</h4>
                      <p className="text-slate-600 text-sm mt-1">For growing teams with advanced needs</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        ${billingPeriod === 'monthly' ? '99' : '82'}
                        <span className="text-sm font-normal text-slate-600">/mo</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Up to 1,000 test executions/month
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      10 team members
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Advanced test automation
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      All integrations included
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Manage Subscription
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Enterprise</h4>
                      <p className="text-slate-600 text-sm mt-1">For large organizations</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        ${billingPeriod === 'monthly' ? '299' : '249'}
                        <span className="text-sm font-normal text-slate-600">/mo</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Unlimited test executions
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      Unlimited team members
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      AI-powered test generation
                    </li>
                    <li className="flex items-center text-sm text-slate-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      24/7 dedicated support
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium">
                    Upgrade to Enterprise
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Billing History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">December 2025</div>
                      <div className="text-sm text-slate-600">Professional Plan</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">$99.00</div>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Download</a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">November 2025</div>
                      <div className="text-sm text-slate-600">Professional Plan</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">$99.00</div>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Download</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status Section */}
          {activeSection === ('connection' as any) && (
            <ConnectionStatus />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
