import { type NextRequest } from 'next/server';
import { scrapeWithCheerio, extractContent, extractStructuredData } from '@/lib/scraping/cheerio';
import { processWithGroq } from '@/lib/groq/client';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { getCacheItem, setCacheItem } from '@/lib/cache/memoryCache';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const body = await request.json();
    const { url, instructions, waitFor } = body;
    
    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'URL is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check cache first
    const cacheKey = `scrape:${url}:${waitFor || ''}`;
    const cachedResult = getCacheItem(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached result for:', url);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Scraping completed (cached)',
        data: cachedResult
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Perform the scraping
    console.log('Scraping URL:', url);
    const scrapedContent = await scrapeWithCheerio(url, waitFor);
    
    // Extract structured data if available
    const structuredData = extractStructuredData(scrapedContent.html);
    
    // Create the result object
    const result = {
      url,
      instructions,
      waitFor,
      timestamp: new Date().toISOString(),
      results: {
        title: scrapedContent.title,
        metaDescription: scrapedContent.metaDescription,
        bodyText: scrapedContent.bodyText.substring(0, 1000) + (scrapedContent.bodyText.length > 1000 ? '...' : ''),
        links: scrapedContent.links.slice(0, 20),
        images: scrapedContent.images.slice(0, 20),
        structuredData: structuredData,
      }
    };
    
    // Cache the result
    setCacheItem(cacheKey, result, 60 * 60 * 1000); // Cache for 1 hour
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Scraping completed',
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to scrape content',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
