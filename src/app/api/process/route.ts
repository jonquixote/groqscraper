import { type NextRequest } from 'next/server';
import { processWithGroq } from '@/lib/groq/client';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { getCacheItem, setCacheItem } from '@/lib/cache/memoryCache';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 5, 60 * 1000); // Stricter rate limit for Groq API
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const body = await request.json();
    const { content, instructions } = body;
    
    if (!content) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Content is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check cache first
    const cacheKey = `process:${JSON.stringify(content)}:${instructions}`;
    const cachedResult = getCacheItem(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached result for processing');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Processing completed (cached)',
        data: cachedResult
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Process with Groq
    console.log('Processing content with Groq');
    const processedContent = await processWithGroq(content, instructions);
    
    // Create the result object
    const result = {
      original: content,
      instructions,
      timestamp: new Date().toISOString(),
      processed: processedContent
    };
    
    // Cache the result
    setCacheItem(cacheKey, result, 24 * 60 * 60 * 1000); // Cache for 24 hours
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Processing completed',
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to process content',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
