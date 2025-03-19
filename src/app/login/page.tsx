"use client"

import { useState } from 'react';
import Layout from '@/components/Layout';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // In a real implementation, this would call the authentication API
      // For now, we'll just simulate a successful login/signup
      
      setTimeout(() => {
        // Simulate successful authentication
        window.location.href = '/scraper';
      }, 1500);
      
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required={!isLogin}
                />
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Key Management</h2>
          
          <div className="mb-4">
            <label htmlFor="groqApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Groq API Key
            </label>
            <div className="flex">
              <input
                type="password"
                id="groqApiKey"
                placeholder="Enter your Groq API key"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your API key is stored securely and never shared.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
