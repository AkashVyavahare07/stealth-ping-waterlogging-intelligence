"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  userRole: "citizen" | "admin" | null
  signIn: (email: string, password: string) => Promise<UserCredential>
  signUp: (email: string, password: string) => Promise<UserCredential>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function determineUserRole(email: string | null): "citizen" | "admin" | null {
  if (!email) return null
  // Admin emails: contain 'admin' OR end with '.gov.in' OR specific admin emails
  const adminPatterns = ["admin", ".gov.in", "administrator", "delhiflood"]
  const lowerEmail = email.toLowerCase()

  if (adminPatterns.some((pattern) => lowerEmail.includes(pattern))) {
    return "admin"
  }
  return "citizen"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<"citizen" | "admin" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setUserRole(determineUserRole(user?.email || null))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    setUserRole(determineUserRole(email))
    return result
  }

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    setUserRole(determineUserRole(email))
    return result
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserRole(null)
  }

  const getIdToken = async () => {
    if (!user) return null
    return await user.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, loading, userRole, signIn, signUp, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
