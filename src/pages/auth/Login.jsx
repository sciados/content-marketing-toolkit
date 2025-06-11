// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

import useToast from '../../shared/hooks/useToast';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import Button from '../../shared/components/ui/Button';
import Loader from '../../shared/components/ui/Loader';

/**
 * Login page component
 * Handles user authentication with Supabase
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, signIn } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they tried to visit before being redirected to login
  const from = location.state?.from || '/dashboard';
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("Attempting login with:", email);
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Success, navigate to the page they tried to visit or dashboard
      showSuccess('Successfully logged in!');
      console.log("Login successful, redirecting to:", from);
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error codes
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in');
      } else {
        setError(error.message || 'An error occurred during login');
      }
      
      showError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="text-center mb-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800">Log in to your account</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Please enter your credentials to access your account.
        </p>
      </div>
      
      <Card className="w-full max-w-lg mx-auto">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
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
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/auth/reset-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Logging in...
                </span>
              ) : 'Log in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-800">
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
