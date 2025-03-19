"use client"

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface ScrapingTask {
  id: string;
  url: string;
  instructions: string;
  timestamp: string;
  results: any;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScrapingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<ScrapingTask | null>(null);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from the API
        // For now, we'll use mock data
        const mockHistory: ScrapingTask[] = [
          {
            id: '1',
            url: 'https://example.com/products',
            instructions: 'Extract all product names and prices',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            results: {
              title: 'Example Products Page',
              content: 'Mock product data',
              elements: ['Product 1: $19.99', 'Product 2: $29.99', 'Product 3: $39.99']
            }
          },
          {
            id: '2',
            url: 'https://example.com/blog',
            instructions: 'Extract all blog post titles and dates',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            results: {
              title: 'Example Blog Page',
              content: 'Mock blog data',
              elements: ['Post 1: March 15, 2025', 'Post 2: March 10, 2025', 'Post 3: March 5, 2025']
            }
          },
          {
            id: '3',
            url: 'https://example.com/contact',
            instructions: 'Extract contact information',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            results: {
              title: 'Example Contact Page',
              content: 'Mock contact data',
              elements: ['Email: contact@example.com', 'Phone: (555) 123-4567', 'Address: 123 Example St']
            }
          }
        ];
        
        setHistory(mockHistory);
        
        // Simulate API call
        // const response = await fetch('/api/history');
        // const data = await response.json();
        // if (!response.ok) {
        //   throw new Error(data.message || 'Failed to fetch history');
        // }
        // setHistory(data.history);
        
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleTaskClick = (task: ScrapingTask) => {
    setSelectedTask(task);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Scraping History</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-fit">
              <h2 className="text-xl font-semibold mb-4">Saved Scrapes</h2>
              
              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No saved scrapes found.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((task) => (
                    <li key={task.id}>
                      <button
                        onClick={() => handleTaskClick(task)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedTask?.id === task.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } border`}
                      >
                        <div className="font-medium truncate">{task.url}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(task.timestamp)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="md:col-span-2">
              {selectedTask ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Task Details</h2>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</h3>
                    <p className="mt-1">{selectedTask.url}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructions</h3>
                    <p className="mt-1">{selectedTask.instructions}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                    <p className="mt-1">{formatDate(selectedTask.timestamp)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Results</h3>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(selectedTask.results, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(selectedTask.results, null, 2);
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
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">Select a task to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
