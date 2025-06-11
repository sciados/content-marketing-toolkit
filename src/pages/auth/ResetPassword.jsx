// src/pages/Auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Button from '../../shared/components/ui/Button';
import Loader from '../../shared/components/ui/Loader';

/**
 * Reset Password page component
 * Handles both password reset request and password update
 */
const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState('request'); // 'request' or 'update'

  const { resetPassword, updatePassword } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a token in the URL, which means we're updating the password
  useEffect(() => {
    const hash = window.location.hash;
    const query = new URLSearchParams(location.search);
    
    // Supabase password reset URLs will have a hash and a type=recovery query param
    if ((hash && hash.includes('type=recovery')) || query.get('type') === 'recovery') {
      setMode('update');
    }
  }, [location]);

  // Handle password reset request
  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setSuccess(true);
      showSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred while requesting password reset');
      showError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await updatePassword(password);
      
      if (error) throw error;
      
      setSuccess(true);
      showSuccess('Password has been updated successfully!');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Update password error:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        setError('The reset link has expired or is invalid. Please request a new one.');
      } else {
        setError(error.message || 'An error occurred while updating your password');
      }
      
      showError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="text-center mb-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800">
          {mode === 'request' ? 'Reset your password' : 'Set new password'}
        </h1>
        <p className="text-gray-600 mt-2">
          {mode === 'request' 
            ? 'Enter your email address and we will send you a link to reset your password.' 
            : 'Enter your new password below.'}
        </p>
      </div>
      
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {mode === 'request' ? 'Reset Link Sent!' : 'Password Updated!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {mode === 'request' 
                  ? `We've sent a password reset link to ${email}. Please check your inbox.` 
                  : 'Your password has been updated successfully. You can now log in with your new password.'}
              </p>
              <Button 
                onClick={() => navigate('/auth/login')}
                className="mt-2"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {mode === 'request' ? (
                <form onSubmit={handleResetRequest}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader size="sm" className="mr-2" />
                        Sending reset link...
                      </span>
                    ) : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      At least 8 characters with letters, numbers and symbols
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader size="sm" className="mr-2" />
                        Updating password...
                      </span>
                    ) : 'Update Password'}
                  </Button>
                </form>
              )}
              
              <div className="mt-6 text-center text-sm text-gray-600">
                <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-800">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
