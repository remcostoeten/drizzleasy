'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/shared/components/ui'

function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Drizzleasy
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button 
                variant={pathname === '/' ? 'primary' : 'ghost'}
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link href="/todos">
              <Button 
                variant={pathname === '/todos' ? 'primary' : 'ghost'}
                size="sm"
              >
                Todos
              </Button>
            </Link>
            <Link href="/users">
              <Button 
                variant={pathname === '/users' ? 'primary' : 'ghost'}
                size="sm"
              >
                Users
              </Button>
            </Link>
            <Link href="/posts">
              <Button 
                variant={pathname === '/posts' ? 'primary' : 'ghost'}
                size="sm"
              >
                Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navigation }
