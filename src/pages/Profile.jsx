// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useProfile } from '../shared/hooks/useProfile';
import { useToast } from '../shared/hooks/useToast';
import Card from '../shared/components/ui/Card';
import Input from '../shared/components/ui/Input';
import Button from '../shared/components/ui/Button';
import Loader from '../shared/components/ui/Loader';
import Toast from '../shared/components/ui/Toast';
import { Link } from 'react-router-dom';

/**
 * User profile page
 * Allows users to view and edit their profile information
 */
const Profile = () => {
  const { profile, profileStats, loading, updateProfile, updateAvatar } = useProfile();
  const { toast, showToast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    website: '',
    industry: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        company: profile.company || '',
        role: profile.role || '',
        website: profile.website || '',
        industry: profile.industry || ''
      });
    }
  }, [profile]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormSubmitting(true);
      
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        role: formData.role,
        website: formData.website,
        industry: formData.industry
      });
      
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast(`Error updating profile: ${error.message}`, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a valid image file (JPEG, PNG, or GIF)', 'error');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }
    
    try {
      setAvatarUploading(true);
      
      // First, check if the avatars bucket exists
      try {
        await updateAvatar(file);
        showToast('Profile picture updated successfully!', 'success');
      } catch (uploadError) {
        // If the error is about the bucket not existing, show a more helpful message
        if (uploadError.message && uploadError.message.includes('Bucket not found')) {
          console.error('Storage bucket error:', uploadError);
          showToast('Avatar storage not configured - please create an "avatars" bucket in Supabase storage', 'error');
        } else {
          // For other errors, show the error message
          throw uploadError;
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showToast(`Error uploading image: ${error.message}`, 'error');
    } finally {
      setAvatarUploading(false);
    }
  };
  
  // Format subscription status for display
const formatSubscriptionStatus = () => {
  if (!profileStats) return 'Loading...';
  
  const { subscriptionTier, subscriptionStatus } = profileStats;
  
  // Map tier names to display names
  const tierDisplayNames = {
    'free': 'Free Plan',
    'pro': 'Pro Plan',
    'gold': 'Gold Plan'
  };
  
  const displayName = tierDisplayNames[subscriptionTier] || subscriptionTier;
  
  if (subscriptionTier === 'free') {
    return displayName;
  }
  
  return `${displayName} (${subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)})`;
};

  
  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-600">Manage your account information and subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile picture and stats */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <div className="flex flex-col items-center p-6">
              <div className="relative mb-4">
                {avatarUploading ? (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100">
                    <Loader size="sm" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-semibold">
                        {profile?.first_name?.[0]?.toUpperCase() || ''}
                        {profile?.last_name?.[0]?.toUpperCase() || ''}
                      </div>
                    )}
                  </div>
                )}
                
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
                  </svg>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/gif" 
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800">
                {profile?.first_name || ''} {profile?.last_name || ''}
              </h2>
              
              {profile?.role && profile?.company && (
                <p className="text-gray-600 text-sm">
                  {profile.role} at {profile.company}
                </p>        )}
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Subscription</p>
                  <p className="font-medium text-gray-800">{profileStats?.subscriptionTier}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Emails Generated</p>
                  <p className="font-medium text-gray-800">{profileStats?.emailsGenerated || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Emails Saved</p>
                  <p className="font-medium text-gray-800">
                    {profileStats?.emailsSaved || 0}
                    {profileStats?.email_quota && (
                      <span className="text-sm text-gray-500 ml-1">
                        / {profileStats.emailsSaved}
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email Series</p>
                  <p className="font-medium text-gray-800">{profileStats?.seriesCount || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Profile Form */}
        <div className="md:col-span-2">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Profile Information</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Role
                    </label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Your Role"
                    />
                  </div>
                </div>
                
                <div className="space-y-6 mb-6">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <Input
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Your Industry"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
          
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M20.91 8.84L8.56 20.8a2.06 2.06 0 0 1-2.9.01L1.8 17.27a1.98 1.98 0 0 1-.01-2.82l5.57-5.55a1.95 1.95 0 0 1 2.75 0l1.43 1.43a2 2 0 0 0 2.82 0L20.9 3.9"></path>
                      <path d="M5.83 9.7L2.29 13.23a2 2 0 0 0 0 2.85l3.34 3.34a2 2 0 0 0 2.85 0l3.53-3.53"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Current Plan: {formatSubscriptionStatus()}</h4>
                    {profileStats?.subscriptionTier === 'free' && (
                      <p className="text-sm text-gray-600 mt-1">
                        Free tier allows up to {profileStats?.email_quota || 20} saved emails
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
               {profileStats?.subscriptionTier === 'free' && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Upgrade for more features</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upgrade to a premium plan for unlimited emails, AI generation, and more advanced features.
                  </p>
                  <Link to="/subscription">
                    <Button
                      variant="primary"
                      className="px-6 py-2"
                    >
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
