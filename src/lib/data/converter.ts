// src/lib/data/converter.ts
import { parse as csvParse, unparse as csvUnparse } from 'papaparse';
import { formatStructuredOutput } from '@/lib/groq/formatter';

/**
 * Interface for conversion options
 */
interface ConversionOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
}

/**
 * Convert data between different formats
 */
export class DataConverter {
  /**
   * Convert JSON to CSV
   * @param data JSON data (object or array of objects)
   * @param options Conversion options
   * @returns CSV string
   */
  static jsonToCsv(data: any, options: ConversionOptions = {}): string {
    try {
      const { includeHeaders = true, delimiter = ',', skipEmptyLines = true } = options;
      
      // Handle array of objects
      if (Array.isArray(data)) {
        return csvUnparse(data, {
          header: includeHeaders,
          delimiter,
          skipEmptyLines,
        });
      }
      
      // Handle single object
      return csvUnparse([data], {
        header: includeHeaders,
        delimiter,
        skipEmptyLines,
      });
    } catch (error) {
      console.error('Error converting JSON to CSV:', error);
      throw new Error(`Failed to convert JSON to CSV: ${(error as Error).message}`);
    }
  }
  
  /**
   * Convert CSV to JSON
   * @param csv CSV string
   * @param options Conversion options
   * @returns JSON object or array of objects
   */
  static csvToJson(csv: string, options: ConversionOptions = {}): any {
    try {
      const { delimiter = ',', skipEmptyLines = true } = options;
      
      const result = csvParse(csv, {
        header: true,
        delimiter,
        skipEmptyLines,
      });
      
      return result.data;
    } catch (error) {
      console.error('Error converting CSV to JSON:', error);
      throw new Error(`Failed to convert CSV to JSON: ${(error as Error).message}`);
    }
  }
  
  /**
   * Convert JSON to Excel-compatible XML
   * @param data JSON data (object or array of objects)
   * @returns XML string
   */
  static jsonToExcelXml(data: any): string {
    try {
      let rows: any[] = [];
      
      // Handle array of objects
      if (Array.isArray(data)) {
        rows = data;
      } else {
        // Handle single object
        rows = [data];
      }
      
      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      rows.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
      });
      
      const headers = Array.from(allKeys);
      
      // Create XML
      let xml = '<?xml version="1.0"?>\n';
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xml += '<Worksheet ss:Name="Sheet1">\n';
      xml += '<Table>\n';
      
      // Add header row
      xml += '<Row>\n';
      headers.forEach(header => {
        xml += `<Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
      
      // Add data rows
      rows.forEach(row => {
        xml += '<Row>\n';
        headers.forEach(header => {
          const value = row[header];
          const type = typeof value === 'number' ? 'Number' : 'String';
          xml += `<Cell><Data ss:Type="${type}">${value !== undefined ? value : ''}</Data></Cell>\n`;
        });
        xml += '</Row>\n';
      });
      
      xml += '</Table>\n';
      xml += '</Worksheet>\n';
      xml += '</Workbook>';
      
      return xml;
    } catch (error) {
      console.error('Error converting JSON to Excel XML:', error);
      throw new Error(`Failed to convert JSON to Excel XML: ${(error as Error).message}`);
    }
  }
  
  /**
   * Convert JSON to HTML table
   * @param data JSON data (object or array of objects)
   * @returns HTML string
   */
  static jsonToHtmlTable(data: any): string {
    try {
      let rows: any[] = [];
      
      // Handle array of objects
      if (Array.isArray(data)) {
        rows = data;
      } else {
        // Handle single object
        rows = [data];
      }
      
      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      rows.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
      });
      
      const headers = Array.from(allKeys);
      
      // Create HTML table
      let html = '<table border="1" cellpadding="5" cellspacing="0">\n';
      
      // Add header row
      html += '<thead>\n<tr>\n';
      headers.forEach(header => {
        html += `<th>${header}</th>\n`;
      });
      html += '</tr>\n</thead>\n';
      
      // Add data rows
      html += '<tbody>\n';
      rows.forEach(row => {
        html += '<tr>\n';
        headers.forEach(header => {
          const value = row[header];
          html += `<td>${value !== undefined ? value : ''}</td>\n`;
        });
        html += '</tr>\n';
      });
      html += '</tbody>\n';
      
      html += '</table>';
      
      return html;
    } catch (error) {
      console.error('Error converting JSON to HTML table:', error);
      throw new Error(`Failed to convert JSON to HTML table: ${(error as Error).message}`);
    }
  }
  
  /**
   * Convert JSON to Markdown table
   * @param data JSON data (object or array of objects)
   * @returns Markdown string
   */
  static jsonToMarkdownTable(data: any): string {
    try {
      const { raw } = formatStructuredOutput(data, { format: 'table' });
      return raw;
    } catch (error) {
      console.error('Error converting JSON to Markdown table:', error);
      throw new Error(`Failed to convert JSON to Markdown table: ${(error as Error).message}`);
    }
  }
}
