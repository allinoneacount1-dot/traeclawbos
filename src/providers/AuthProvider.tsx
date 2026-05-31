"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

interface AuthContextType {
  isAuthenticated: boolean
  user: { id: string } | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage } = useWallet()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      if (token && storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (publicKey) {
      const login = async () => {
        try {
          // Create a nonce and message to sign
          const nonce = Date.now().toString()
          const message = `Sign in to TRAECLAWB OS: ${nonce}`
          const encodedMessage = new TextEncoder().encode(message)

          if (signMessage) {
            const signature = await signMessage(encodedMessage)

            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                signature: Array.from(signature),
                message,
              }),
            })

            if (response.ok) {
              const { token, user } = await response.json()
              localStorage.setItem("token", token)
              localStorage.setItem("user", JSON.stringify(user))
              setUser(user)
              setIsAuthenticated(true)
            }
          }
        } catch (error) {
          console.error("Login failed:", error)
        }
      }
      login()
    } else {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [publicKey, signMessage])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
