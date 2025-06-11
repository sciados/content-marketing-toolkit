// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Button from '../../shared/components/ui/Button';
import Loader from '../../shared/components/ui/Loader';

/**
 * Registration page component
 * Handles user registration with Supabase
 */
const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
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
      
      // Register user with Supabase
      const { error, data } = await signUp(email, password);
      
      if (error) throw error;
      
      // Create the user profile with first name and last name
      // Profile creation is handled automatically by the trigger we set up in the database
      
      // Show success message
      setSuccess(true);
      showSuccess('Registration successful! Please check your email for confirmation.');
      
      // If email confirmation is not required, we can navigate to login
      // If email confirmation is required (default), show success message
      if (data?.user && !data?.session) {
        // Email confirmation required
        setSuccess(true);
      } else {
        // No email confirmation required, go to dashboard
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        setError('This email is already registered');
      } else if (error.message.includes('weak password')) {
        setError('Password is too weak. Use at least 8 characters with a mix of letters, numbers and symbols.');
      } else {
        setError(error.message || 'An error occurred during registration');
      }
      
      showError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="text-center mb-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800">Create an account</h1>
        <p className="text-gray-600 mt-2">
          Join us to access powerful AI-powered email marketing tools.
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">
                We've sent a confirmation email to <strong>{email}</strong>.
                Please check your inbox and click the verification link to activate your account.
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
              
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
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
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
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
                    Confirm Password
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
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-800">
                  Log in
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Register;
