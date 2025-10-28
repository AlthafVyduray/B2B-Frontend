"use client"

import Link from "next/link";
import { useEffect } from "react";
import useAdminStore from "@/stores/useAdminStore";
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  User,
  CalendarDays
} from "lucide-react"
import Header from "@/app/components/admin/Hearder";


export default function Dashboard() {

  const { counts, getCounts, loadCounts, getBookings, bookings } = useAdminStore();

  useEffect(() => {
    getCounts();
    getBookings()
    
  }, [getCounts]);

  const stats = [
    {
      title: "Total Bookings",
      value: counts.Bookings,
      icon: <CalendarDays className="text-blue-500 w-7 h-7" />,
      bg: "bg-blue-100",
    },
    {
      title: "Total Agents",
      value: counts.Agents,
      icon: <User className="text-purple-500 w-7 h-7" />,
      bg: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: `₹ ${counts.Revenue}`,
      icon: <DollarSign className="text-green-500 w-7 h-7" />,
      bg: "bg-green-100",
    },
  ];

  const recentBookings = bookings.slice(0,6);
  

  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      {/* Sidebar - keeping unchanged as requested */}
      {/* <Sidebar active="Destinations" /> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <Header />

        {/* Dashboard Content */}
        <main className="lg:p-6 space-y-6 bg-gray-50">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              stats.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
                  {item.icon}
                  <div>
                    <h3 className="text-gray-500 text-sm">{item.title}</h3>
                    <p className="text-2xl font-bold text-black">{item.value}</p>
                  </div>
                </div>
              ))
            }
          </div>


            {/* Recent Bookings */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">Recent Bookings</h3>
                <Link  href="/bookings" className="text-blue-600 text-sm hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-500 border-b text-sm">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Package</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Booking Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-black font-medium">{booking.contact?.email}</td>
                        <td className="p-3 text-gray-600">{booking.package_name}</td>
                        <td className="p-3 text-black font-semibold">{booking.pricing?.total_amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3 text-black font-semibold"><Badge className={`${booking.source === "booking" ? "bg-blue-300" : "bg-red-300"}`}>{booking.source === "booking" ? "Normal Package" : "Default Package"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>





        </main>
      </main>
    </div>
  )
}
