// src/lib/auth/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCacheItem, setCacheItem } from '@/lib/cache/memoryCache';
import crypto from 'crypto';

// In a real implementation, this would use a database
// For now, we'll use the memory cache for simplicity
const USERS_CACHE_PREFIX = 'auth:user:';
const SESSIONS_CACHE_PREFIX = 'auth:session:';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Register a new user
 * @param email User email
 * @param password User password
 * @returns User object
 */
export async function registerUser(email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
  // Check if user already exists
  const existingUser = getCacheItem(`${USERS_CACHE_PREFIX}${email}`);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash the password
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  // Create the user
  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash: `${salt}:${passwordHash}`,
    createdAt: new Date().toISOString(),
  };
  
  // Store the user
  setCacheItem(`${USERS_CACHE_PREFIX}${email}`, user, 30 * 24 * 60 * 60 * 1000); // 30 days
  
  // Return the user without the password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Login a user
 * @param email User email
 * @param password User password
 * @returns Session token
 */
export async function loginUser(email: string, password: string): Promise<string> {
  // Get the user
  const user = getCacheItem(`${USERS_CACHE_PREFIX}${email}`) as User | undefined;
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Verify the password
  const [salt, storedHash] = user.passwordHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  if (hash !== storedHash) {
    throw new Error('Invalid email or password');
  }
  
  // Create a session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Store the session
  setCacheItem(`${SESSIONS_CACHE_PREFIX}${sessionToken}`, {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString(),
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return sessionToken;
}

/**
 * Get the current user from a request
 * @param request Next.js request
 * @returns User object or null
 */
export async function getCurrentUser(request: NextRequest): Promise<Omit<User, 'passwordHash'> | null> {
  // Get the session token from the cookie
  const sessionToken = request.cookies.get('session')?.value;
  if (!sessionToken) {
    return null;
  }
  
  // Get the session
  const session = getCacheItem(`${SESSIONS_CACHE_PREFIX}${sessionToken}`);
  if (!session) {
    return null;
  }
  
  // Get the user
  const user = getCacheItem(`${USERS_CACHE_PREFIX}${session.email}`) as User | undefined;
  if (!user) {
    return null;
  }
  
  // Return the user without the password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Logout a user
 * @param request Next.js request
 * @returns Next.js response
 */
export function logoutUser(request: NextRequest): NextResponse {
  // Get the session token from the cookie
  const sessionToken = request.cookies.get('session')?.value;
  if (sessionToken) {
    // Remove the session
    setCacheItem(`${SESSIONS_CACHE_PREFIX}${sessionToken}`, null, 0);
  }
  
  // Clear the cookie
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  
  return response;
}
