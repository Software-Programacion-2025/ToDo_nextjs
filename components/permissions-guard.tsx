"use client"

import { ReactNode } from 'react'
import { AuthService } from '@/lib/auth'

interface PermissionsGuardProps {
  children: ReactNode
  requiredPermission?: string
  requiredRole?: string
  fallback?: ReactNode
}

export function PermissionsGuard({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null 
}: PermissionsGuardProps) {
  // Verificar permisos
  if (requiredPermission && !AuthService.hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  // Verificar roles
  if (requiredRole && !AuthService.hasRole(requiredRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook personalizado para verificar permisos en componentes
export function usePermissions() {
  return {
    hasPermission: AuthService.hasPermission,
    hasRole: AuthService.hasRole,
    getUserRoles: AuthService.getUserRoles,
    canCreate: () => AuthService.hasPermission('create'),
    canUpdate: () => AuthService.hasPermission('update'),
    canDelete: () => AuthService.hasPermission('delete'),
    canAssign: () => AuthService.hasPermission('assign'),
    canManage: () => AuthService.hasPermission('manage'),
    // Roles del backend
    isAdmin: () => AuthService.hasRole('Administrador'),
    isManager: () => AuthService.hasRole('Gerente'),
    isEmployee: () => AuthService.hasRole('Empleado'),
    isCashier: () => AuthService.hasRole('Cajero'),
  }
}