// src/pages/Admin/AdminAds.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useToast } from '../../shared/hooks/useToast';

const AdminAds = () => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAd, setEditingAd] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    cta_text: '',
    position: 'right',
    slot_number: 1,
    ad_type: 'banner',
    size: '300x250',
    is_active: true,
    start_date: '',
    end_date: '',
    background_color: '',
    text_color: '',
    is_gradient: false,
    gradient_from: '',
    gradient_to: ''
  });

  // Check if user is superuser
  const isSuperuser = user?.email === 'appsmartdesk@gmail.com';

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await useAuth
          .from('ads')
          .select('*')
          .order('position', { ascending: true })
          .order('slot_number', { ascending: true });

        if (error) throw error;
        setAds(data || []);
      } catch (error) {
        console.error('Error fetching ads:', error);
        showToast('Error loading ads', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSuperuser) {
      fetchAds();
    }
  }, [isSuperuser, showToast]);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await useAuth
        .from('ads')
        .select('*')
        .order('position', { ascending: true })
        .order('slot_number', { ascending: true });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      showToast('Error loading ads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        slot_number: parseInt(formData.slot_number),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingAd) {
        // Update existing ad
        const { error } = await useAuth
          .from('ads')
          .update(dataToSubmit)
          .eq('id', editingAd.id);

        if (error) throw error;
        showToast('Ad updated successfully', 'success');
      } else {
        // Create new ad
        const { error } = await useAuth
          .from('ads')
          .insert([dataToSubmit]);

        if (error) throw error;
        showToast('Ad created successfully', 'success');
      }

      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      showToast('Error saving ad', 'error');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      ...ad,
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : '',
      end_date: ad.end_date ? new Date(ad.end_date).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await useAuth
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Ad deleted successfully', 'success');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      showToast('Error deleting ad', 'error');
    }
  };

  const toggleAdStatus = async (ad) => {
    try {
      const { error } = await useAuth
        .from('ads')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);

      if (error) throw error;
      showToast(`Ad ${ad.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      showToast('Error updating ad status', 'error');
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      cta_text: '',
      position: 'right',
      slot_number: 1,
      ad_type: 'banner',
      size: '300x250',
      is_active: true,
      start_date: '',
      end_date: '',
      background_color: '',
      text_color: '',
      is_gradient: false,
      gradient_from: '',
      gradient_to: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Show loading while checking auth
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Redirect if not superuser
  if (!isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ad Management</h1>
        <p className="text-gray-600 mt-2">Manage sidebar advertisements</p>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingAd ? 'Edit Ad' : 'Create New Ad'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Text
                </label>
                <input
                  type="text"
                  name="cta_text"
                  value={formData.cta_text}
                  onChange={handleInputChange}
                  placeholder="Learn More"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Ad Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Type
                </label>
                <select
                  name="ad_type"
                  value={formData.ad_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="banner">Banner</option>
                  <option value="featured">Featured</option>
                  <option value="text">Text</option>
                  <option value="sponsored">Sponsored</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="300x250">300x250 (Medium Rectangle)</option>
                  <option value="336x280">336x280 (Large Rectangle)</option>
                  <option value="160x600">160x600 (Wide Skyscraper)</option>
                  <option value="300x600">300x600 (Half Page)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="right">Right Sidebar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Number
                </label>
                <input
                  type="number"
                  name="slot_number"
                  value={formData.slot_number}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Styling */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_gradient"
                    checked={formData.is_gradient}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Use Gradient Background</span>
                </label>
              </div>

              {formData.is_gradient ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gradient From
                    </label>
                    <input
                      type="color"
                      name="gradient_from"
                      value={formData.gradient_from || '#000000'}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gradient To
                    </label>
                    <input
                      type="color"
                      name="gradient_to"
                      value={formData.gradient_to || '#000000'}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    name="background_color"
                    value={formData.background_color || '#ffffff'}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-1 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  name="text_color"
                  value={formData.text_color || '#000000'}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-1 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700"
              >
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700"
        >
          Create New Ad
        </button>
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Current Ads</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                      <div className="text-sm text-gray-500">{ad.size}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {ad.ad_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Slot {ad.slot_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ad.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-xs">
                      <div>Clicks: {ad.click_count || 0}</div>
                      <div>Views: {ad.impression_count || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-brand-600 hover:text-brand-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleAdStatus(ad)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {ad.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {ads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No ads created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAds;
