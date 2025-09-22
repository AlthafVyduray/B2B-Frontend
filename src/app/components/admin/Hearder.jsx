"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, Home, LogOut, X, BellRing, CalendarDays, Edit3 } from "lucide-react"
import useAuthStore from "@/stores/useAuthStore"

const Header = () => {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="flex items-center justify-between bg-white shadow lg:px-6 px-3 py-3">
      {/* Left side */}
      {user?.role === "Admin" ? (
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-700">Dashboard</h2>
        </div>
      ) : (
        <span></span>
      )}

      {/* Right side */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <span className="hidden sm:block">{user?.email}</span>
        <img
          src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
          alt="profile"
          className="w-10 h-10 rounded-full border cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
        />

        {open && (
          <div className="absolute right-0 top-10 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header of dropdown */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                {user.role === "Agent" ? (
                  <p className="font-bold text-md text-gray-800">{user?.fullName}</p>
                ) : (
                    <p className="font-bold text-md text-gray-800">{user?.role}</p>
                )}
                
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
                  href="/"
                  onClick={() => setOpen(false)}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-gray-700"
                >
                  <Home size={18} className="text-gray-500" />
                  <p className="font-bold">Home</p>
                </Link>
              </li>

              {user?.role === "Agent" && (
                <>
                  <li>
                    <Link
                      href="/notification"
                      onClick={() => setOpen(false)}
                      className="w-full px-4 py-2 flex items-center gap-2 font-bold hover:bg-gray-100"
                    >
                      <BellRing size={18} />
                      Notifications
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/booking"
                      onClick={() => setOpen(false)}
                      className="w-full px-4 py-2 flex items-center gap-2 font-bold hover:bg-gray-100"
                    >
                      <CalendarDays size={18} />
                      Bookings
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/edit-profile"
                      onClick={() => setOpen(false)}
                      className="w-full px-4 py-2 flex items-center gap-2 font-bold hover:bg-gray-100"
                    >
                      <Edit3 size={18} />
                      Edit Profile
                    </Link>
                  </li>
                </>
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
    </header>
  )
}

export default Header
