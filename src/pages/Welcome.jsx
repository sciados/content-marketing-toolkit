// src/pages/Welcome.jsx - Updated to use SupabaseProvider
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth'
import { 
  Mail, 
  FileText, 
  Send, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Mail className="w-8 h-8 text-blue-600" />,
      title: "Sales Email Generator",
      description: "Create compelling sales email sequences from any product or landing page with AI assistance.",
      available: true
    },
    {
      icon: <Send className="w-8 h-8 text-purple-600" />,
      title: "Email Series Management",
      description: "Organize and manage your email campaigns with advanced series tracking and analytics.",
      available: true
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Blog Post Creator",
      description: "Generate comprehensive blog posts with SEO optimization and engaging content structure.",
      available: false
    },
    {
      icon: <Send className="w-8 h-8 text-orange-600" />,
      title: "Newsletter Creator",
      description: "Create engaging newsletters with curated content and personalized sections.",
      available: false
    }
  ];

  const benefits = [
    "AI-powered content generation",
    "Save hours of writing time",
    "Professional email sequences",
    "Analytics and performance tracking",
    "Multiple content formats",
    "User-friendly interface"
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Content Marketing Toolkit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transform Your Content Marketing with 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Power</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Create compelling sales emails, blog posts, and newsletters in minutes, not hours. 
              Our AI-powered toolkit helps you generate professional content that converts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
              >
                <span>Start Creating Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Content Marketing
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive toolkit provides all the features you need to create, manage, and optimize your content marketing campaigns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl border-2 transition-all hover:shadow-lg ${
                  feature.available
                    ? 'border-gray-200 hover:border-blue-300 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    feature.available ? 'bg-blue-50' : 'bg-gray-100'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                      {feature.available ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Why Choose Our Content Marketing Toolkit?
            </h3>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Save time, increase conversions, and scale your content marketing efforts with our powerful AI-driven platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4"
              >
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Content Marketing?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of marketers who are already creating better content faster with our AI-powered toolkit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center space-x-2"
            >
              <span>Already have an account?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Content Marketing Toolkit</span>
            </div>
            <div className="text-gray-400">
              <p>&copy; 2025 Content Marketing Toolkit. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
