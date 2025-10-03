"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/layout/header"
import { TaskService } from "@/lib/tasks"
import { AuthService } from "@/lib/auth"
import { Toast, useToast } from "@/components/ui/toast-custom"
import { UserSelector } from "@/components/ui/user-selector"

interface TaskForm {
  titulo: string
  descripcion: string
  estado: "pendiente" | "en-progreso" | "completada"
  usuariosAsignados: string[] // IDs de usuarios seleccionados
}

export default function NuevaTareaPage() {
  const [formData, setFormData] = useState<TaskForm>({
    titulo: "",
    descripcion: "",
    estado: "pendiente",
    usuariosAsignados: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const username = AuthService.getUsername()
  const { toast, showToast, hideToast } = useToast()

  const handleInputChange = (field: keyof TaskForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUsersChange = (selectedUserIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      usuariosAsignados: selectedUserIds,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userId = AuthService.getUserId()
      if (!userId) {
        throw new Error("Usuario no autenticado")
      }

      // Crear la tarea
      const newTask = await TaskService.createTask({
        title: formData.titulo,
        description: formData.descripcion,
        state: formData.estado === "pendiente" ? "pending" : 
               formData.estado === "en-progreso" ? "in-progress" : "completed",
        user_id: userId,
      })

      // Asignar usuarios seleccionados a la tarea
      if (formData.usuariosAsignados.length > 0) {
        for (const assignedUserId of formData.usuariosAsignados) {
          try {
            await TaskService.assignUserToTask(newTask.id, assignedUserId)
          } catch (assignError) {
            console.warn(`Error asignando usuario ${assignedUserId}:`, assignError)
            // Continuar con los demás usuarios aunque uno falle
          }
        }
      }
      
      showToast("Tarea creada y usuarios asignados exitosamente", "success")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      console.error('Error creating task:', err)
      showToast(err instanceof Error ? err.message : "Error al crear la tarea", "error")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header title="Nueva Tarea" showBackButton />

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Tarea</CardTitle>
              <CardDescription>Completa los campos para crear una nueva tarea en el sistema</CardDescription>
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
                  <UserSelector
                    selectedUsers={formData.usuariosAsignados}
                    onUsersChange={handleUsersChange}
                    placeholder="Buscar y seleccionar usuarios..."
                  />
                </div>

                {/* Información adicional */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Fecha de creación:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Creado por:</strong> {username}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Guardando..." : "Crear Tarea"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </AuthGuard>
  )
}
