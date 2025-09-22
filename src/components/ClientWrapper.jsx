// components/ClientWrapper.jsx
"use client"
import React from "react"
import AuthGuard from "./AuthGuard" // the AuthGuard we provided earlier

export default function ClientWrapper({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
