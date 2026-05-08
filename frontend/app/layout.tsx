import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistPixelGrid } from 'geist/font/pixel'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Short.ly',
  description:
    'A professional, brutalist-themed URL shortener with real-time telemetry, link expiry, and high-performance routing infrastructure. Built with Next.js, Express, and Drizzle ORM.',
  keywords: [
    'URL shortener',
    'Short.ly',
    'link management',
    'real-time analytics',
    'link telemetry',
    'secure routing',
    'expiry-based links',
    'Next.js url shortener',
    'engineering-grade software',
    'brutalist design',
  ],
  authors: [{ name: 'SYS.INT' }],
  creator: 'System Intelligence Corp.',
  publisher: 'System Intelligence Corp.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Short.ly | Engineering-Grade URL Shortener',
    description:
      'A professional URL shortener with real-time telemetry, link expiry, and high-performance routing. Built for reliability and speed.',
    siteName: 'Short.ly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Short.ly | Engineering-Grade URL Shortener',
    description:
      'A professional URL shortener with real-time telemetry and link expiry. Built with Next.js and high-performance backend infrastructure.',
    creator: '@sysint',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#F2F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${GeistPixelGrid.variable}`} suppressHydrationWarning>
      <body className="font-mono antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
