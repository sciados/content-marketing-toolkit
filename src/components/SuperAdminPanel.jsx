/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Save, Plus, Edit, Trash2, Users, Settings, RefreshCw } from 'lucide-react';

// Mock data - moved outside component to avoid dependency issues
const mockTiers = [
  {
    id: 1,
    name: 'free',
    display_name: 'Free',
    description: 'Perfect for testing the water',
    price_monthly: 0,
    price_yearly: 0,
    monthly_tokens: 10000,
    daily_tokens: 500,
    videos_per_day: 5,
    api_calls_per_hour: 20,
    email_quota: 10,
    series_limit: 1,
    token_quota: 2000,
    is_active: true
  },
  {
    id: 2,
    name: 'gold',
    display_name: 'Gold',
    description: 'For the true marketing professionals',
    price_monthly: 27,
    price_yearly: 249,
    monthly_tokens: 100000,
    daily_tokens: 5000,
    videos_per_day: 50,
    api_calls_per_hour: 200,
    email_quota: 1000,
    series_limit: 30,
    token_quota: 500000,
    is_active: true
  },
  {
    id: 3,
    name: 'pro',
    display_name: 'Pro',
    description: 'For growing businesses',
    price_monthly: 17,
    price_yearly: 149,
    monthly_tokens: 50000,
    daily_tokens: 2000,
    videos_per_day: 25,
    api_calls_per_hour: 100,
    email_quota: 200,
    series_limit: 10,
    token_quota: 50000,
    is_active: true
  },
  {
    id: 4,
    name: 'superAdmin',
    display_name: 'Super Admin',
    description: 'Admin access with unlimited features',
    price_monthly: 0,
    price_yearly: 0,
    monthly_tokens: 1000000,
    daily_tokens: 50000,
    videos_per_day: 1000,
    api_calls_per_hour: 5000,
    email_quota: 5000,
    series_limit: 200,
    token_quota: 10000000,
    is_active: true
  }
];

const mockUsers = [
  {
    id: '893121a2-5ac0-42a4-b580-e5ef878fbe85',
    email: 'shaunpgp@gmail.com',
    subscription_tier: 'gold',
    subscription_status: 'active',
    created_at: '2025-06-01T10:00:00Z',
    last_login: '2025-06-04T09:47:00Z'
  },
  {
    id: 'test-user-123',
    email: 'test@example.com',
    subscription_tier: 'free',
    subscription_status: 'active',
    created_at: '2025-06-01T10:00:00Z',
    last_login: '2025-06-03T14:30:00Z'
  }
];

const SuperAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tiers');
  const [tiers, setTiers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (activeTab === 'tiers') {
        setTiers(mockTiers);
      } else {
        setUsers(mockUsers);
      }
      setLoading(false);
    }, 500);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  const updateTier = async (tierId, updates) => {
    setSaving(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTiers(prev => prev.map(tier => 
        tier.id === tierId ? { ...tier, ...updates } : tier
      ));
      
      setMessage('✅ Tier updated successfully');
    } catch (error) {
      setMessage('❌ Failed to update tier');
    } finally {
      setSaving(false);
    }
  };

  const updateUserTier = async (userId, newTier) => {
    setSaving(true);
    setMessage('');
    
    try {
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, subscription_tier: newTier } : user
      ));
      
      setMessage(`✅ User tier updated to ${newTier}`);
    } catch (error) {
      setMessage('❌ Failed to update user tier');
    } finally {
      setSaving(false);
    }
  };

  const syncTierData = async () => {
    setSaving(true);
    setMessage('Syncing tier data across all systems...');
    
    try {
      // Simulate comprehensive sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('✅ All tier data synchronized successfully');
    } catch (error) {
      setMessage('❌ Sync failed');
    } finally {
      setSaving(false);
    }
  };

  const TierEditor = ({ tier, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState(tier);

    const handleSave = () => {
      onUpdate(tier.id, formData);
      setEditing(false);
    };

    if (!editing) {
      return (
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm">{tier.name}</td>
          <td className="px-4 py-3 text-sm">{tier.display_name}</td>
          <td className="px-4 py-3 text-sm">${tier.price_monthly}</td>
          <td className="px-4 py-3 text-sm text-center">{tier.monthly_tokens.toLocaleString()}</td>
          <td className="px-4 py-3 text-sm text-center">{tier.daily_tokens.toLocaleString()}</td>
          <td className="px-4 py-3 text-sm text-center">{tier.email_quota}</td>
          <td className="px-4 py-3 text-sm text-center">{tier.series_limit}</td>
          <td className="px-4 py-3 text-sm text-center">
            <span className={`px-2 py-1 rounded-full text-xs ${tier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {tier.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 text-sm">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800 mr-2"
            >
              <Edit className="w-4 h-4" />
            </button>
          </td>
        </tr>
      );
    }

    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-1 border rounded text-sm"
            disabled
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={formData.price_monthly}
            onChange={(e) => setFormData({...formData, price_monthly: parseFloat(e.target.value)})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={formData.monthly_tokens}
            onChange={(e) => setFormData({...formData, monthly_tokens: parseInt(e.target.value)})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={formData.daily_tokens}
            onChange={(e) => setFormData({...formData, daily_tokens: parseInt(e.target.value)})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={formData.email_quota}
            onChange={(e) => setFormData({...formData, email_quota: parseInt(e.target.value)})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={formData.series_limit}
            onChange={(e) => setFormData({...formData, series_limit: parseInt(e.target.value)})}
            className="w-full p-1 border rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
            className="w-full p-1 border rounded text-sm"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-green-600 hover:text-green-800"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const UserRow = ({ user, onUpdateTier }) => {
    const [selectedTier, setSelectedTier] = useState(user.subscription_tier);

    const handleTierChange = (newTier) => {
      setSelectedTier(newTier);
      onUpdateTier(user.id, newTier);
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm font-mono">{user.id.substring(0, 8)}...</td>
        <td className="px-4 py-3 text-sm">{user.email}</td>
        <td className="px-4 py-3 text-sm">
          <select
            value={selectedTier}
            onChange={(e) => handleTierChange(e.target.value)}
            className="p-1 border rounded text-sm"
            disabled={saving}
          >
            {tiers.map(tier => (
              <option key={tier.name} value={tier.name}>
                {tier.display_name} ({tier.name})
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs ${user.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {user.subscription_status}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(user.last_login).toLocaleDateString()}
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage subscription tiers and user accounts</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={syncTierData}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                Sync All Data
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : message.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
              {message}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tiers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tiers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Subscription Tiers ({tiers.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Management ({users.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : activeTab === 'tiers' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Subscription Tiers Management</h2>
                <p className="text-gray-600">Configure pricing, quotas, and limits for each subscription tier.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Price</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Tokens</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Tokens</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email Quota</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Series Limit</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tiers.map(tier => (
                      <TierEditor
                        key={tier.id}
                        tier={tier}
                        onUpdate={updateTier}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Important Notes</h3>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      <li>• Changes to tier quotas will affect all users on that tier</li>
                      <li>• Monthly tokens reset on the 1st of each month</li>
                      <li>• Daily tokens reset at midnight UTC</li>
                      <li>• Use "Sync All Data" to update profiles when tier names change</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">User Management</h2>
                <p className="text-gray-600">Manage user subscription tiers and account status.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Tier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onUpdateTier={updateUserTier}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Tier Management Tips</h3>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Changing a user's tier immediately updates their quotas</li>
                      <li>• Use "gold" for premium marketing professionals</li>
                      <li>• Use "pro" for growing businesses</li>
                      <li>• Use "superAdmin" for admin accounts</li>
                      <li>• Changes are reflected in real-time across all systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;