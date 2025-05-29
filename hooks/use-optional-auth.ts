"use client"

import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-context"

export function useOptionalAuth() {
  const context = useContext(AuthContext)
  return context
}
