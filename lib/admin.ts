import { AuthService } from './auth'

// Interfaces para la administración
export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  emails: string
  ages: number
  roles: string[]
  tasks: AdminTask[]
  created_at?: string
  updated_at?: string
  is_active: boolean
}

export interface AdminTask {
  id: number
  title: string
  description?: string
  state: string
  created_at?: string
}

export interface RoleAssignment {
  user_id: string
  role_name: string
}

export interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  users_by_role: Record<string, number>
  recent_registrations: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const AdminService = {
  // Obtener todos los usuarios con información completa
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await AuthService.fetchWithAuth("/users")
    
    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.status}`)
    }
    
    const users = await response.json()
    return users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emails: user.emails,
      ages: user.ages,
      roles: user.roles || [],
      tasks: user.tasks || [],
      created_at: user.create_at,
      updated_at: user.update_at,
      is_active: !user.delete_at
    }))
  },

  // Obtener usuarios eliminados
  getDeletedUsers: async (): Promise<AdminUser[]> => {
    const response = await AuthService.fetchWithAuth("/users/deleted")
    
    if (!response.ok) {
      throw new Error(`Error al obtener usuarios eliminados: ${response.status}`)
    }
    
    const users = await response.json()
    return users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emails: user.emails,
      ages: user.ages,
      roles: user.roles || [],
      tasks: user.tasks || [],
      created_at: user.create_at,
      updated_at: user.update_at,
      is_active: false
    }))
  },

  // Obtener estadísticas de usuarios
  getUserStats: async (): Promise<UserStats> => {
    try {
      const [activeUsers, deletedUsers] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getDeletedUsers()
      ])
      
      const roleCount: Record<string, number> = {}
      activeUsers.forEach(user => {
        user.roles.forEach(role => {
          roleCount[role] = (roleCount[role] || 0) + 1
        })
      })

      // Calcular registros recientes (últimos 7 días)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const recentRegistrations = activeUsers.filter(user => {
        if (!user.created_at) return false
        return new Date(user.created_at) >= sevenDaysAgo
      }).length

      return {
        total_users: activeUsers.length + deletedUsers.length,
        active_users: activeUsers.length,
        inactive_users: deletedUsers.length,
        users_by_role: roleCount,
        recent_registrations: recentRegistrations
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  },

  // Eliminar usuario (soft delete)
  deleteUser: async (userId: string): Promise<void> => {
    const response = await AuthService.fetchWithAuth(`/users/${userId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al eliminar usuario: ${response.status}`)
    }
  },

  // Restaurar usuario eliminado
  restoreUser: async (userId: string): Promise<void> => {
    const response = await AuthService.fetchWithAuth(`/users/${userId}/restore`, {
      method: 'POST'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al restaurar usuario: ${response.status}`)
    }
  },

  // Crear nuevo usuario
  createUser: async (userData: {
    firstName: string
    lastName: string
    emails: string
    password: string
    ages: number
  }): Promise<AdminUser> => {
    const response = await AuthService.fetchWithAuth("/users", {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al crear usuario: ${response.status}`)
    }

    return await response.json()
  },

  // Actualizar usuario
  updateUser: async (userId: string, userData: {
    firstName?: string
    lastName?: string
    emails?: string
    ages?: number
  }): Promise<AdminUser> => {
    const response = await AuthService.fetchWithAuth(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al actualizar usuario: ${response.status}`)
    }

    return await response.json()
  },

  // Obtener todos los roles disponibles
  getRoles: async (): Promise<Array<{id: number, rol_nombre: string, rol_permisos: string}>> => {
    const response = await AuthService.fetchWithAuth("/roles")
    
    if (!response.ok) {
      throw new Error(`Error al obtener roles: ${response.status}`)
    }
    
    return await response.json()
  },

  // Asignar rol a usuario
  assignRole: async (userId: string, roleName: string): Promise<AdminUser> => {
    const response = await AuthService.fetchWithAuth(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role_name: roleName })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al asignar rol: ${response.status}`)
    }

    return await response.json()
  },

  // Remover rol de usuario  
  removeRole: async (userId: string, roleName: string): Promise<AdminUser> => {
    const response = await AuthService.fetchWithAuth(`/users/${userId}/roles/${roleName}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error al remover rol: ${response.status}`)
    }

    return await response.json()
  }
}