import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Web Scraping Tool with Groq Integration</h1>
        
        <div className="bg-white/30 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-lg mb-6">
            Extract content from any website using natural language instructions and process it with Groq AI.
          </p>
          
          <div className="flex justify-center">
            <Link 
              href="/scraper" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start Scraping
            </Link>
          </div>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 p-6 rounded-lg shadow backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-3">Natural Language Instructions</h2>
            <p>Tell the tool what to extract in plain English. No complex selectors needed.</p>
          </div>
          
          <div className="bg-white/20 p-6 rounded-lg shadow backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-3">Groq AI Processing</h2>
            <p>Leverage Groq's powerful AI to understand and process the scraped content.</p>
          </div>
          
          <div className="bg-white/20 p-6 rounded-lg shadow backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-3">Export & Save</h2>
            <p>Download results in multiple formats and save your scraping tasks for later.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
