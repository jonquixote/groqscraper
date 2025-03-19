// src/lib/data/visualizer.ts
import { DataTransformer } from './transformer';

/**
 * Interface for visualization options
 */
interface VisualizationOptions {
  title?: string;
  width?: number;
  height?: number;
  colors?: string[];
}

/**
 * Basic data visualization
 */
export class DataVisualizer {
  /**
   * Generate a bar chart configuration
   * @param data Data to visualize
   * @param labelField Field to use for labels
   * @param valueField Field to use for values
   * @param options Visualization options
   * @returns Chart configuration
   */
  static barChart(
    data: any[],
    labelField: string,
    valueField: string,
    options: VisualizationOptions = {}
  ): any {
    try {
      const {
        title = 'Bar Chart',
        width = 600,
        height = 400,
        colors = ['#3b82f6', '#60a5fa', '#93c5fd'],
      } = options;
      
      // Extract labels and values
      const labels = data.map(item => item[labelField]);
      const values = data.map(item => item[valueField]);
      
      // Generate chart configuration for Recharts
      return {
        type: 'bar',
        config: {
          width,
          height,
          data,
          title,
          xAxisDataKey: labelField,
          bars: [
            {
              dataKey: valueField,
              fill: colors[0],
            },
          ],
        },
        labels,
        values,
      };
    } catch (error) {
      console.error('Error generating bar chart:', error);
      throw new Error(`Failed to generate bar chart: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate a line chart configuration
   * @param data Data to visualize
   * @param xField Field to use for x-axis
   * @param yFields Fields to use for y-axis
   * @param options Visualization options
   * @returns Chart configuration
   */
  static lineChart(
    data: any[],
    xField: string,
    yFields: string[],
    options: VisualizationOptions = {}
  ): any {
    try {
      const {
        title = 'Line Chart',
        width = 600,
        height = 400,
        colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
      } = options;
      
      // Generate chart configuration for Recharts
      return {
        type: 'line',
        config: {
          width,
          height,
          data,
          title,
          xAxisDataKey: xField,
          lines: yFields.map((field, index) => ({
            dataKey: field,
            stroke: colors[index % colors.length],
          })),
        },
      };
    } catch (error) {
      console.error('Error generating line chart:', error);
      throw new Error(`Failed to generate line chart: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate a pie chart configuration
   * @param data Data to visualize
   * @param nameField Field to use for names
   * @param valueField Field to use for values
   * @param options Visualization options
   * @returns Chart configuration
   */
  static pieChart(
    data: any[],
    nameField: string,
    valueField: string,
    options: VisualizationOptions = {}
  ): any {
    try {
      const {
        title = 'Pie Chart',
        width = 400,
        height = 400,
        colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
      } = options;
      
      // Generate chart configuration for Recharts
      return {
        type: 'pie',
        config: {
          width,
          height,
          data: data.map((item, index) => ({
            name: item[nameField],
            value: item[valueField],
            fill: colors[index % colors.length],
          })),
          title,
          nameKey: 'name',
          dataKey: 'value',
        },
      };
    } catch (error) {
      console.error('Error generating pie chart:', error);
      throw new Error(`Failed to generate pie chart: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate a table visualization
   * @param data Data to visualize
   * @param options Visualization options
   * @returns Table configuration
   */
  static table(
    data: any[],
    options: VisualizationOptions & { fields?: string[] } = {}
  ): any {
    try {
      const {
        title = 'Table',
        fields,
      } = options;
      
      // If fields are specified, extract only those fields
      const tableData = fields
        ? DataTransformer.extractFields(data, fields as any)
        : data;
      
      // Get column headers
      const columns = fields || Object.keys(data[0] || {});
      
      return {
        type: 'table',
        config: {
          title,
          columns: columns.map(column => ({
            title: column,
            dataIndex: column,
            key: column,
          })),
          data: tableData.map((item, index) => ({
            key: index,
            ...item,
          })),
        },
      };
    } catch (error) {
      console.error('Error generating table:', error);
      throw new Error(`Failed to generate table: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate a heatmap configuration
   * @param data Data to visualize
   * @param xField Field to use for x-axis
   * @param yField Field to use for y-axis
   * @param valueField Field to use for values
   * @param options Visualization options
   * @returns Heatmap configuration
   */
  static heatmap(
    data: any[],
    xField: string,
    yField: string,
    valueField: string,
    options: VisualizationOptions = {}
  ): any {
    try {
      const {
        title = 'Heatmap',
        width = 800,
        height = 400,
      } = options;
      
      // Group data by y-axis field
      const groupedData = DataTransformer.groupBy(data, yField as any);
      
      // Transform data for heatmap
      const heatmapData = Object.entries(groupedData).map(([yValue, items]) => {
        const row: Record<string, any> = { [yField]: yValue };
        
        items.forEach(item => {
          row[item[xField]] = item[valueField];
        });
        
        return row;
      });
      
      // Get unique x-axis values
      const xValues = [...new Set(data.map(item => item[xField]))];
      
      return {
        type: 'heatmap',
        config: {
          width,
          height,
          data: heatmapData,
          title,
          yAxisDataKey: yField,
          xAxisCategories: xValues,
        },
      };
    } catch (error) {
      console.error('Error generating heatmap:', error);
      throw new Error(`Failed to generate heatmap: ${(error as Error).message}`);
    }
  }
}
