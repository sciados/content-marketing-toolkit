import React from 'react';

const AuthenticationRequired = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <span className="text-white text-3xl">🔐</span>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">
      Welcome to Video2Promo
    </h2>
    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
      Please sign in to transform your YouTube videos into comprehensive marketing campaigns
    </p>
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => window.location.href = '/login'}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transition-all shadow-lg"
      >
        Sign In
      </button>
      <button
        onClick={() => window.location.href = '/register'}
        className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
      >
        Create Account
      </button>
    </div>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="p-4 bg-green-50 rounded-xl">
        <div className="text-green-600 font-semibold mb-2">✅ Free Tier</div>
        <p className="text-green-700">1 Video2Promo project per month</p>
      </div>
      <div className="p-4 bg-purple-50 rounded-xl">
        <div className="text-purple-600 font-semibold mb-2">🚀 Pro Tier</div>
        <p className="text-purple-700">15+ projects with advanced features</p>
      </div>
    </div>
  </div>
);

export default AuthenticationRequired;