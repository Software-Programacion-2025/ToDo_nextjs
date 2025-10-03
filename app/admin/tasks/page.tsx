'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { RefreshCw, Plus, Edit3, Users, Settings, UserPlus, X } from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import { AuthGuard } from '../../../components/auth-guard'
import { PermissionsGuard } from '../../../components/permissions-guard'
import { Header } from '../../../components/layout/header'
import { TaskService, Task } from '../../../lib/tasks'
import { AdminService, AdminUser } from '../../../lib/admin'

interface TaskFormData {
  title: string
  description: string
  state: 'pending' | 'in-progress' | 'completed'
  assignedUsers: string[]
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    state: 'pending',
    assignedUsers: []
  })
  
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [allTasks, allUsers] = await Promise.all([
        TaskService.getAllTasks(),
        AdminService.getAllUsers()
      ])
      setTasks(allTasks)
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar tareas por término de búsqueda
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Función para crear nueva tarea
  const handleCreateTask = () => {
    setFormData({
      title: '',
      description: '',
      state: 'pending',
      assignedUsers: []
    })
    setShowCreateDialog(true)
  }

  // Función para editar tarea existente
  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      state: task.state,
      assignedUsers: task.users?.map(u => u.id) || []
    })
    setShowEditDialog(true)
  }

  // Función para asignar usuarios a tarea
  const handleAssignUsers = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      state: task.state,
      assignedUsers: task.users?.map(u => u.id) || []
    })
    setShowAssignDialog(true)
  }

  // Función para guardar tarea (crear o editar)
  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      })
      return
    }

    try {
      if (showCreateDialog) {
        // Crear nueva tarea (el usuario se asignará desde el backend)
        await TaskService.createTask({
          title: formData.title,
          description: formData.description,
          state: formData.state,
          user_id: formData.assignedUsers[0] || '' // Primer usuario seleccionado
        })
        
        toast({
          title: "Tarea creada",
          description: "La tarea ha sido creada exitosamente",
        })
      } else if (selectedTask) {
        await TaskService.updateTask(selectedTask.id, {
          title: formData.title,
          description: formData.description,
          state: formData.state
        })
        
        toast({
          title: "Tarea actualizada",
          description: "La tarea ha sido actualizada exitosamente",
        })
      }

      setShowCreateDialog(false)
      setShowEditDialog(false)
      loadAllData()
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        title: "Error",
        description: "Error al guardar la tarea",
        variant: "destructive",
      })
    }
  }

  // Función para asignar usuarios
  const handleSaveAssignments = async () => {
    if (!selectedTask) return

    try {
      // Aquí puedes implementar la lógica para asignar múltiples usuarios
      // Por ahora, solo asignaremos el primer usuario seleccionado
      if (formData.assignedUsers.length > 0) {
        await TaskService.assignUserToTask(selectedTask.id, formData.assignedUsers[0])
      }

      toast({
        title: "Usuarios asignados",
        description: "Los usuarios han sido asignados a la tarea",
      })

      setShowAssignDialog(false)
      loadAllData()
    } catch (error) {
      console.error('Error assigning users:', error)
      toast({
        title: "Error",
        description: "Error al asignar usuarios",
        variant: "destructive",
      })
    }
  }

  // Agregar usuario a tarea
  const handleAddUserToTask = async (userId: string) => {
    if (!selectedTask || !userId || userId === 'no-users') return

    try {
      await TaskService.assignUserToTask(selectedTask.id, userId)
      
      toast({
        title: "Usuario asignado",
        description: "El usuario ha sido asignado a la tarea exitosamente",
      })

      // Recargar datos para actualizar la UI
      await loadAllData()
      
      // Actualizar el selectedTask con los datos más recientes
      const updatedTasks = await TaskService.getAllTasks()
      const updatedTask = updatedTasks.find(t => t.id === selectedTask.id)
      if (updatedTask) {
        setSelectedTask(updatedTask)
      }
      
    } catch (error) {
      console.error('Error adding user to task:', error)
      toast({
        title: "Error",
        description: "Error al asignar el usuario a la tarea",
        variant: "destructive",
      })
    }
  }

  // Remover usuario de tarea
  const handleRemoveUserFromTask = async (userId: string) => {
    if (!selectedTask || !userId) return

    try {
      await TaskService.unassignUserFromTask(selectedTask.id, userId)
      
      toast({
        title: "Usuario removido",
        description: "El usuario ha sido removido de la tarea exitosamente",
      })

      // Recargar datos para actualizar la UI
      await loadAllData()
      
      // Actualizar el selectedTask con los datos más recientes
      const updatedTasks = await TaskService.getAllTasks()
      const updatedTask = updatedTasks.find(t => t.id === selectedTask.id)
      if (updatedTask) {
        setSelectedTask(updatedTask)
      }
      
    } catch (error) {
      console.error('Error removing user from task:', error)
      toast({
        title: "Error",
        description: "Error al remover el usuario de la tarea",
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

  const getStatusBadge = (state: string) => {
    const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
      "pending": { label: "Pendiente", variant: "secondary" },
      "in-progress": { label: "En Progreso", variant: "default" },
      "completed": { label: "Completada", variant: "outline" },
    }

    const config = statusConfig[state] || statusConfig["pending"]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthGuard>
      <PermissionsGuard requiredRole="Administrador" fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Acceso Denegado</CardTitle>
              <CardDescription>
                No tienes permisos para acceder a esta página. Se requiere rol de administrador.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }>
        <div className="min-h-screen bg-background">
          <Header title="Gestión de Tareas" showBackButton backUrl="/admin" />
          
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Administrar Tareas</h2>
                  <p className="text-muted-foreground">
                    Crea nuevas tareas y asígnalas a usuarios del sistema
                  </p>
                </div>
                <Button onClick={handleCreateTask} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Tarea
                </Button>
              </div>

              {/* Barra de búsqueda */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Tabla de tareas */}
              <Card>
                <CardHeader>
                  <CardTitle>Todas las Tareas del Sistema</CardTitle>
                  <CardDescription>
                    Lista completa de tareas con sus asignaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Usuarios Asignados</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.title}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {task.description}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(task.state)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {task.users && task.users.length > 0 ? (
                                task.users.map((user) => (
                                  <Badge key={user.id} variant="outline" className="text-xs">
                                    {user.firstName} {user.lastName}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Sin asignar
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                title="Editar tarea"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignUsers(task)}
                                title="Asignar usuarios"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Dialog para crear tarea */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tarea</DialogTitle>
                  <DialogDescription>
                    Completa los datos para crear una nueva tarea
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="createTitle">Título</Label>
                    <Input
                      id="createTitle"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div>
                    <Label htmlFor="createDescription">Descripción</Label>
                    <Textarea
                      id="createDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descripción de la tarea"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="createState">Estado inicial</Label>
                    <Select value={formData.state} onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setFormData({...formData, state: value})}>
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
                  <div>
                    <Label htmlFor="createAssign">Asignar a usuario</Label>
                    <Select value={formData.assignedUsers[0] || 'unassigned'} onValueChange={(value) => setFormData({...formData, assignedUsers: value === 'unassigned' ? [] : [value]})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} - {user.emails}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTask}>
                    Crear Tarea
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para editar tarea */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Tarea</DialogTitle>
                  <DialogDescription>
                    Modifica los datos de la tarea
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="editTitle">Título</Label>
                    <Input
                      id="editTitle"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDescription">Descripción</Label>
                    <Textarea
                      id="editDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descripción de la tarea"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editState">Estado</Label>
                    <Select value={formData.state} onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setFormData({...formData, state: value})}>
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
                  <Button onClick={handleSaveTask}>
                    Actualizar Tarea
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para asignar usuarios */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Asignar Usuarios</DialogTitle>
                  <DialogDescription>
                    Asigna usuarios a la tarea: {selectedTask?.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="assignUsers">Usuarios asignados</Label>
                    
                    {/* Lista de usuarios asignados con badges */}
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 border rounded-md bg-muted/10">
                      {selectedTask && selectedTask.users && selectedTask.users.length > 0 ? (
                        selectedTask.users.map((user) => (
                          <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
                            <span>{user.firstName} {user.lastName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUserFromTask(user.id)}
                              className="ml-2 hover:text-red-500 transition-colors"
                              aria-label={`Remover ${user.firstName} ${user.lastName}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Sin usuarios asignados</span>
                      )}
                    </div>
                    
                    {/* Selector para agregar usuarios */}
                    <Select onValueChange={(value) => handleAddUserToTask(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Agregar usuario a la tarea" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter(user => !selectedTask?.users?.some(assignedUser => assignedUser.id === user.id))
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {user.firstName} {user.lastName} - {user.emails}
                              </div>
                            </SelectItem>
                          ))}
                        {users.filter(user => !selectedTask?.users?.some(assignedUser => assignedUser.id === user.id)).length === 0 && (
                          <SelectItem value="no-users" disabled>
                            Todos los usuarios ya están asignados
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Información sobre la tarea */}
                  <div className="bg-muted p-3 rounded-md">
                    <Label className="text-sm font-medium">Información de la tarea:</Label>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <div><strong>Estado:</strong> {getStatusLabel(selectedTask?.state || '')}</div>
                      <div><strong>Descripción:</strong> {selectedTask?.description || 'Sin descripción'}</div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAssignments}>
                    Asignar Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </PermissionsGuard>
    </AuthGuard>
  )
}