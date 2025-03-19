# Deployment Instructions for Web Scraping Tool with Groq Integration

This document provides instructions for deploying the Web Scraping Tool with Groq Integration to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Groq](https://groq.com) API key
3. Node.js and npm installed locally

## Environment Variables

Before deploying, you need to set up the following environment variables in the Vercel dashboard:

- `GROQ_API_KEY`: Your Groq API key for AI processing
- `AUTH_SECRET`: A secure random string for JWT token encryption
- `RATE_LIMIT_MAX`: Maximum number of requests allowed in the time window (default: 100)
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds (default: 60000)
- `ALLOWED_DOMAINS`: Comma-separated list of domains allowed for scraping (optional)
- `BLOCKED_DOMAINS`: Comma-separated list of domains blocked from scraping (optional)

## Deployment Steps

### Option 1: Deploy with Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Navigate to the project directory:
   ```
   cd web-scraper-groq
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. Follow the prompts to configure your project.

6. For production deployment:
   ```
   vercel --prod
   ```

### Option 2: Deploy with GitHub Integration

1. Push your code to a GitHub repository.

2. Log in to your Vercel account.

3. Click "New Project" and import your GitHub repository.

4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. Add the environment variables mentioned above.

6. Click "Deploy" to start the deployment process.

## Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

- API routes with cache control headers
- Environment variable configuration
- Routing rules for the application

## Post-Deployment

After deployment, you should:

1. Test the application to ensure all features work correctly
2. Set up a custom domain if needed
3. Configure any additional security settings in the Vercel dashboard

## Troubleshooting

If you encounter issues during deployment:

1. Check the Vercel deployment logs
2. Verify that all environment variables are set correctly
3. Ensure that the Groq API key is valid
4. Check for any build errors in the console output

## Monitoring and Maintenance

- Monitor the application's performance using Vercel Analytics
- Set up alerts for any critical errors
- Regularly update dependencies to maintain security and performance
