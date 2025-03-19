// src/lib/groq/client.ts
import { env } from 'process';

/**
 * Interface for Groq API response
 */
interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Process content with Groq API
 * @param content Content to process
 * @param instructions Instructions for processing
 * @returns Processed content
 */
export async function processWithGroq(content: any, instructions: string) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    
    // Prepare the prompt
    const prompt = `
You are a web scraping assistant that helps extract and structure data from web content.

CONTENT:
${typeof content === 'object' ? JSON.stringify(content, null, 2) : content}

INSTRUCTIONS:
${instructions}

Please process the content according to the instructions and provide a structured response.
`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that processes and structures web content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as GroqResponse;
    
    // Extract the response content
    const processedContent = data.choices[0]?.message.content;
    
    // Try to parse as JSON if it looks like JSON
    if (processedContent && (processedContent.trim().startsWith('{') || processedContent.trim().startsWith('['))) {
      try {
        return {
          raw: processedContent,
          structured: JSON.parse(processedContent),
          usage: data.usage,
        };
      } catch (e) {
        // If parsing fails, return as text
        return {
          raw: processedContent,
          text: processedContent,
          usage: data.usage,
        };
      }
    }
    
    // Return as text
    return {
      raw: processedContent,
      text: processedContent,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error processing with Groq:', error);
    throw error;
  }
}
