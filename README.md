# Web Scraping Tool with Groq Integration

A powerful web-based tool that can scrape content from any website using natural language instructions. The tool integrates with Groq's API for processing and understanding the scraped content, and is deployable on Vercel.

![Web Scraping Tool](https://example.com/screenshot.png)

## Features

### User Experience
- Simple interface for URL input and natural language instructions
- View and download results in multiple formats
- Authentication system for secure access
- Save previous scraping tasks and their results
- Mobile-responsive design

### Technical Capabilities
- **Scraping Engine**: 
  - Basic HTML scraping with Cheerio
  - JavaScript-rendered content support with Puppeteer
  - Anti-scraping measures bypass
  - Dynamic content loading
  - Custom navigation steps

- **Groq AI Integration**:
  - Secure API key handling
  - Model Control Protocol integration
  - Structured output formatting
  - Error handling with retry mechanisms

- **Data Processing**:
  - Convert data between formats (JSON, CSV, Excel, HTML)
  - Clean and normalize extracted data
  - Custom data transformations
  - Visualization options (charts, tables, heatmaps)

- **Security**:
  - Environment variables for API key storage
  - User authentication system
  - Audit logging of all scraping activities
  - Domain allowlist/blocklist capabilities

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Groq API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/web-scraper-groq.git
   cd web-scraper-groq
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Add your Groq API key to the `.env` file:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to the scraper page
2. Enter the URL you want to scrape
3. Provide natural language instructions for what to extract
4. Optionally specify elements to wait for (for dynamic content)
5. Click "Start Scraping"
6. View the results and download in your preferred format

### Example Instructions

- "Extract all product names, prices, and availability. Create a table sorting them from lowest to highest price."
- "Find all news article headlines and publication dates from the last week."
- "Extract contact information including email addresses and phone numbers."

## API Endpoints

- `/api/scrape` - Main scraping endpoint
- `/api/history` - Retrieve scraping history
- `/api/process` - Process scraped data with Groq

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Ethics and Compliance

This tool is designed with ethical web scraping practices in mind:
- Respects robots.txt directives
- Implements rate limiting to avoid server overload
- Stores only necessary data
- Includes terms of service prohibiting illegal scraping activities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Groq](https://groq.com) for their powerful AI API
- [Cheerio](https://cheerio.js.org/) for HTML parsing
- [Puppeteer](https://pptr.dev/) for headless browser capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
