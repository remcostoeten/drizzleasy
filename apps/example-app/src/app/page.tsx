import Link from 'next/link'

export default function Home() {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center space-y-8'>
            <h1 className='text-4xl font-bold'>Drizzleasy Example App</h1>
            <p className='text-lg text-gray-600'>Examples from the documentation</p>
            <div className='space-y-4'>
                <Link 
                    href="/todos" 
                    className='block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                >
                    Todo App Example
                </Link>
                <div className='text-sm text-gray-500'>
                    <p>Make sure to:</p>
                    <ol className='list-decimal list-inside space-y-1 mt-2'>
                        <li>Set up your DATABASE_URL in .env.local</li>
                        <li>Run: <code className='bg-gray-100 px-1 rounded'>bun run db:push</code></li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
