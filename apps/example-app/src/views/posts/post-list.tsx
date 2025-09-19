'use client'

import { useState } from 'react'
import { deletePost } from '@/modules/posts/api/mutations'
import { Button, Modal } from '@/shared/components/ui'
import type { Post } from '@/modules/posts/models/z.post'
import type { User } from '@/modules/users/models/z.user'

type TProps = {
  initialPosts: Post[]
  users: User[]
}

function PostList({ initialPosts, users }: TProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  
  function getAuthorName(authorId: string | null) {
    if (!authorId) return 'Unknown Author'
    const author = users.find(user => user.id === authorId)
    return author?.name || 'Unknown Author'
  }
  
  function handleDeleteClick(post: Post) {
    setPostToDelete(post)
    setDeleteModalOpen(true)
  }
  
  async function confirmDelete() {
    if (postToDelete) {
      const result = await deletePost(postToDelete.id)
      
      if (!result.error) {
        setPosts(posts.filter(post => post.id !== postToDelete.id))
        setDeleteModalOpen(false)
        setPostToDelete(null)
      }
    }
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm">Create your first post to get started</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-lg border border-gray-700 bg-gray-800 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {post.title}
                </h3>
                {post.content && (
                  <p className="text-gray-300 mb-3 line-clamp-3">
                    {post.content}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>By {getAuthorName(post.authorId)}</span>
                  {post.createdAt && (
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteClick(post)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Post"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete &quot;{postToDelete?.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export { PostList }
