import { PostList } from './post-list'
import { CreatePostForm } from './create-post-form'
import { getPosts } from '@/modules/posts/api/queries'
import { getUsers } from '@/modules/users/api/queries'
import { Card } from '@/shared/components/ui'

async function PostsView() {
  const [{ data: posts = [] }, { data: users = [] }] = await Promise.all([
    getPosts(),
    getUsers()
  ])
  
  const safeUsers = users || []
  const safePosts = posts || []
  
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-gray-400 text-lg">Manage blog posts with user relationships</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
                <CreatePostForm users={safeUsers} />
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Posts ({safePosts.length})</h2>
                <PostList initialPosts={safePosts} users={safeUsers} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PostsView }
