"use client"

import React, { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AuthService } from "@/lib/auth"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface UserSelectorProps {
  selectedUsers: string[]
  onUsersChange: (users: string[]) => void
  placeholder?: string
}

export function UserSelector({ selectedUsers, onUsersChange, placeholder = "Seleccionar usuarios..." }: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cargar usuarios disponibles
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const users = await AuthService.getAllUsers()
        setAvailableUsers(users)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar usuarios"
        setError(errorMessage)
        console.error("Error loading users:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = availableUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const email = user.email.toLowerCase()
    const search = searchTerm.toLowerCase()
    
    return fullName.includes(search) || email.includes(search)
  })

  // Obtener usuarios seleccionados con información completa
  const selectedUserProfiles = availableUsers.filter(user => 
    selectedUsers.includes(user.id)
  )

  const handleUserToggle = (userId: string) => {
    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId]
    
    onUsersChange(newSelectedUsers)
  }

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(id => id !== userId))
  }

  const getUserDisplayName = (user: UserProfile) => {
    return `${user.firstName} ${user.lastName}`
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selector principal */}
      <div className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
        {/* Usuarios seleccionados */}
        {selectedUserProfiles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedUserProfiles.map((user) => (
              <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {getUserDisplayName(user)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveUser(user.id)
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Input de búsqueda */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={selectedUserProfiles.length === 0 ? placeholder : "Buscar más usuarios..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 h-auto"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Dropdown con lista de usuarios */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto shadow-lg border">
          <div className="p-1">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Cargando usuarios...
              </div>
            ) : error ? (
              <div className="text-center text-sm text-destructive py-4">
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                {searchTerm ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/80 transition-colors ${
                        isSelected ? "bg-accent border border-primary/20" : ""
                      }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        {isSelected && <Check className="w-4 h-4 text-primary font-bold" />}
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                        
                        {user.roles.length > 0 && (
                          <div className="flex gap-1 flex-shrink-0">
                            {user.roles.slice(0, 1).map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs px-2 py-0.5">
                                {role}
                              </Badge>
                            ))}
                            {user.roles.length > 1 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                +{user.roles.length - 1}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}