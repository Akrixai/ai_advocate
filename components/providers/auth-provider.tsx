"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  userType: "lawyer" | "admin"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        // Validate token format
        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
          throw new Error("Invalid token format")
        }
        
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Set the authorization header for all future fetch requests
        if (!window.originalFetch) {
          window.originalFetch = window.fetch
        }
        window.fetch = async (input, init) => {
          const headers = init?.headers || {}
          const newInit = {
            ...init,
            headers: {
              ...headers,
              Authorization: `Bearer ${token}`,
            },
          }
          return window.originalFetch(input, newInit)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    // Validate token format before storing
    if (!token || !token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
      console.error("Invalid token format")
      throw new Error("Invalid token format")
    }
    
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    
    // Set the authorization header for all future fetch requests
    if (!window.originalFetch) {
      window.originalFetch = window.fetch
    }
    window.fetch = async (input, init) => {
      const headers = init?.headers || {}
      const newInit = {
        ...init,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      }
      return window.originalFetch(input, newInit)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    
    // Reset the fetch function to its original state
    if (window.originalFetch) {
      window.fetch = window.originalFetch
      delete window.originalFetch
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
