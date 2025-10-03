import { AuthService } from './auth'

// Interfaces para las tareas basadas en el API
export interface Task {
  id: number
  title: string
  description: string | null
  state: "pending" | "in-progress" | "completed"
  users: TaskUser[]
  // Campos adicionales para compatibilidad con el frontend existente
  titulo?: string
  descripcion?: string
  fechaCreacion?: string
  estado?: "pendiente" | "en-progreso" | "completada"
  usuariosAsignados?: string[]
}

export interface TaskUser {
  id: string
  firstName: string
  lastName: string
  emails: string
  ages: number
}

export interface TaskCreate {
  title: string
  description?: string
  state?: string
  user_id: string
}

export interface TaskUpdate {
  state: string
}

export interface TaskAssign {
  user_id: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const TaskService = {
  // Función auxiliar para mapear tareas del API al formato del frontend
  mapTaskToLocal: (task: any): Task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    state: task.state,
    users: task.users || [],
    // Campos de compatibilidad
    titulo: task.title,
    descripcion: task.description,
    fechaCreacion: new Date().toISOString().split("T")[0], // El API no devuelve fecha
    estado: task.state === "pending" ? "pendiente" : 
           task.state === "in-progress" ? "en-progreso" : 
           task.state === "completed" ? "completada" : task.state,
    usuariosAsignados: task.users?.map((u: TaskUser) => `${u.firstName} ${u.lastName}`) || []
  }),

  // Obtener todas las tareas
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await AuthService.fetchWithAuth('/tasks')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data.map(TaskService.mapTaskToLocal) : []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  // Obtener tarea por ID
  getTaskById: async (id: number): Promise<Task | null> => {
    try {
      const response = await AuthService.fetchWithAuth(`/tasks/${id}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return TaskService.mapTaskToLocal(data)
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    }
  },

  // Crear nueva tarea
  createTask: async (taskData: TaskCreate): Promise<Task> => {
    try {
      const response = await AuthService.fetchWithAuth('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return TaskService.mapTaskToLocal(data)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  // Actualizar estado de la tarea
  updateTaskState: async (id: number, state: string): Promise<Task> => {
    try {
      const response = await AuthService.fetchWithAuth(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ state }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return TaskService.mapTaskToLocal(data)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  // Asignar usuario a tarea
  assignUserToTask: async (taskId: number, userId: string): Promise<Task> => {
    try {
      const response = await AuthService.fetchWithAuth(`/tasks/${taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return TaskService.mapTaskToLocal(data)
    } catch (error) {
      console.error('Error assigning user to task:', error)
      throw error
    }
  },

  // Desasignar usuario de tarea
  unassignUserFromTask: async (taskId: number, userId: string): Promise<Task> => {
    try {
      const response = await AuthService.fetchWithAuth(`/tasks/${taskId}/assign/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return TaskService.mapTaskToLocal(data)
    } catch (error) {
      console.error('Error unassigning user from task:', error)
      throw error
    }
  },

  // Funciones de compatibilidad con el código existente
  getSampleTasks: (): Task[] => [],

  createTaskLegacy: (taskData: Omit<Task, "id" | "fechaCreacion">): Task => {
    // Esta función mantiene compatibilidad pero debería migrarse a createTask
    return {
      id: 0,
      title: taskData.titulo || '',
      description: taskData.descripcion || '',
      state: taskData.estado === "pendiente" ? "pending" : 
             taskData.estado === "en-progreso" ? "in-progress" : 
             taskData.estado === "completada" ? "completed" : "pending",
      users: [],
      titulo: taskData.titulo,
      descripcion: taskData.descripcion,
      fechaCreacion: new Date().toISOString().split("T")[0],
      estado: taskData.estado,
      usuariosAsignados: taskData.usuariosAsignados
    }
  },

  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task | null> => {
    // Solo permite actualizar el estado por ahora
    if (taskData.state || taskData.estado) {
      const newState = taskData.state || 
        (taskData.estado === "pendiente" ? "pending" : 
         taskData.estado === "en-progreso" ? "in-progress" : 
         taskData.estado === "completada" ? "completed" : "pending")
      
      return await TaskService.updateTaskState(id, newState)
    }
    return null
  },

  deleteTask: async (id: number): Promise<boolean> => {
    // En este sistema, "eliminar" significa desasignar el usuario actual
    const userId = AuthService.getUserId()
    if (!userId) return false

    try {
      await TaskService.unassignUserFromTask(id, userId)
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  }
}
