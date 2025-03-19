// src/lib/security/allowlist.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if a URL is allowed for scraping
 * @param url URL to check
 * @returns Whether the URL is allowed
 */
export function isUrlAllowed(url: string): boolean {
  try {
    // Parse the URL to get the hostname
    const hostname = new URL(url).hostname;
    
    // Get allowed and blocked domains from environment variables
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const blockedDomains = process.env.BLOCKED_DOMAINS?.split(',') || [];
    
    // If there are no allowed domains, all domains are allowed except blocked ones
    if (allowedDomains.length === 0) {
      return !blockedDomains.some(domain => hostname.includes(domain));
    }
    
    // Check if the hostname is in the allowed domains and not in the blocked domains
    return (
      allowedDomains.some(domain => hostname.includes(domain)) &&
      !blockedDomains.some(domain => hostname.includes(domain))
    );
  } catch (error) {
    console.error('Error checking URL allowlist:', error);
    return false;
  }
}

/**
 * Middleware to check if a URL is allowed for scraping
 * @param request Next.js request
 * @returns Response or undefined to continue
 */
export function allowlistMiddleware(request: NextRequest): NextResponse | undefined {
  try {
    // Only apply to scrape API route
    if (!request.nextUrl.pathname.startsWith('/api/scrape')) {
      return undefined;
    }
    
    // Get the URL from the request body
    const body = request.body ? JSON.parse(request.body as any) : {};
    const url = body.url;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Check if the URL is allowed
    if (!isUrlAllowed(url)) {
      return NextResponse.json(
        { error: 'URL is not allowed for scraping' },
        { status: 403 }
      );
    }
    
    // Continue to the next middleware or route handler
    return undefined;
  } catch (error) {
    console.error('Error in allowlist middleware:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
