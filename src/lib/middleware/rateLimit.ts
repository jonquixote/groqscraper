// src/lib/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, this should be replaced with Redis or another distributed store
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 * @param request Next.js request
 * @param limit Maximum number of requests
 * @param windowMs Time window in milliseconds
 * @returns Response or undefined to continue
 */
export function rateLimit(request: NextRequest, limit = 10, windowMs = 60 * 1000) {
  // Get the IP address from the request
  const ip = request.ip || 'unknown';
  
  // Get the current timestamp
  const now = Date.now();
  
  // Get or initialize the request count for this IP
  const requestData = ipRequestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
  
  // If the reset time has passed, reset the count
  if (requestData.resetTime < now) {
    requestData.count = 0;
    requestData.resetTime = now + windowMs;
  }
  
  // Increment the request count
  requestData.count++;
  
  // Update the request count in the map
  ipRequestCounts.set(ip, requestData);
  
  // Check if the request count exceeds the limit
  if (requestData.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers: { 'Retry-After': `${Math.ceil((requestData.resetTime - now) / 1000)}` } }
    );
  }
  
  // Continue to the next middleware or route handler
  return undefined;
}

/**
 * Clear expired rate limit entries
 * This should be called periodically to prevent memory leaks
 */
export function clearExpiredRateLimits() {
  const now = Date.now();
  
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (data.resetTime < now) {
      ipRequestCounts.delete(ip);
    }
  }
}
