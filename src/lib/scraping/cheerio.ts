// src/lib/scraping/cheerio.ts
import * as cheerio from 'cheerio';

/**
 * Scrape content from a URL using Cheerio
 * @param url URL to scrape
 * @param waitFor Optional CSS selector to wait for
 * @returns Scraped content
 */
export async function scrapeWithCheerio(url: string, waitFor?: string) {
  try {
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Load the HTML content into Cheerio
    const $ = cheerio.load(html);
    
    // Extract basic page information
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Extract all text content
    const bodyText = $('body').text().trim().replace(/\s+/g, ' ');
    
    // Extract all links
    const links = $('a').map((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      return { href, text };
    }).get();
    
    // Extract all images
    const images = $('img').map((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      return { src, alt };
    }).get();
    
    // Return the scraped content
    return {
      title,
      metaDescription,
      bodyText,
      links,
      images,
      html, // Include the full HTML for more specific extraction later
    };
  } catch (error) {
    console.error('Error scraping with Cheerio:', error);
    throw error;
  }
}

/**
 * Extract specific content based on instructions
 * @param html HTML content
 * @param selector CSS selector
 * @returns Extracted content
 */
export function extractContent(html: string, selector: string) {
  try {
    const $ = cheerio.load(html);
    const elements = $(selector).map((i, el) => {
      return {
        text: $(el).text().trim(),
        html: $(el).html(),
      };
    }).get();
    
    return elements;
  } catch (error) {
    console.error('Error extracting content:', error);
    throw error;
  }
}

/**
 * Extract structured data from HTML
 * @param html HTML content
 * @returns Structured data
 */
export function extractStructuredData(html: string) {
  try {
    const $ = cheerio.load(html);
    const structuredData: any[] = [];
    
    // Extract JSON-LD
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        structuredData.push(json);
      } catch (e) {
        console.error('Error parsing JSON-LD:', e);
      }
    });
    
    return structuredData;
  } catch (error) {
    console.error('Error extracting structured data:', error);
    throw error;
  }
}
