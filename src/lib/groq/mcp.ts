// src/lib/groq/mcp.ts
import { env } from 'process';

/**
 * Interface for Model Control Protocol options
 */
interface MCPOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}

/**
 * Interface for MCP response
 */
interface MCPResponse {
  content: string;
  structured?: any;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Process content with Groq API using Model Control Protocol
 * @param content Content to process
 * @param instructions Instructions for processing
 * @param options MCP options
 * @returns Processed content
 */
export async function processWithMCP(
  content: any, 
  instructions: string, 
  options: MCPOptions = {}
): Promise<MCPResponse> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    
    // Set default options
    const {
      temperature = 0.2,
      maxTokens = 4000,
      model = 'llama3-70b-8192',
      systemPrompt = 'You are a helpful assistant that processes and structures web content.'
    } = options;
    
    // Prepare the prompt with MCP formatting
    const prompt = `
<task>
Process and analyze the following web content according to the instructions.
</task>

<content>
${typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
</content>

<instructions>
${instructions}
</instructions>

<output_format>
Please provide your response in JSON format with the following structure:
{
  "analysis": {
    "summary": "Brief summary of the content",
    "key_points": ["List of key points extracted"]
  },
  "structured_data": {
    // Structured data extracted according to instructions
  },
  "metadata": {
    "source_type": "Type of content analyzed",
    "processing_timestamp": "ISO timestamp of when processing occurred"
  }
}
</output_format>
`;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Extract the response content
    const processedContent = data.choices[0]?.message.content;
    
    // Try to parse as JSON if it looks like JSON
    if (processedContent && (processedContent.trim().startsWith('{') || processedContent.trim().startsWith('['))) {
      try {
        return {
          content: processedContent,
          structured: JSON.parse(processedContent),
          usage: data.usage,
        };
      } catch (e) {
        // If parsing fails, return as text
        return {
          content: processedContent,
          usage: data.usage,
        };
      }
    }
    
    // Return as text
    return {
      content: processedContent,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error processing with MCP:', error);
    throw error;
  }
}

/**
 * Process content with specific MCP templates
 * @param content Content to process
 * @param template Template name
 * @param options MCP options
 * @returns Processed content
 */
export async function processWithTemplate(
  content: any,
  template: 'summarize' | 'extract_entities' | 'sentiment_analysis' | 'custom',
  options: MCPOptions & { customInstructions?: string } = {}
): Promise<MCPResponse> {
  let instructions = '';
  
  switch (template) {
    case 'summarize':
      instructions = 'Provide a concise summary of the content, highlighting the main points and key information.';
      break;
    case 'extract_entities':
      instructions = 'Extract all named entities (people, organizations, locations, dates, etc.) from the content and categorize them.';
      break;
    case 'sentiment_analysis':
      instructions = 'Analyze the sentiment of the content. Determine if it is positive, negative, or neutral, and provide a confidence score.';
      break;
    case 'custom':
      instructions = options.customInstructions || 'Process the content according to the provided instructions.';
      break;
  }
  
  return processWithMCP(content, instructions, options);
}
