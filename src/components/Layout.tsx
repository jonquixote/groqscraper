"use client"

import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 sm:mb-0">
            Web Scraper
          </Link>
          
          <nav className="flex space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link href="/scraper" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Scraper
            </Link>
            <Link href="/history" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              History
            </Link>
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Login
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Web Scraping Tool with Groq Integration
            </p>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                About
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
