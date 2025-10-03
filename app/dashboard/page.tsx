"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/layout/header"
import { TaskService, type Task } from "@/lib/tasks"
import { AuthService } from "@/lib/auth"
import { AdminService } from "@/lib/admin"
import { PermissionsGuard, usePermissions } from "@/components/permissions-guard"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    state: 'pending' as 'pending' | 'in-progress' | 'completed'
  })
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    state: 'pending' as 'pending' | 'in-progress' | 'completed'
  })
  const router = useRouter()
  const permissions = usePermissions()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Solo obtener tareas asignadas al usuario actual
        const currentUserId = AuthService.getUserId()
        if (currentUserId) {
          const tasks = await TaskService.getTasksByUser(currentUserId)
          setTasks(tasks)
        } else {
          setTasks([])
        }
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setTasks([])
      }
    }
    fetchTasks()
  }, [])

  // Función para recargar tareas
  const reloadTasks = async () => {
    try {
      const currentUserId = AuthService.getUserId()
      if (currentUserId) {
        const tasks = await TaskService.getTasksByUser(currentUserId)
        setTasks(tasks)
      }
    } catch (err) {
      console.error('Error reloading tasks:', err)
    }
  }

  // Abrir diálogo de edición
  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setEditFormData({
      title: task.title,
      description: task.description || '',
      state: task.state
    })
    setShowEditDialog(true)
  }

  // Abrir diálogo de cambio de estado
  const handleChangeStatus = (task: Task) => {
    setSelectedTask(task)
    setEditFormData({
      title: task.title,
      description: task.description || '',
      state: task.state
    })
    setShowStatusDialog(true)
  }

  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    if (!selectedTask) return

    try {
      await TaskService.updateTask(selectedTask.id, {
        title: editFormData.title,
        description: editFormData.description,
        state: editFormData.state
      })

      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      })

      setShowEditDialog(false)
      reloadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Error al actualizar la tarea",
        variant: "destructive",
      })
    }
  }

  // Guardar cambio de estado
  const handleSaveStatus = async () => {
    if (!selectedTask) return

    try {
      await TaskService.updateTaskState(selectedTask.id, editFormData.state)

      toast({
        title: "Estado actualizado",
        description: `La tarea se cambió a ${getStatusLabel(editFormData.state)}`,
      })

      setShowStatusDialog(false)
      reloadTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado",
        variant: "destructive",
      })
    }
  }

  // Función auxiliar para obtener etiqueta de estado
  const getStatusLabel = (state: string) => {
    const statusLabels: Record<string, string> = {
      "pending": "Pendiente",
      "in-progress": "En Progreso", 
      "completed": "Completada"
    }
    return statusLabels[state] || "Pendiente"
  }

  // Crear nueva tarea personal
  const handleCreateTask = async () => {
    try {
      const userId = AuthService.getUserId()
      console.log('Current user ID:', userId)
      
      if (!userId) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive",
        })
        return
      }

      if (!createFormData.title.trim()) {
        toast({
          title: "Error",
          description: "El título es obligatorio",
          variant: "destructive",
        })
        return
      }

      const newTask = {
        title: createFormData.title.trim(),
        description: createFormData.description?.trim() || '',
        state: createFormData.state,
        user_id: userId // Auto-asignar a sí mismo
      }
      
      console.log('Creating task with data:', newTask)
      await TaskService.createTask(newTask)
      
      toast({
        title: "Tarea creada",
        description: "Tu tarea personal ha sido creada exitosamente",
      })

      setShowCreateDialog(false)
      setCreateFormData({
        title: '',
        description: '',
        state: 'pending'
      })
      reloadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Error al crear la tarea",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (estado: Task["estado"]) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", variant: "secondary" as const },
      "en-progreso": { label: "En Progreso", variant: "default" as const },
      completada: { label: "Completada", variant: "outline" as const },
    }

    const config = estado ? statusConfig[estado] : statusConfig.pendiente
    return <Badge variant={config?.variant || "secondary"}>{config?.label || "Pendiente"}</Badge>
  }

  const filteredTasks = tasks.filter(
    (task) =>
      (task.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header title="Gestor de Tareas" />

        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Tareas</CardDescription>
                <CardTitle className="text-3xl">{tasks.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>En Progreso</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {tasks.filter((t) => t.estado === "en-progreso").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completadas</CardDescription>
                <CardTitle className="text-3xl text-green-500">
                  {tasks.filter((t) => t.estado === "completada").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar mis tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarea Personal
            </Button>
          </div>

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Tareas Asignadas</CardTitle>
              <CardDescription>Solo puedes ver y editar las tareas que te han sido asignadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios Asignados</TableHead>
                    <TableHead className="w-[180px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.titulo || task.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{task.descripcion || task.description}</TableCell>
                      <TableCell>{task.fechaCreacion ? new Date(task.fechaCreacion).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(task.estado)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(task.usuariosAsignados || []).map((usuario, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {usuario}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PermissionsGuard requiredPermission="update">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                              title="Editar tarea"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </PermissionsGuard>
                          
                          <PermissionsGuard requiredPermission="update">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(task)}
                              title="Cambiar estado"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </PermissionsGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>

        {/* Dialog para editar tarea */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tarea</DialogTitle>
              <DialogDescription>
                Modifica los datos de la tarea asignada
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editTitle">Título</Label>
                <Input
                  id="editTitle"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  placeholder="Título de la tarea"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Descripción</Label>
                <Textarea
                  id="editDescription"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="editState">Estado</Label>
                <Select value={editFormData.state} onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setEditFormData({...editFormData, state: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para cambiar estado */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Estado</DialogTitle>
              <DialogDescription>
                Actualiza el estado de la tarea: {selectedTask?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="statusState">Nuevo Estado</Label>
                <Select value={editFormData.state} onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setEditFormData({...editFormData, state: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Información sobre el cambio */}
              <div className="bg-muted p-3 rounded-md">
                <Label className="text-sm font-medium">Estado actual:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {getStatusLabel(selectedTask?.state || '')}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveStatus}>
                Actualizar Estado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para crear nueva tarea */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Tarea Personal</DialogTitle>
              <DialogDescription>
                Crea una nueva tarea que se asignará automáticamente a ti
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="createTitle">Título</Label>
                <Input
                  id="createTitle"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  placeholder="Título de la tarea"
                />
              </div>
              <div>
                <Label htmlFor="createDescription">Descripción</Label>
                <Textarea
                  id="createDescription"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="createState">Estado Inicial</Label>
                <Select value={createFormData.state} onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setCreateFormData({...createFormData, state: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={!createFormData.title.trim()}>
                Crear Tarea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
