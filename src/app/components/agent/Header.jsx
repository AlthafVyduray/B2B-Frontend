"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import useAuthStore from "@/stores/useAuthStore"

const Header = () => {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

  // Nav items
  const navItems = [
    { href: "/booking", label: "New Booking", role: "Agent" },
    { href: "/my-bookings", label: "My Bookings", role: "Agent" },
    { href: "/notification", label: "Notifications", role: "Agent" },
    { href: "/edit-profile", label: "Edit Profile", role: "Agent" },
  ]

  const handleLogout = () => {
    logout()
    setConfirmLogoutOpen(false)
    setNavOpen(false)
  }

  return (
    <header className="flex items-center justify-between bg-background shadow lg:px-6 px-3 py-3">
      {/* Logo */}
      <div className="text-xl font-bold text-gray-800">
        <img src="/images/logo.jpg" alt="Logo" className="h-18 object-contain" />
      </div>

      {/* Nav links for large screens */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map(
          (item) =>
            (!item.role || user?.role === item.role) && (
              <Link
                key={item.href}
                href={item.href}
                className={`font-semibold transition-colors ${
                  pathname === item.href
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            )
        )}

        {/* Logout button */}
        {user && (
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-semibold transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        )}
      </nav>

      {/* Hamburger for small screens */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        onClick={() => setNavOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Mobile sidebar menu */}
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-800">Menu</span>
              <button
                onClick={() => setNavOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <ul className="space-y-4 flex-1">
              {navItems.map(
                (item) =>
                  (!item.role || user?.role === item.role) && (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setNavOpen(false)}
                        className={`block px-2 py-2 rounded-lg font-medium transition-colors ${
                          pathname === item.href
                            ? "bg-gray-100 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
              )}

              {/* Logout as nav item */}
              {user && (
                <li>
                  <button
                    onClick={() => setConfirmLogoutOpen(true)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors w-full"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
