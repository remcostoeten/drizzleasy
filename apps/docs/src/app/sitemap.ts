import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://drizzleasy.com'

  // Get all MDX files from content directory
  const contentDir = path.join(process.cwd(), 'content/docs')
  const docs: string[] = []

  function getFilesRecursively(dir: string, base: string = ''): void {
    try {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          getFilesRecursively(filePath, path.join(base, file))
        } else if (file.endsWith('.mdx')) {
          // Convert file path to URL path
          let docPath = path.join(base, file.replace('.mdx', ''))

          // Handle index files
          if (docPath.endsWith('/index')) {
            docPath = docPath.replace('/index', '')
          }

          docs.push(docPath)
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error)
    }
  }

  getFilesRecursively(contentDir)

  // Create sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [
    // Root (redirects to /docs)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Main docs page
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Add all documentation pages
  docs.forEach((doc) => {
    const url = `${baseUrl}/docs/${doc}`
    sitemapEntries.push({
      url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: doc === '' ? 0.9 : 0.8, // Higher priority for main docs page
    })
  })

  return sitemapEntries
}