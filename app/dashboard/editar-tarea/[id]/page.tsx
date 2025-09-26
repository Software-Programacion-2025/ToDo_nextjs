"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, AlertCircle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/layout/header"
import { TaskService, type Task } from "@/lib/tasks"
import { AuthService } from "@/lib/auth"

interface TaskForm {
  titulo: string
  descripcion: string
  estado: "pendiente" | "en-progreso" | "completada"
  usuariosAsignados: string[]
}

export default function EditarTareaPage() {
  const [formData, setFormData] = useState<TaskForm>({
    titulo: "",
    descripcion: "",
    estado: "pendiente",
    usuariosAsignados: [],
  })
  const [originalTask, setOriginalTask] = useState<Task | null>(null)
  const [newUser, setNewUser] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [taskNotFound, setTaskNotFound] = useState(false)
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const username = AuthService.getUsername()

  useEffect(() => {
    const task = TaskService.getTaskById(taskId)

    if (task) {
      setOriginalTask(task)
      setFormData({
        titulo: task.titulo,
        descripcion: task.descripcion,
        estado: task.estado,
        usuariosAsignados: [...task.usuariosAsignados],
      })
    } else {
      setTaskNotFound(true)
    }
  }, [taskId])

  const handleInputChange = (field: keyof TaskForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddUser = () => {
    if (newUser.trim() && !formData.usuariosAsignados.includes(newUser.trim())) {
      setFormData((prev) => ({
        ...prev,
        usuariosAsignados: [...prev.usuariosAsignados, newUser.trim()],
      }))
      setNewUser("")
    }
  }

  const handleRemoveUser = (userToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      usuariosAsignados: prev.usuariosAsignados.filter((user) => user !== userToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulación de guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    TaskService.updateTask(taskId, formData)

    setIsLoading(false)
    router.push("/dashboard")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUser()
    }
  }

  if (taskNotFound) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header title="Tarea no encontrada" showBackButton />

          <main className="container mx-auto px-4 py-8 max-w-2xl">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La tarea que intentas editar no existe o ha sido eliminada. Regresa al dashboard para ver las tareas
                disponibles.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (!originalTask) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando tarea...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header title="Editar Tarea" showBackButton />

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Editar Tarea</CardTitle>
              <CardDescription>Modifica los campos de la tarea seleccionada</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    type="text"
                    placeholder="Ingresa el título de la tarea"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe detalladamente la tarea"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en-progreso">En Progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Usuarios Asignados */}
                <div className="space-y-2">
                  <Label>Usuarios Asignados</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nombre del usuario"
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={handleAddUser}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lista de usuarios asignados */}
                  {formData.usuariosAsignados.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.usuariosAsignados.map((user, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {user}
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(user)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información de la tarea */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>ID de la tarea:</strong> {originalTask.id}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Fecha de creación:</strong> {new Date(originalTask.fechaCreacion).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Última modificación:</strong> {new Date().toLocaleDateString()} por {username}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Guardando cambios..." : "Guardar Cambios"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
