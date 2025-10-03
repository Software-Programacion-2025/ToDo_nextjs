// Interfaces para la autenticación
export interface LoginCredentials {
  emails: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user_id: string
  user_emails: string
  first_name: string
  last_name: string
  roles: string[]
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const AuthService = {
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    const token = sessionStorage.getItem("access_token")
    return !!token
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem("access_token")
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window === "undefined") return null
    const profile = sessionStorage.getItem("user_profile")
    return profile ? JSON.parse(profile) : null
  },

  getUserId: (): string | null => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem("user_id")
  },

  getUsername: (): string => {
    const profile = AuthService.getUserProfile()
    return profile ? `${profile.firstName} ${profile.lastName}` : ""
  },

  getUserRoles: (): string[] => {
    const profile = AuthService.getUserProfile()
    return profile?.roles || []
  },

  hasRole: (role: string): boolean => {
    const roles = AuthService.getUserRoles()
    return roles.includes(role)
  },

  hasPermission: (permission: string): boolean => {
    const roles = AuthService.getUserRoles()
    // Mapeo de roles del backend a permisos
    const rolePermissions: Record<string, string[]> = {
      "Administrador": ["create", "read", "update", "delete", "assign", "admin"],
      "Gerente": ["create", "read", "update", "assign", "manage"],
      "Empleado": ["read", "update", "create"],
      "Cajero": ["read", "update"]
    }

    return roles.some(role => 
      rolePermissions[role]?.includes(permission)
    )
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emails: credentials.emails,
        password: credentials.password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error de autenticación")
    }

    const data = await response.json()
    
    // Guardar datos en sessionStorage
    sessionStorage.setItem("access_token", data.access_token)
    sessionStorage.setItem("user_id", data.user_id)
    
    // Los roles ya vienen del backend en la respuesta de login
    const userProfile: UserProfile = {
      id: data.user_id,
      email: data.user_emails,
      firstName: data.first_name,
      lastName: data.last_name,
      roles: data.roles || []
    }
    
    sessionStorage.setItem("user_profile", JSON.stringify(userProfile))

    return {
      access_token: data.access_token,
      token_type: data.token_type,
      user_id: data.user_id,
      user_emails: data.user_emails,
      first_name: data.first_name,
      last_name: data.last_name,
      roles: data.roles || []
    }
  },

  logout: (): void => {
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("user_id")
    sessionStorage.removeItem("user_profile")
  },

  // Función para hacer peticiones autenticadas
  fetchWithAuth: async (url: string, options: RequestInit = {}) => {
    const token = AuthService.getToken()
    
    if (!token) {
      throw new Error("No authenticated")
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      AuthService.logout()
      throw new Error("Session expired")
    }

    return response
  },

  // Función para obtener lista de usuarios disponibles
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await AuthService.fetchWithAuth("/users/simple")
    
    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.status}`)
    }
    
    const users = await response.json()
    return users.map((user: any) => ({
      id: user.id,
      email: user.emails,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || []
    }))
  }
}
