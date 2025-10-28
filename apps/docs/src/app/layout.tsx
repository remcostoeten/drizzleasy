import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Drizzleasy - Ultra-Simple CRUD for Next.js & Drizzle ORM',
    template: '%s | Drizzleasy'
  },
  description: 'Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM. Build powerful database applications with minimal boilerplate and maximum type safety.',
  keywords: [
    'Next.js',
    'Drizzle ORM',
    'CRUD',
    'TypeScript',
    'Database',
    'Type Safety',
    'React',
    'Server Components',
    'API Routes',
    'PostgreSQL',
    'MySQL',
    'SQLite'
  ],
  authors: [{ name: 'Drizzleasy Team' }],
  creator: 'Drizzleasy',
  publisher: 'Drizzleasy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://drizzleasy.com',
    title: 'Drizzleasy - Ultra-Simple CRUD for Next.js & Drizzle ORM',
    description: 'Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM. Build powerful database applications with minimal boilerplate.',
    siteName: 'Drizzleasy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Drizzleasy - Ultra-Simple CRUD for Next.js & Drizzle ORM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drizzleasy - Ultra-Simple CRUD for Next.js & Drizzle ORM',
    description: 'Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM. Build powerful database applications with minimal boilerplate.',
    images: ['/og-image.png'],
    creator: '@drizzleasy',
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0F172A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareSourceCode",
              "name": "Drizzleasy",
              "description": "Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM",
              "url": "https://drizzleasy.com",
              "author": {
                "@type": "Organization",
                "name": "Drizzleasy Team"
              },
              "programmingLanguage": "TypeScript",
              "runtimePlatform": ["Node.js", "Next.js"],
              "applicationCategory": "DeveloperApplication",
              "license": "MIT",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "keywords": ["Next.js", "Drizzle ORM", "CRUD", "TypeScript", "Database", "Type Safety"]
            })
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}
<Analytics/>
        </RootProvider>
      </body>
    </html>
  );
}
