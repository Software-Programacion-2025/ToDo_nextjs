export interface Task {
  id: string
  titulo: string
  descripcion: string
  fechaCreacion: string
  estado: "pendiente" | "en-progreso" | "completada"
  usuariosAsignados: string[]
}

export const TaskService = {
  // Datos de ejemplo - en una app real esto vendría de una API/base de datos
  getSampleTasks: (): Task[] => [
    {
      id: "1",
      titulo: "Implementar autenticación",
      descripcion: "Desarrollar sistema de login y registro de usuarios",
      fechaCreacion: "2024-01-15",
      estado: "completada",
      usuariosAsignados: ["admin", "developer"],
    },
    {
      id: "2",
      titulo: "Diseñar interfaz de usuario",
      descripcion: "Crear mockups y prototipos para la aplicación",
      fechaCreacion: "2024-01-16",
      estado: "en-progreso",
      usuariosAsignados: ["designer", "admin"],
    },
    {
      id: "3",
      titulo: "Configurar base de datos",
      descripcion: "Establecer conexión y esquemas de la base de datos",
      fechaCreacion: "2024-01-17",
      estado: "pendiente",
      usuariosAsignados: ["admin"],
    },
    {
      id: "4",
      titulo: "Implementar API REST",
      descripcion: "Desarrollar endpoints para operaciones CRUD",
      fechaCreacion: "2024-01-18",
      estado: "en-progreso",
      usuariosAsignados: ["developer", "admin"],
    },
    {
      id: "5",
      titulo: "Testing y QA",
      descripcion: "Realizar pruebas unitarias e integración",
      fechaCreacion: "2024-01-19",
      estado: "pendiente",
      usuariosAsignados: ["tester"],
    },
  ],

  getTaskById: (id: string): Task | null => {
    const tasks = TaskService.getSampleTasks()
    return tasks.find((task) => task.id === id) || null
  },

  createTask: (taskData: Omit<Task, "id" | "fechaCreacion">): Task => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString().split("T")[0],
    }
    // En una app real, aquí se guardaría en la base de datos
    console.log("Tarea creada:", newTask)
    return newTask
  },

  updateTask: (id: string, taskData: Partial<Task>): Task | null => {
    const task = TaskService.getTaskById(id)
    if (!task) return null

    const updatedTask = { ...task, ...taskData }
    // En una app real, aquí se actualizaría en la base de datos
    console.log("Tarea actualizada:", updatedTask)
    return updatedTask
  },

  deleteTask: (id: string): boolean => {
    const task = TaskService.getTaskById(id)
    if (!task) return false

    // En una app real, aquí se eliminaría de la base de datos
    console.log("Tarea eliminada:", id)
    return true
  },
}
