// src/pages/Admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { subscriptions } from '../../services/supabase/subscriptions';
import useSupabase from '../../hooks/useSupabase';
import { useToast } from '../../hooks/useToast';

const AdminUsers = () => {
  const { user } = useSupabase();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [newTier, setNewTier] = useState('');
  const [reason, setReason] = useState('');

  // Check if user is superuser
  const isSuperuser = user?.email === 'appsmartdesk@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users with basic profile data first
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        
        // Get counts for each user separately
        const usersWithCounts = await Promise.all(
          usersData.map(async (user) => {
            // Count email series for this user
            const { count: seriesCount } = await supabase
              .from('email_series')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            
            // Count emails for this user
            const { count: emailCount } = await supabase
              .from('emails')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            
            return {
              ...user,
              series_count: seriesCount || 0,
              email_count: emailCount || 0
            };
          })
        );
        
        setUsers(usersWithCounts);
        
        // Fetch tiers
        const tiersData = await subscriptions.getTiers();
        setTiers(tiersData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isSuperuser) {
      fetchData();
    }
  }, [isSuperuser, showToast]);

  const handleChangeTier = async () => {
    if (!selectedUser || !newTier) return;

    try {
      await subscriptions.updateUserTier(selectedUser.id, newTier, reason);
      showToast('User tier updated successfully', 'success');
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, subscription_tier: newTier }
          : u
      ));
      
      // Close modal
      setShowTierModal(false);
      setSelectedUser(null);
      setNewTier('');
      setReason('');
    } catch (error) {
      console.error('Error updating tier:', error);
      showToast(error.message || 'Error updating tier', 'error');
    }
  };

  const openTierModal = (user) => {
    setSelectedUser(user);
    setNewTier(user.subscription_tier || 'free');
    setShowTierModal(true);
  };

  const getTierBadgeColor = (tierName) => {
    const tier = tiers.find(t => t.name === tierName);
    const colors = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[tier?.badge_color] || colors.gray;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (!isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user subscriptions and tiers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Free Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter(u => u.subscription_tier === 'free' || !u.subscription_tier).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pro Users</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {users.filter(u => u.subscription_tier === 'pro').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Super Admins</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {users.filter(u => u.subscription_tier === 'gold').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={user.email === 'appsmartdesk@gmail.com' ? 'bg-purple-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.first_name} {user.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeColor(user.subscription_tier || 'free')}`}>
                      {tiers.find(t => t.name === (user.subscription_tier || 'free'))?.display_name || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-xs">
                      <div>Emails: {user.email_count}</div>
                      <div>Series: {user.series_count}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openTierModal(user)}
                      className="text-brand-600 hover:text-brand-900"
                    >
                      Change Tier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Tier Modal */}
      {showTierModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Change User Tier</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                User: <strong>{selectedUser?.email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Current Tier: <strong>{selectedUser?.subscription_tier || 'free'}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {tiers.map(tier => (
                  <option key={tier.name} value={tier.name}>
                    {tier.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Admin adjustment, special promotion, etc."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTierModal(false);
                  setSelectedUser(null);
                  setNewTier('');
                  setReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeTier}
                className="px-4 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700"
              >
                Update Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;