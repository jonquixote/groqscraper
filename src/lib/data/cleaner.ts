// src/lib/data/cleaner.ts
import { z } from 'zod';

/**
 * Interface for cleaning options
 */
interface CleaningOptions {
  removeNulls?: boolean;
  removeEmptyStrings?: boolean;
  trimStrings?: boolean;
  convertToNumbers?: boolean;
  schema?: z.ZodType<any>;
}

/**
 * Clean and normalize data
 */
export class DataCleaner {
  /**
   * Clean and normalize data
   * @param data Data to clean
   * @param options Cleaning options
   * @returns Cleaned data
   */
  static clean(data: any, options: CleaningOptions = {}): any {
    try {
      const {
        removeNulls = true,
        removeEmptyStrings = true,
        trimStrings = true,
        convertToNumbers = true,
        schema,
      } = options;
      
      // Handle array of objects
      if (Array.isArray(data)) {
        return data.map(item => this.cleanObject(item, {
          removeNulls,
          removeEmptyStrings,
          trimStrings,
          convertToNumbers,
        }));
      }
      
      // Handle single object
      const cleanedData = this.cleanObject(data, {
        removeNulls,
        removeEmptyStrings,
        trimStrings,
        convertToNumbers,
      });
      
      // Validate against schema if provided
      if (schema) {
        return schema.parse(cleanedData);
      }
      
      return cleanedData;
    } catch (error) {
      console.error('Error cleaning data:', error);
      throw new Error(`Failed to clean data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Clean an object
   * @param obj Object to clean
   * @param options Cleaning options
   * @returns Cleaned object
   */
  private static cleanObject(obj: any, options: CleaningOptions): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const {
      removeNulls,
      removeEmptyStrings,
      trimStrings,
      convertToNumbers,
    } = options;
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip null values if removeNulls is true
      if (removeNulls && (value === null || value === undefined)) {
        continue;
      }
      
      // Handle nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.cleanObject(value, options);
        continue;
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        result[key] = value.map(item => {
          if (item && typeof item === 'object') {
            return this.cleanObject(item, options);
          }
          return this.cleanValue(item, options);
        });
        continue;
      }
      
      // Handle primitive values
      result[key] = this.cleanValue(value, options);
    }
    
    return result;
  }
  
  /**
   * Clean a primitive value
   * @param value Value to clean
   * @param options Cleaning options
   * @returns Cleaned value
   */
  private static cleanValue(value: any, options: CleaningOptions): any {
    const {
      removeEmptyStrings,
      trimStrings,
      convertToNumbers,
    } = options;
    
    // Handle null or undefined
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle strings
    if (typeof value === 'string') {
      // Trim string if trimStrings is true
      let cleanedValue = trimStrings ? value.trim() : value;
      
      // Skip empty strings if removeEmptyStrings is true
      if (removeEmptyStrings && cleanedValue === '') {
        return null;
      }
      
      // Convert to number if convertToNumbers is true and the string is numeric
      if (convertToNumbers && /^-?\d+(\.\d+)?$/.test(cleanedValue)) {
        return parseFloat(cleanedValue);
      }
      
      return cleanedValue;
    }
    
    return value;
  }
  
  /**
   * Remove duplicate objects from an array
   * @param data Array of objects
   * @param key Key to use for comparison (optional)
   * @returns Array with duplicates removed
   */
  static removeDuplicates<T>(data: T[], key?: keyof T): T[] {
    if (!Array.isArray(data)) {
      return data;
    }
    
    if (key) {
      const seen = new Set();
      return data.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    
    // If no key is provided, compare the entire object
    return Array.from(new Set(data.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));
  }
  
  /**
   * Normalize string values (lowercase, remove special characters, etc.)
   * @param data Data to normalize
   * @param stringFields Fields to normalize (if not provided, all string fields will be normalized)
   * @returns Normalized data
   */
  static normalizeStrings(data: any, stringFields?: string[]): any {
    if (!data) {
      return data;
    }
    
    // Handle array of objects
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeStrings(item, stringFields));
    }
    
    // Handle single object
    if (typeof data === 'object' && !Array.isArray(data)) {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && (!stringFields || stringFields.includes(key))) {
          result[key] = this.normalizeString(value);
        } else if (typeof value === 'object') {
          result[key] = this.normalizeStrings(value, stringFields);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
    
    // Handle primitive string value
    if (typeof data === 'string') {
      return this.normalizeString(data);
    }
    
    return data;
  }
  
  /**
   * Normalize a string value
   * @param value String to normalize
   * @returns Normalized string
   */
  private static normalizeString(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }
}
