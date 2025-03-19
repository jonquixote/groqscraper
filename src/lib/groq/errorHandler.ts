// src/lib/groq/errorHandler.ts
import { processWithGroq } from './client';
import { processWithMCP } from './mcp';

/**
 * Interface for retry options
 */
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Process content with Groq API with error handling and retry mechanism
 * @param content Content to process
 * @param instructions Instructions for processing
 * @param options Retry options
 * @returns Processed content
 */
export async function processWithRetry(
  content: any,
  instructions: string,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;
  
  let lastError: Error | null = null;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not the first attempt, wait before retrying
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next attempt with exponential backoff
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
      
      // Attempt to process with Groq
      const result = await processWithGroq(content, instructions);
      
      // If successful, return the result
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError.message}`);
      }
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error(`Unexpected error in retry mechanism: ${lastError?.message}`);
}

/**
 * Process content with MCP with error handling and retry mechanism
 * @param content Content to process
 * @param instructions Instructions for processing
 * @param options Retry options and MCP options
 * @returns Processed content
 */
export async function processWithMCPRetry(
  content: any,
  instructions: string,
  options: RetryOptions & { mcpOptions?: any } = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    mcpOptions = {},
  } = options;
  
  let lastError: Error | null = null;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not the first attempt, wait before retrying
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next attempt with exponential backoff
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
      
      // Attempt to process with MCP
      const result = await processWithMCP(content, instructions, mcpOptions);
      
      // If successful, return the result
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError.message}`);
      }
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error(`Unexpected error in retry mechanism: ${lastError?.message}`);
}

/**
 * Handle Groq API errors
 * @param error Error object
 * @returns Formatted error message
 */
export function handleGroqError(error: any): string {
  // Extract error details
  const errorMessage = error.message || 'Unknown error';
  
  // Check for specific error types
  if (errorMessage.includes('401')) {
    return 'Authentication error: Invalid API key or unauthorized access. Please check your Groq API key.';
  } else if (errorMessage.includes('429')) {
    return 'Rate limit exceeded: Too many requests to Groq API. Please try again later.';
  } else if (errorMessage.includes('500')) {
    return 'Groq API server error: The service is experiencing issues. Please try again later.';
  } else if (errorMessage.includes('timeout')) {
    return 'Request timeout: The Groq API request took too long to complete. Please try again or reduce the complexity of your request.';
  }
  
  // Default error message
  return `Groq API error: ${errorMessage}`;
}
