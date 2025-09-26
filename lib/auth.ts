export const AuthService = {
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isAuthenticated") === "true"
  },

  getUsername: (): string => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("username") || ""
  },

  login: (username: string): void => {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("username", username)
  },

  logout: (): void => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
  },
}
