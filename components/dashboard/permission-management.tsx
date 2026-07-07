'use client'

import { useState } from 'react'
import { Users, ShieldCheck, Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from './permission/user-management'
import { RoleManagement } from './permission/role-management'
import { DepartmentManagement } from './permission/department-management'
import {
  INITIAL_DEPARTMENTS,
  INITIAL_ROLES,
  INITIAL_USERS,
  type Department,
  type Role,
  type User,
} from '@/lib/permission-data'

export function PermissionManagement() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">权限管理</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          基于 RBAC 模型统一管理用户、角色与部门。功能权限（菜单 + 按钮）与数据权限分离配置。
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="size-4" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            <ShieldCheck className="size-4" />
            角色管理
          </TabsTrigger>
          <TabsTrigger value="depts" className="gap-1.5">
            <Building2 className="size-4" />
            部门管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement
            users={users}
            setUsers={setUsers}
            roles={roles}
            departments={departments}
          />
        </TabsContent>
        <TabsContent value="roles">
          <RoleManagement roles={roles} setRoles={setRoles} departments={departments} />
        </TabsContent>
        <TabsContent value="depts">
          <DepartmentManagement departments={departments} setDepartments={setDepartments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
