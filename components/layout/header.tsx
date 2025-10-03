"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { ArrowLeft, LogOut, User, Shield, Settings, LayoutDashboard } from "lucide-react"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  backUrl?: string
}

export function Header({ title, showBackButton = false, backUrl = "/dashboard" }: HeaderProps) {
  const router = useRouter()
  const username = AuthService.getUsername()
  const userRoles = AuthService.getUserRoles()

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  const handleBack = () => {
    router.push(backUrl)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            )}
            {!showBackButton && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm" />
              </div>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {username}
              </div>
              
              {userRoles.length > 0 && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {userRoles.map((role, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            {AuthService.hasRole('Administrador') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/admin')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
