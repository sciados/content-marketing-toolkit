// src/pages/Admin/FixsuperAdmin.jsx
import React, { useState } from 'react';
// import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../shared/hooks/useAuth';

const FixsuperAdmin = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fixsuperAdminStatus = async () => {
    if (user?.email !== 'appsmartdesk@gmail.com') {
      setStatus('This action is only available for appsmartdesk@gmail.com');
      return;
    }

    setLoading(true);
    try {
      // Update the profile
      const { error } = await useAuth
        .from('profiles')
        .update({
          subscription_tier: 'superAdmin',
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setStatus('✅ Successfully updated to superAdmin status! Please refresh the page.');
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating status:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'appsmartdesk@gmail.com') {
    return (
      <div className="p-8">
        <p className="text-red-600">Access denied. This page is only for the super admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Fix superAdmin Status</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">
          Current user: <strong>{user.email}</strong>
        </p>
        
        <p className="mb-6 text-gray-600">
          Click the button below to update your account to superAdmin status.
        </p>
        
        <button
          onClick={fixsuperAdminStatus}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update to superAdmin'}
        </button>
        
        {status && (
          <div className="mt-4 p-4 rounded bg-gray-100">
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixsuperAdmin;
