// src/lib/data/transformer.ts
import { DataCleaner } from './cleaner';

/**
 * Interface for transformation options
 */
interface TransformationOptions {
  includeOriginal?: boolean;
}

/**
 * Custom data transformations
 */
export class DataTransformer {
  /**
   * Apply a custom transformation function to data
   * @param data Data to transform
   * @param transformFn Transformation function
   * @param options Transformation options
   * @returns Transformed data
   */
  static transform<T, R>(
    data: T,
    transformFn: (item: any) => any,
    options: TransformationOptions = {}
  ): R {
    try {
      const { includeOriginal = false } = options;
      
      // Handle array of objects
      if (Array.isArray(data)) {
        const transformed = data.map(item => transformFn(item));
        
        if (includeOriginal) {
          return {
            original: data,
            transformed,
          } as unknown as R;
        }
        
        return transformed as unknown as R;
      }
      
      // Handle single object
      const transformed = transformFn(data);
      
      if (includeOriginal) {
        return {
          original: data,
          transformed,
        } as unknown as R;
      }
      
      return transformed as unknown as R;
    } catch (error) {
      console.error('Error transforming data:', error);
      throw new Error(`Failed to transform data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Filter data based on a predicate function
   * @param data Data to filter
   * @param predicateFn Predicate function
   * @returns Filtered data
   */
  static filter<T>(data: T[], predicateFn: (item: any) => boolean): T[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.filter(predicateFn);
  }
  
  /**
   * Sort data based on a key or sort function
   * @param data Data to sort
   * @param keyOrFn Key or sort function
   * @param direction Sort direction
   * @returns Sorted data
   */
  static sort<T>(
    data: T[],
    keyOrFn: keyof T | ((a: T, b: T) => number),
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    const sortFn = typeof keyOrFn === 'function'
      ? keyOrFn
      : (a: T, b: T) => {
          const aVal = a[keyOrFn];
          const bVal = b[keyOrFn];
          
          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          
          return aVal < bVal ? -1 : 1;
        };
    
    const sorted = [...data].sort(sortFn);
    
    return direction === 'asc' ? sorted : sorted.reverse();
  }
  
  /**
   * Group data by a key
   * @param data Data to group
   * @param key Key to group by
   * @returns Grouped data
   */
  static groupBy<T>(data: T[], key: keyof T): Record<string, T[]> {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.reduce((result, item) => {
      const groupKey = String(item[key]);
      
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      
      result[groupKey].push(item);
      
      return result;
    }, {} as Record<string, T[]>);
  }
  
  /**
   * Aggregate data using a reduce function
   * @param data Data to aggregate
   * @param reduceFn Reduce function
   * @param initialValue Initial value
   * @returns Aggregated value
   */
  static aggregate<T, R>(
    data: T[],
    reduceFn: (result: R, item: T) => R,
    initialValue: R
  ): R {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.reduce(reduceFn, initialValue);
  }
  
  /**
   * Extract specific fields from data
   * @param data Data to extract from
   * @param fields Fields to extract
   * @returns Data with only the specified fields
   */
  static extractFields<T>(data: T[], fields: (keyof T)[]): Partial<T>[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.map(item => {
      const result: Partial<T> = {};
      
      fields.forEach(field => {
        if (field in item) {
          result[field] = item[field];
        }
      });
      
      return result;
    });
  }
  
  /**
   * Rename fields in data
   * @param data Data to transform
   * @param fieldMap Map of old field names to new field names
   * @returns Data with renamed fields
   */
  static renameFields<T>(data: T[], fieldMap: Record<string, string>): any[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.map(item => {
      const result: Record<string, any> = { ...item };
      
      Object.entries(fieldMap).forEach(([oldField, newField]) => {
        if (oldField in result) {
          result[newField] = result[oldField];
          delete result[oldField];
        }
      });
      
      return result;
    });
  }
}
