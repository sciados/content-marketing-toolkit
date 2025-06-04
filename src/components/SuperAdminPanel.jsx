import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Save, Edit, Users, Settings, RefreshCw, Database, User, Shield } from 'lucide-react';

const SuperAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tiers');
  const [tiers, setTiers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Get API base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aiworkers.onrender.com';

  // Get auth token from localStorage
  const getAuthToken = () => {
    const storedAuth = localStorage.getItem('sb-gjqpyfrdxvecxwfsmory-auth-token');
    if (!storedAuth) return null;
    
    try {
      const authData = JSON.parse(storedAuth);
      return authData.access_token;
    } catch {
      return null;
    }
  };

  // Make authenticated API calls
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }, [API_BASE]);

  // Get current user info
  const getCurrentUser = useCallback(async () => {
    try {
      const result = await apiCall('/api/usage/limits');
      if (result.success && result.user_info) {
        setCurrentUser(result.user_info);
        return result.user_info;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      setMessage('❌ Failed to authenticate user');
    }
    return null;
  }, [apiCall]);

  // Load subscription tiers from database
  const loadTiers = useCallback(async () => {
    try {
      // Get real tier data from admin API
      const result = await apiCall('/api/admin/tiers');
      
      if (result.success && result.data) {
        setTiers(result.data);
        setMessage('✅ Real tier data loaded from database');
      } else {
        throw new Error(result.message || 'Failed to load tiers');
      }
    } catch (error) {
      console.error('Failed to load tiers:', error);
      setMessage('❌ Failed to load tier data: ' + error.message);
    }
  }, [apiCall]);

  // Load users - get real user data from admin API
  const loadUsers = useCallback(async () => {
    try {
      const result = await apiCall('/api/admin/users');
      
      if (result.success && result.data) {
        setUsers(result.data.map(user => ({
          id: user.id,
          email: user.email || 'No email',
          subscription_tier: user.subscription_tier,
          subscription_status: user.subscription_status || 'active',
          created_at: user.created_at,
          last_login: user.updated_at || user.created_at
        })));
        setMessage('✅ Real user data loaded from profiles table');
      } else {
        throw new Error(result.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage('❌ Failed to load user data: ' + error.message);
    }
  }, [apiCall]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage('Loading real data from backend...');
    
    try {
      await getCurrentUser();
      
      if (activeTab === 'tiers') {
        await loadTiers();
      } else {
        await loadUsers();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('❌ Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getCurrentUser, loadTiers, loadUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if user has admin access
  const hasAdminAccess = currentUser?.subscription_tier === 'superAdmin' || 
                        currentUser?.subscription_tier === 'admin';

  if (currentUser && !hasAdminAccess) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-red-700">Super Admin access required to view this panel.</p>
          <p className="text-sm text-red-600 mt-2">Current tier: {currentUser?.subscription_tier || 'unknown'}</p>
          <p className="text-xs text-gray-500 mt-4">User ID: {currentUser?.user_id}</p>
        </div>
      </div>
    );
  }

  const updateTier = async (tierId, updates) => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await apiCall(`/api/admin/tiers/${tierId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (result.success) {
        setTiers(prev => prev.map(tier => 
          tier.id === tierId ? { ...tier, ...updates } : tier
        ));
        setMessage('✅ Tier updated successfully in database');
      } else {
        throw new Error(result.message || 'Failed to update tier');
      }
    } catch (error) {
      setMessage('❌ Failed to update tier: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateUserTier = async (userId, newTier) => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await apiCall(`/api/admin/users/${userId}/tier`, {
        method: 'PUT',
        body: JSON.stringify({ subscription_tier: newTier })
      });
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, subscription_tier: newTier } : user
        ));
        setMessage(`✅ User tier updated to ${newTier} in database`);
      } else {
        throw new Error(result.message || 'Failed to update user tier');
      }
    } catch (error) {
      setMessage('❌ Failed to update user tier: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const syncTierData = async () => {
    setSaving(true);
    setMessage('Syncing tier data across all systems...');
    
    try {
      const result = await apiCall('/api/admin/sync-tiers', {
        method: 'POST'
      });
      
      if (result.success) {
        await loadData(); // Reload all data
        setMessage(`✅ Sync completed: ${result.data.updates_made} users updated`);
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      setMessage('❌ Sync failed: ' + error.message);
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
          <td className="px-4 py-3 text-sm font-medium">{tier.name}</td>
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
              className="text-blue-600 hover:text-blue-800"
              title="Edit tier"
            >
              <Edit className="w-4 h-4" />
            </button>
          </td>
        </tr>
      );
    }

    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3 text-sm font-mono text-gray-500">{tier.name}</td>
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
            step="0.01"
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
              className="text-green-600 hover:text-green-800 disabled:opacity-50"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-600 hover:text-gray-800"
              title="Cancel"
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
        <td className="px-4 py-3 text-sm font-mono text-gray-600">{user.id.substring(0, 12)}...</td>
        <td className="px-4 py-3 text-sm">{user.email}</td>
        <td className="px-4 py-3 text-sm">
          <select
            value={selectedTier}
            onChange={(e) => handleTierChange(e.target.value)}
            className="p-1 border rounded text-sm bg-white"
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
              <p className="text-gray-600 mt-1">Real-time subscription tier and user management</p>
              {currentUser && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ Connected as: {currentUser.subscription_tier} (ID: {currentUser.user_id?.substring(0, 8)}...)
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={syncTierData}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                Sync Real Data
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
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <div className="text-gray-500">Loading real data from backend...</div>
              </div>
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

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">Live Database Integration</h3>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• ✅ Connected to live subscription_tiers table</li>
                      <li>• ✅ Real-time CRUD operations on your database</li>
                      <li>• ✅ All changes immediately saved to Supabase</li>
                      <li>• ✅ Admin API fully deployed and operational</li>
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

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">Live User Management</h3>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• ✅ Real user data from profiles table</li>
                      <li>• ✅ Tier changes update database immediately</li>
                      <li>• ✅ Full admin control over all user accounts</li>
                      <li>• ✅ Real-time sync with authentication system</li>
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