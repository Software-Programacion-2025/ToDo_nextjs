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

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const sampleTasks = TaskService.getSampleTasks()
    setTasks(sampleTasks)
  }, [])

  const handleDeleteTask = (taskId: string) => {
    const success = TaskService.deleteTask(taskId)
    if (success) {
      setTasks(tasks.filter((task) => task.id !== taskId))
    }
  }

  const getStatusBadge = (estado: Task["estado"]) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", variant: "secondary" as const },
      "en-progreso": { label: "En Progreso", variant: "default" as const },
      completada: { label: "Completada", variant: "outline" as const },
    }

    const config = statusConfig[estado]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
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
            <Button onClick={() => router.push("/dashboard/nueva-tarea")}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
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
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.titulo}</TableCell>
                      <TableCell className="max-w-xs truncate">{task.descripcion}</TableCell>
                      <TableCell>{new Date(task.fechaCreacion).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(task.estado)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.usuariosAsignados.map((usuario, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {usuario}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/editar-tarea/${task.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
