"use client"

import {
  Home,
  MessageSquare,
  Bell,
  Heart,
  User,
  Settings,
  Menu,
  X,
  Package,
  CarFront,
  Hotel,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Sidebar({ active }) {

    const pathname = usePathname()
    console.log(pathname);
    
  const [isOpen, setIsOpen] = useState(false)

  const items = [
    { icon: <Home size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <MessageSquare size={18} />, label: "Agents", path: "/agents" },
    { icon: <Bell size={18} />, label: "bookings", path: "/bookings" },
    { icon: <Heart size={18} />, label: "Users", path: "/users" },
    { icon: <User size={18} />, label: "Notifications", path: "/notifications" },
    { icon: <Package size={18} />, label: "Packages", path: "/packages" },
    { icon: <CarFront size={18} />, label: "Vehicles", path: "/vehicles" },
    { icon: <Hotel size={18} />, label: "Hotels", path: "/hotels" },
    { icon: <DollarSign size={18} />, label: "Pricing", path: "/pricing" },
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-white bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
<aside
  className={`
    bg-white
    h-screen
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0 fixed inset-y-0 left-0 z-40 w-64" : "-translate-x-full fixed inset-y-0 left-0 z-40 w-64"}
    lg:translate-x-0 lg:static lg:w-64
  `}
>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <img src="/images/logo.jpg" alt="" className="h-18   object-contain"/>
                    </div>            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              {/* <X size={20} /> */}
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-4 space-y-2">
            {items.map((item) => (
              <Link key={item.label} href={item.path} onClick={() => setIsOpen(false)}>
                <div
                  className={`flex items-center px-3 py-5 rounded-md text-sm cursor-pointer transition-colors ${
                    pathname === item.path
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
