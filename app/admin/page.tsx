"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { PermissionsGuard, usePermissions } from "@/components/permissions-guard"
import { Header } from "@/components/layout/header"
import { AuthService } from "@/lib/auth"
import { TaskService } from "@/lib/tasks"
import { Settings, Users, Shield, BarChart3 } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
  })

  const permissions = usePermissions()
  const userProfile = AuthService.getUserProfile()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasks = await TaskService.getAllTasks()
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.state === "completed").length,
          pendingTasks: tasks.filter(t => t.state === "pending").length,
          inProgressTasks: tasks.filter(t => t.state === "in-progress").length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

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
          <Header title="Panel de Administración" />

          <main className="container mx-auto px-4 py-8">
            {/* User Info Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Información del Administrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userProfile?.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Roles</p>
                    <div className="flex gap-2 mt-1">
                      {userProfile?.roles.map((role, index) => (
                        <Badge key={index} variant="default">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Tareas</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Sistema completo
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pendientes</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.pendingTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}% del total
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>En Progreso</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.inProgressTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0}% del total
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completadas</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.completedTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% del total
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription>
                    Administrar usuarios del sistema, roles y permisos desde una tabla centralizada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Button 
                      className="w-full max-w-md"
                      onClick={() => router.push('/admin/users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ir a Gestión de Usuarios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions Summary */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Resumen de Permisos</CardTitle>
                <CardDescription>
                  Permisos actuales del usuario administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={permissions.canCreate() ? "default" : "secondary"}>
                      {permissions.canCreate() ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">Crear tareas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={permissions.canUpdate() ? "default" : "secondary"}>
                      {permissions.canUpdate() ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">Actualizar tareas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={permissions.canDelete() ? "default" : "secondary"}>
                      {permissions.canDelete() ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">Eliminar tareas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={permissions.canAssign() ? "default" : "secondary"}>
                      {permissions.canAssign() ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm">Asignar usuarios</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </PermissionsGuard>
    </AuthGuard>
  )
}