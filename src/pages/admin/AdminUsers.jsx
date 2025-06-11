import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
// import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../shared/hooks/useAuth';
import { useToast } from '../../shared/hooks/useToast';

const AdminUsers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [newTier, setNewTier] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Check if user is superuser - using user ID instead of email for more reliability
  const isSuperuser = user?.id === 'e7eb009a-d165-4ab0-972f-dda205a03a85' || user?.email === 'appsmartdesk@gmail.com';

  // Debug logging
  useEffect(() => {
    console.log('🔍 AdminUsers - Current user:', user);
    console.log('🔍 AdminUsers - Is superuser:', isSuperuser);
  }, [user, isSuperuser]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('🔄 Fetching all users from profiles table...');
      
      // Fetch users with basic profile data first
      const { data: usersData, error: usersError } = await useAuth
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        throw usersError;
      }
      
      console.log('📋 Raw users data:', usersData);
      console.log('📊 Total users found:', usersData?.length || 0);
      
      // Get counts for each user separately
      const usersWithCounts = await Promise.all(
        usersData.map(async (userData) => {
          try {
            // Count email series for this user
            const { count: seriesCount, error: seriesError } = await useAuth
              .from('email_series')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userData.id);
            
            if (seriesError) {
              console.warn('⚠️ Error counting series for user', userData.id, seriesError);
            }
            
            // Count emails for this user
            const { count: emailCount, error: emailError } = await useAuth
              .from('emails')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userData.id);
            
            if (emailError) {
              console.warn('⚠️ Error counting emails for user', userData.id, emailError);
            }
            
            const processedUser = {
              ...userData,
              series_count: seriesCount || 0,
              email_count: emailCount || 0,
              // Ensure subscription_tier has a default
              subscription_tier: userData.subscription_tier || 'free'
            };
            
            console.log('👤 Processed user:', processedUser.email, 'Tier:', processedUser.subscription_tier);
            
            return processedUser;
          } catch (userError) {
            console.error('❌ Error processing user', userData.id, userError);
            return {
              ...userData,
              series_count: 0,
              email_count: 0,
              subscription_tier: userData.subscription_tier || 'free'
            };
          }
        })
      );
      
      setUsers(usersWithCounts);
      console.log('✅ Users set in state:', usersWithCounts.length);
      
    } catch (error) {
      console.error('❌ Error in fetchUsers:', error);
      showToast('Error loading users: ' + error.message, 'error');
    }
  }, [showToast]);

  const fetchTiers = useCallback(async () => {
    try {
      console.log('🔄 Fetching subscription tiers...');
      
      const { data: tiersData, error: tiersError } = await useAuth
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });
      
      if (tiersError) {
        console.error('❌ Error fetching tiers:', tiersError);
        throw tiersError;
      }
      
      console.log('📋 Tiers data:', tiersData);
      setTiers(tiersData || []);
      
    } catch (error) {
      console.error('❌ Error in fetchTiers:', error);
      showToast('Error loading tiers: ' + error.message, 'error');
      
      // Fallback tiers if database fetch fails
      setTiers([
        { name: 'free', display_name: 'Free', badge_color: 'gray' },
        { name: 'pro', display_name: 'Pro', badge_color: 'blue' },
        { name: 'gold', display_name: 'Gold', badge_color: 'purple' },
        { name: 'superAdmin', display_name: 'Super Admin', badge_color: 'purple' }
      ]);
    }
  }, [showToast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSuperuser) {
        console.log('❌ User is not superuser, skipping data fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchTiers()]);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        showToast('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSuperuser, fetchUsers, fetchTiers, showToast]);

  const handleChangeTier = async () => {
    if (!selectedUser || !newTier) {
      showToast('Please select a tier', 'error');
      return;
    }

    try {
      setUpdating(true);
      console.log('🔄 Updating user tier:', selectedUser.email, 'to', newTier);
      
      // Update directly in Supabase profiles table
      const { error: updateError } = await useAuth
        .from('profiles')
        .update({ 
          subscription_tier: newTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (updateError) {
        console.error('❌ Error updating tier:', updateError);
        throw updateError;
      }
      
      console.log('✅ User tier updated successfully');
      showToast(`User ${selectedUser.email} updated to ${newTier} tier`, 'success');
      
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
      console.error('❌ Error updating tier:', error);
      showToast(error.message || 'Error updating tier', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openTierModal = (userData) => {
    console.log('🔧 Opening tier modal for user:', userData.email);
    setSelectedUser(userData);
    setNewTier(userData.subscription_tier || 'free');
    setShowTierModal(true);
  };

  const getTierBadgeColor = (tierName) => {
    const tier = tiers.find(t => t.name === tierName);
    const colors = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800'
    };
    return colors[tier?.badge_color] || colors.gray;
  };

  const getTierDisplayName = (tierName) => {
    const tier = tiers.find(t => t.name === tierName);
    return tier?.display_name || tierName?.charAt(0).toUpperCase() + tierName?.slice(1) || 'Free';
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>        
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
          <h3 className="text-sm font-medium text-gray-500">Premium Users</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {users.filter(u => ['gold', 'superAdmin'].includes(u.subscription_tier)).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
        </div>
        
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No users found. This might indicate a database issue.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-indigo-600 hover:text-indigo-700 underline"
            >
              Refresh Page
            </button>
          </div>
        ) : (
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
                    Quotas
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
                {users.map((userData) => (
                  <tr key={userData.id} className={userData.email === 'appsmartdesk@gmail.com' ? 'bg-purple-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{userData.email}</div>
                        <div className="text-sm text-gray-500">
                          {userData.first_name || userData.last_name ? 
                            `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
                            'No name set'
                          }
                        </div>
                        <div className="text-xs text-gray-400">ID: {userData.id.substring(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeColor(userData.subscription_tier || 'free')}`}>
                        {getTierDisplayName(userData.subscription_tier || 'free')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        <div>Emails: {userData.email_count || 0}</div>
                        <div>Series: {userData.series_count || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        <div>Email Quota: {userData.email_quota || 'N/A'}</div>
                        <div>Token Quota: {userData.token_quota || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userData.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openTierModal(userData)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Change Tier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                Current Tier: <strong>{getTierDisplayName(selectedUser?.subscription_tier || 'free')}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={updating}
              >
                {tiers.map(tier => (
                  <option key={tier.name} value={tier.name}>
                    {getTierDisplayName(tier.name)}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Admin adjustment, special promotion, etc."
                disabled={updating}
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
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeTier}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
