"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/layout/header"
import { TaskService, type Task } from "@/lib/tasks"
import { AuthService } from "@/lib/auth"
import { PermissionsGuard, usePermissions } from "@/components/permissions-guard"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const permissions = usePermissions()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getAllTasks()
        setTasks(tasks)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setTasks([])
      }
    }
    fetchTasks()
  }, [])

  // Elimina la asignación del usuario actual a la tarea (softdelete)
  const handleDeleteTask = async (taskId: number) => {
    try {
      const success = await TaskService.deleteTask(taskId)
      if (success) {
        setTasks(tasks.filter((task) => task.id !== taskId))
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      // Podrías mostrar un toast o mensaje de error aquí
    }
  }

  // Asignar usuario a tarea existente
  const handleAssignUser = async (taskId: number, userId: string) => {
    try {
      await TaskService.assignUserToTask(taskId, userId)
      // Recargar tareas para reflejar el cambio
      const updatedTasks = await TaskService.getAllTasks()
      setTasks(updatedTasks)
    } catch (err) {
      console.error('Error assigning user to task:', err)
    }
  }

  // Marcar tarea como completada
  const handleCompleteTask = async (taskId: number) => {
    try {
      await TaskService.updateTaskState(taskId, "completed")
      // Recargar tareas para reflejar el cambio
      const updatedTasks = await TaskService.getAllTasks()
      setTasks(updatedTasks)
    } catch (err) {
      console.error('Error completing task:', err)
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
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <PermissionsGuard requiredPermission="create">
              <Button onClick={() => router.push("/dashboard/nueva-tarea")}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </PermissionsGuard>
          </div>

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tareas</CardTitle>
              <CardDescription>Gestiona todas las tareas del proyecto</CardDescription>
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
                        <div className="flex flex-col gap-1">
                          <PermissionsGuard requiredPermission="assign">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const userId = AuthService.getUserId()
                                if (userId) handleAssignUser(task.id, userId)
                              }}
                            >
                              Asignarme
                            </Button>
                          </PermissionsGuard>
                          
                          <PermissionsGuard requiredPermission="update">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={task.estado === "completada" || task.state === "completed"}
                            >
                              Marcar como completada
                            </Button>
                          </PermissionsGuard>

                          {(permissions.canUpdate() || permissions.canDelete()) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <PermissionsGuard requiredPermission="update">
                                  <DropdownMenuItem onClick={() => router.push(`/dashboard/editar-tarea/${task.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                </PermissionsGuard>
                                
                                <PermissionsGuard requiredPermission="delete">
                                  <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </PermissionsGuard>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
