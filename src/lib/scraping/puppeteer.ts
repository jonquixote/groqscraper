// src/lib/scraping/puppeteer.ts
import puppeteer from 'puppeteer';

/**
 * Scrape content from a URL using Puppeteer for JavaScript-rendered content
 * @param url URL to scrape
 * @param waitFor Optional CSS selector to wait for
 * @param timeout Timeout in milliseconds
 * @returns Scraped content
 */
export async function scrapeWithPuppeteer(url: string, waitFor?: string, timeout = 30000) {
  let browser;
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    
    // Wait for specific element if provided
    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout });
    }
    
    // Extract page title
    const title = await page.title();
    
    // Extract meta description
    const metaDescription = await page.evaluate(() => {
      const metaTag = document.querySelector('meta[name="description"]');
      return metaTag ? metaTag.getAttribute('content') : '';
    });
    
    // Extract all text content
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.trim().replace(/\s+/g, ' ');
    });
    
    // Extract all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.innerText.trim(),
      }));
    });
    
    // Extract all images
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
      }));
    });
    
    // Get the full HTML
    const html = await page.content();
    
    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    // Return the scraped content
    return {
      title,
      metaDescription,
      bodyText,
      links,
      images,
      html,
      screenshot: `data:image/png;base64,${screenshot}`,
    };
  } catch (error) {
    console.error('Error scraping with Puppeteer:', error);
    throw error;
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract content from a page using Puppeteer and custom selectors
 * @param url URL to scrape
 * @param selectors Object with CSS selectors to extract
 * @param waitFor Optional CSS selector to wait for
 * @returns Extracted content
 */
export async function extractContentWithPuppeteer(url: string, selectors: Record<string, string>, waitFor?: string) {
  let browser;
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for specific element if provided
    if (waitFor) {
      await page.waitForSelector(waitFor);
    }
    
    // Extract content based on selectors
    const result: Record<string, any> = {};
    
    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = await page.evaluate((sel) => {
        const elements = Array.from(document.querySelectorAll(sel));
        return elements.map(el => el.textContent?.trim());
      }, selector);
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting content with Puppeteer:', error);
    throw error;
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Bypass anti-scraping measures and scrape content
 * @param url URL to scrape
 * @param waitFor Optional CSS selector to wait for
 * @returns Scraped content
 */
export async function bypassAntiScrapingMeasures(url: string, waitFor?: string) {
  let browser;
  try {
    // Launch a headless browser with additional arguments to avoid detection
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    // Set viewport to a common resolution
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
    
    // Intercept requests to modify headers or block tracking
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // Modify headers for specific requests if needed
      if (request.resourceType() === 'document' || request.resourceType() === 'xhr') {
        request.continue({
          headers: {
            ...request.headers(),
            'Referer': 'https://www.google.com/',
          },
        });
      } else {
        request.continue();
      }
    });
    
    // Navigate to the URL with a timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    // Simulate human-like behavior
    await page.waitForTimeout(Math.random() * 1000 + 1000);
    
    // Scroll down slowly to trigger lazy loading
    await autoScroll(page);
    
    // Wait for specific element if provided
    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout: 30000 });
    }
    
    // Extract page content
    const content = await page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        bodyText: document.body.innerText.trim().replace(/\s+/g, ' '),
        html: document.documentElement.outerHTML,
      };
    });
    
    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    return {
      ...content,
      screenshot: `data:image/png;base64,${screenshot}`,
    };
  } catch (error) {
    console.error('Error bypassing anti-scraping measures:', error);
    throw error;
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Auto-scroll function to simulate human scrolling and trigger lazy loading
 * @param page Puppeteer page
 */
async function autoScroll(page: puppeteer.Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        // Add some randomness to scrolling
        const randomPause = Math.random() * 500 + 500;
        setTimeout(() => {}, randomPause);
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}
