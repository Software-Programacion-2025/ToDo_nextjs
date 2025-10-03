'use client'

import React, { useState, useEffect } from 'react'
import { AdminUser, AdminService } from '../../../lib/admin'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { RefreshCw, Shield, Users, UserPlus, Edit3, Trash2, RotateCcw } from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import { AuthGuard } from '../../../components/auth-guard'
import { PermissionsGuard } from '../../../components/permissions-guard'
import { Header } from '../../../components/layout/header'

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [deletedUsers, setDeletedUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emails: '',
    ages: '',
    password: ''
  })
  
  const { toast } = useToast()
  const availableRoles = ['Administrador', 'Gerente', 'Empleado', 'Cajero']

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [activeUsers, removedUsers] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getDeletedUsers()
      ])
      setUsers(activeUsers)
      setDeletedUsers(removedUsers)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos de usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.emails.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditRoles = (user: AdminUser) => {
    setSelectedUser(user)
    setUserRole(user.roles.length > 0 ? user.roles[0] : '')
    setShowRoleDialog(true)
  }

  // Función para crear nuevo usuario
  const handleCreateUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      emails: '',
      ages: '',
      password: ''
    })
    setShowCreateDialog(true)
  }

  // Función para editar usuario existente
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      emails: user.emails,
      ages: user.ages.toString(),
      password: ''
    })
    setShowEditDialog(true)
  }

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      await AdminService.deleteUser(userId)
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
      loadAllData()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  // Función para restaurar usuario eliminado
  const handleRestoreUser = async (userId: string) => {
    try {
      await AdminService.restoreUser(userId)
      toast({
        title: "Usuario restaurado",
        description: "El usuario ha sido restaurado exitosamente",
      })
      loadAllData()
    } catch (error) {
      console.error('Error restoring user:', error)
      toast({
        title: "Error",
        description: "Error al restaurar el usuario",
        variant: "destructive",
      })
    }
  }

  // Función para guardar usuario (crear o editar)
  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.emails || !formData.ages) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      })
      return
    }

    if (showCreateDialog && !formData.password) {
      toast({
        title: "Error",
        description: "La contraseña es obligatoria para nuevos usuarios",
        variant: "destructive"
      })
      return
    }

    try {
      if (showCreateDialog) {
        await AdminService.createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emails: formData.emails,
          ages: parseInt(formData.ages),
          password: formData.password
        })
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente",
        })
      } else if (selectedUser) {
        await AdminService.updateUser(selectedUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          emails: formData.emails,
          ages: parseInt(formData.ages)
        })
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado exitosamente",
        })
      }

      setShowCreateDialog(false)
      setShowEditDialog(false)
      loadAllData()
    } catch (error) {
      console.error('Error saving user:', error)
      toast({
        title: "Error",
        description: "Error al guardar el usuario",
        variant: "destructive",
      })
    }
  }

  // Guardar cambios de rol (UN SOLO ROL POR USUARIO)
  const handleSaveRoles = async () => {
    if (!selectedUser) return

    try {
      const currentRole = selectedUser.roles.length > 0 ? selectedUser.roles[0] : ''
      
      if (currentRole === userRole) {
        toast({
          title: "Sin cambios",
          description: "No se detectaron cambios en el rol",
        })
        setShowRoleDialog(false)
        return
      }

      if (!userRole) {
        toast({
          title: "Error",
          description: "Debe seleccionar un rol",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Procesando...",
        description: "Actualizando rol del usuario",
      })

      // Asignar el nuevo rol (la lógica del backend se encarga de remover el anterior)
      const updatedUser = await AdminService.assignRole(selectedUser.id, userRole)

      toast({
        title: "Rol actualizado",
        description: `Se asignó el rol "${userRole}" a ${selectedUser.firstName} ${selectedUser.lastName}`,
      })

      // Actualizar el usuario local con la respuesta del servidor
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      )
      setUsers(updatedUsers)

      setUserRole('')
      setShowRoleDialog(false)
    } catch (error) {
      console.error('Error updating roles:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar roles",
        variant: "destructive",
      })
    }
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
          <Header title="Gestión de Usuarios" showBackButton backUrl="/admin" />
          
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Administrar Usuarios</h2>
                  <p className="text-muted-foreground">
                    Gestiona usuarios del sistema, roles y permisos desde una tabla centralizada
                  </p>
                </div>
                <Button onClick={handleCreateUser} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Agregar Usuario
                </Button>
              </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Usuarios Activos ({users.length})</TabsTrigger>
          <TabsTrigger value="deleted">Usuarios Eliminados ({deletedUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Tabla de usuarios activos */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Activos</CardTitle>
              <CardDescription>
                Lista de todos los usuarios activos en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.emails}</TableCell>
                      <TableCell>{user.ages}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            <Badge variant="secondary">
                              {user.roles[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sin rol</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuario"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoles(user)}
                            title="Gestionar rol"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Eliminar usuario"
                            className="hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Eliminados</CardTitle>
              <CardDescription>
                Lista de usuarios que han sido eliminados del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.emails}</TableCell>
                      <TableCell>{user.ages}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            <Badge variant="secondary">
                              {user.roles[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sin rol</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreUser(user.id)}
                          title="Restaurar usuario"
                          className="hover:bg-green-100 hover:text-green-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para gestionar roles */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Rol</DialogTitle>
            <DialogDescription>
              Selecciona el rol para {selectedUser?.firstName} {selectedUser?.lastName}
              <br />
              <span className="text-xs text-muted-foreground">
                Cada usuario puede tener solo un rol a la vez
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-sm font-medium">Rol actual:</Label>
              <div className="flex gap-2 mt-2 min-h-[32px] p-2 border rounded-md">
                {userRole ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    {userRole}
                    <button
                      onClick={() => setUserRole('')}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No hay rol seleccionado</span>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Roles disponibles:</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Haz click para seleccionar un rol
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((role) => {
                  const isSelected = userRole === role
                  const roleIcons: Record<string, any> = {
                    'Administrador': Shield,
                    'Gerente': Users,
                    'Empleado': Users,
                    'Cajero': Users
                  }
                  const RoleIcon = roleIcons[role] || Users
                  
                  return (
                    <Button
                      key={role}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUserRole(userRole === role ? '' : role)}
                      className={`justify-start ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      <RoleIcon className="h-4 w-4 mr-2" />
                      {role}
                      {isSelected && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Información de permisos */}
            <div className="bg-muted p-3 rounded-md">
              <Label className="text-sm font-medium">Permisos por rol:</Label>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <div><strong>Administrador:</strong> Todos los permisos del sistema</div>
                <div><strong>Gerente:</strong> Crear, leer, actualizar, asignar tareas</div>
                <div><strong>Empleado:</strong> Leer, actualizar, crear tareas</div>
                <div><strong>Cajero:</strong> Leer, actualizar tareas asignadas</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRoleDialog(false)
              setUserRole('')
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRoles}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear usuario */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa todos los campos para crear un nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.emails}
                onChange={(e) => setFormData({...formData, emails: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={formData.ages}
                onChange={(e) => setFormData({...formData, ages: e.target.value})}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Contraseña segura"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">Nombre</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Apellido</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.emails}
                onChange={(e) => setFormData({...formData, emails: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="editAge">Edad</Label>
              <Input
                id="editAge"
                type="number"
                value={formData.ages}
                onChange={(e) => setFormData({...formData, ages: e.target.value})}
                placeholder="25"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Nota: Deja la contraseña en blanco para mantener la actual
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Actualizar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </div>
          </main>
        </div>
      </PermissionsGuard>
    </AuthGuard>
  )
}
