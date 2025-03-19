// src/lib/groq/formatter.ts
import { z } from 'zod';

/**
 * Interface for structured output options
 */
interface StructuredOutputOptions {
  format?: 'json' | 'csv' | 'table';
  schema?: z.ZodType<any>;
}

/**
 * Format the output from Groq API
 * @param content Content from Groq API
 * @param options Formatting options
 * @returns Formatted content
 */
export function formatStructuredOutput(content: any, options: StructuredOutputOptions = {}) {
  try {
    const { format = 'json', schema } = options;
    
    // If content is already a string, try to parse it as JSON
    let data = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Validate against schema if provided
    if (schema) {
      data = schema.parse(data);
    }
    
    // Format based on the specified format
    switch (format) {
      case 'json':
        return {
          format: 'json',
          data,
          raw: JSON.stringify(data, null, 2),
        };
      
      case 'csv':
        return {
          format: 'csv',
          data,
          raw: convertToCSV(data),
        };
      
      case 'table':
        return {
          format: 'table',
          data,
          raw: convertToTable(data),
        };
      
      default:
        return {
          format: 'json',
          data,
          raw: JSON.stringify(data, null, 2),
        };
    }
  } catch (error) {
    console.error('Error formatting structured output:', error);
    throw error;
  }
}

/**
 * Convert data to CSV format
 * @param data Data to convert
 * @returns CSV string
 */
function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') {
    return '';
  }
  
  // Handle array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '';
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const headerRow = headers.join(',');
    
    // Create CSV data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine header and data rows
    return [headerRow, ...dataRows].join('\n');
  }
  
  // Handle single object
  const headers = Object.keys(data);
  const values = Object.values(data);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create CSV data row
  const dataRow = values.map(value => {
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  }).join(',');
  
  // Combine header and data row
  return [headerRow, dataRow].join('\n');
}

/**
 * Convert data to a markdown table format
 * @param data Data to convert
 * @returns Markdown table string
 */
function convertToTable(data: any): string {
  if (!data || typeof data !== 'object') {
    return '';
  }
  
  // Handle array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '';
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create table header row
    const headerRow = `| ${headers.join(' | ')} |`;
    
    // Create table separator row
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    
    // Create table data rows
    const dataRows = data.map(item => {
      return `| ${headers.map(header => {
        const value = item[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(' | ')} |`;
    });
    
    // Combine header, separator, and data rows
    return [headerRow, separatorRow, ...dataRows].join('\n');
  }
  
  // Handle single object
  const headers = Object.keys(data);
  const values = Object.values(data);
  
  // Create table header row
  const headerRow = `| ${headers.join(' | ')} |`;
  
  // Create table separator row
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  
  // Create table data row
  const dataRow = `| ${values.map(value => {
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }).join(' | ')} |`;
  
  // Combine header, separator, and data row
  return [headerRow, separatorRow, dataRow].join('\n');
}
