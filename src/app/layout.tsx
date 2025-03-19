import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web Scraping Tool with Groq Integration',
  description: 'A powerful web-based tool that can scrape content from any website using natural language instructions'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
