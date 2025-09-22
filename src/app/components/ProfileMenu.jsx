"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, Home, LogOut, X, BellRing } from "lucide-react"
import useAuthStore from "@/stores/useAuthStore"

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const { logout, user } = useAuthStore()

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  console.log(user)
  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        <User size={28} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-start">
            <div>
              <p className="font-bold text-md text-gray-800">{user?.role}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu Items */}
          <ul className="py-1">
            <li>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-gray-700"
              >
                <Home size={18} className="text-gray-500" />
                <p className="font-bold">Home</p>
              </Link>
            </li>

            {user?.role === "Agent" && (
              <li>
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2 font-bold hover:bg-gray-100"
                >
                  <BellRing size={18} />
                  Notifications
                </Link>
              </li>
            )}

            <li>
              <button
                className="w-full px-4 py-2 flex items-center gap-2 text-red-500 hover:bg-gray-100"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                <LogOut size={18} />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
