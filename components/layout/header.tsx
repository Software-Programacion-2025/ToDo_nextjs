"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/auth"
import { ArrowLeft, LogOut, User } from "lucide-react"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  backUrl?: string
}

export function Header({ title, showBackButton = false, backUrl = "/dashboard" }: HeaderProps) {
  const router = useRouter()
  const username = AuthService.getUsername()

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {username}
            </div>
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
