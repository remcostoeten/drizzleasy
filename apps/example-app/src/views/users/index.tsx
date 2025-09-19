import { UserList } from './user-list'
import { CreateUserForm } from './create-user-form'
import { getUsers } from '@/modules/users/api/queries'
import { Card } from '@/shared/components/ui'

async function UsersView() {
  const { data: users = [] } = await getUsers()
  const safeUsers = users || []
  
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-400 text-lg">Manage users with Drizzleasy CRUD operations</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Add New User</h2>
                <CreateUserForm />
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Users ({safeUsers.length})</h2>
                <UserList initialUsers={safeUsers} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { UsersView }
