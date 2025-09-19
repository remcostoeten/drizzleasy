import Link from 'next/link'
import { Button, Card } from '@/shared/components/ui'

export default function Home() {
    return (
        <div className='min-h-screen bg-black text-white pt-16'>
            <div className='container mx-auto px-4 py-16'>
                <div className='max-w-4xl mx-auto text-center space-y-12'>
                    <div className='space-y-6'>
                        <h1 className='text-6xl font-bold tracking-tight'>
                            Drizzleasy
                            <span className='block text-4xl text-gray-400 font-normal mt-2'>
                                Example App
                            </span>
                        </h1>
                        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
                            Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM. 
                            Built with modern architecture and dark Vercel aesthetics.
                        </p>
                    </div>
                    
                    <div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
                        <Card className='text-left'>
                            <h3 className='text-xl font-semibold mb-3'>Todo Manager</h3>
                            <p className='text-gray-400 mb-4'>
                                Complete CRUD operations with optimistic updates, 
                                built using Drizzle&apos;s simple API.
                            </p>
                            <Link href="/todos">
                                <Button className='w-full'>
                                    View Todo App →
                                </Button>
                            </Link>
                        </Card>
                        
                        <Card className='text-left'>
                            <h3 className='text-xl font-semibold mb-3'>User Management</h3>
                            <p className='text-gray-400 mb-4'>
                                User profiles, authentication, and role-based access 
                                with type-safe operations.
                            </p>
                            <Link href="/users">
                                <Button variant='secondary' className='w-full'>
                                    View Users →
                                </Button>
                            </Link>
                        </Card>
                        
                        <Card className='text-left'>
                            <h3 className='text-xl font-semibold mb-3'>Blog Posts</h3>
                            <p className='text-gray-400 mb-4'>
                                Create and manage blog posts with user relationships 
                                and advanced filtering.
                            </p>
                            <Link href="/posts">
                                <Button variant='secondary' className='w-full'>
                                    View Posts →
                                </Button>
                            </Link>
                        </Card>
                    </div>
                    
                    <Card className='text-left max-w-2xl mx-auto'>
                        <h3 className='text-lg font-semibold mb-3'>🚀 Quick Start</h3>
                        <div className='space-y-3 text-sm'>
                            <div className='flex items-center gap-3'>
                                <span className='w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold'>1</span>
                                <span>Set up your DATABASE_URL in .env.local</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <span className='w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold'>2</span>
                                <code className='bg-gray-800 px-2 py-1 rounded'>bun run db:push</code>
                            </div>
                            <div className='flex items-center gap-3'>
                                <span className='w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold'>3</span>
                                <span>Start creating todos!</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
