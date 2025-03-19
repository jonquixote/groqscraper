"use client"

import { useState } from 'react';
import Layout from '@/components/Layout';

export default function ScraperPage() {
  const [url, setUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [waitFor, setWaitFor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('URL is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          instructions,
          waitFor,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to scrape content');
      }
      
      setResults(data.data);
      
      // Process with Groq if instructions are provided
      if (instructions && data.data.results) {
        const processResponse = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: data.data.results,
            instructions,
          }),
        });
        
        const processData = await processResponse.json();
        
        if (!processResponse.ok) {
          throw new Error(processData.message || 'Failed to process content');
        }
        
        setResults({
          ...data.data,
          processed: processData.data.processed,
        });
      }
      
      // Save to history
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          instructions,
          waitFor,
          timestamp: new Date().toISOString(),
          results: results,
        }),
      });
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Web Scraper</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL to Scrape
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructions (Natural Language)
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Extract all product names, prices, and availability. Create a table sorting them from lowest to highest price."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="waitFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wait For Element (Optional)
              </label>
              <input
                type="text"
                id="waitFor"
                value={waitFor}
                onChange={(e) => setWaitFor(e.target.value)}
                placeholder=".product-container"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                CSS selector for element to wait for before scraping (for dynamic content)
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Scraping...' : 'Start Scraping'}
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Scraped Content</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(results.results, null, 2)}
                </pre>
              </div>
            </div>
            
            {results.processed && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Processed by Groq</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(results.processed, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(results, null, 2);
                  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute('href', dataUri);
                  downloadAnchorNode.setAttribute('download', 'scrape-results.json');
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download JSON
              </button>
              
              <button
                onClick={() => {
                  // In a real implementation, this would convert to CSV
                  alert('CSV export would be implemented here');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
