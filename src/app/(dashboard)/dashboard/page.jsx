"use client"

import Link from "next/link";
import { useEffect } from "react";
import useAdminStore from "@/stores/useAdminStore";
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  DollarSign,
  Search,
  UserCheck,
  Users,
  MapPin,
  Plane,
  Star,
  AlertCircle,
  Package,
  Globe,
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

  const recentBookings = bookings.slice(0,4);
  
  // const recentBookings = [
  //   {
  //     id: 1,
  //     customer: "Alice Johnson",
  //     destination: "Paris, France",
  //     package: "Romantic Getaway",
  //     amount: "$2,450",
  //     status: "Confirmed",
  //   },
  //   {
  //     id: 2,
  //     customer: "Bob Smith",
  //     destination: "Tokyo, Japan",
  //     package: "Cultural Tour",
  //     amount: "$3,200",
  //     status: "Pending",
  //   },
  //   {
  //     id: 3,
  //     customer: "Carol Davis",
  //     destination: "Bali, Indonesia",
  //     package: "Beach Resort",
  //     amount: "$1,800",
  //     status: "Confirmed",
  //   },
  //   {
  //     id: 4,
  //     customer: "David Wilson",
  //     destination: "New York, USA",
  //     package: "City Break",
  //     amount: "$1,950",
  //     status: "Cancelled",
  //   },
  // ]
  

  // const travelPackages = [
  //   { name: "Romantic Getaway", bookings: 89, price: "$2,450", rating: 4.8 },
  //   { name: "Adventure Trek", bookings: 76, price: "$1,890", rating: 4.6 },
  //   { name: "Cultural Tour", bookings: 65, price: "$3,200", rating: 4.9 },
  //   { name: "Beach Resort", bookings: 54, price: "$1,800", rating: 4.7 },
  // ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - keeping unchanged as requested */}
      {/* <Sidebar active="Destinations" /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:mt-0 mt-10">
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
            {/* <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <ClipboardList className="text-blue-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Total Bookings</h3>
                <p className="text-2xl font-bold text-black">1,245</p>
                <span className="text-green-500 text-xs">+12% this month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <Users className="text-green-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Active Customers</h3>
                <p className="text-2xl font-bold text-black">3,580</p>
                <span className="text-green-500 text-xs">+8% this month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <MapPin className="text-purple-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Destinations</h3>
                <p className="text-2xl font-bold text-black">156</p>
                <span className="text-blue-500 text-xs">5 new added</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <DollarSign className="text-emerald-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Monthly Revenue</h3>
                <p className="text-2xl font-bold text-black">$387,450</p>
                <span className="text-green-500 text-xs">+15% vs last month</span>
              </div>
            </div>
          </div>

          {/* Travel Agency Specific Metrics */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <Package className="text-orange-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Travel Packages</h3>
                <p className="text-2xl font-bold text-black">48</p>
                <span className="text-blue-500 text-xs">3 seasonal added</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <UserCheck className="text-indigo-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Travel Agents</h3>
                <p className="text-2xl font-bold text-black">128</p>
                <span className="text-green-500 text-xs">5 verified today</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <Star className="text-yellow-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Avg Rating</h3>
                <p className="text-2xl font-bold text-black">4.8</p>
                <span className="text-green-500 text-xs">+0.2 this month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
              <AlertCircle className="text-red-600" size={28} />
              <div>
                <h3 className="text-gray-500 text-sm">Pending Issues</h3>
                <p className="text-2xl font-bold text-black">7</p>
                <span className="text-red-500 text-xs">2 urgent</span>
              </div>
            </div>*/}
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
      </div>
    </div>
  )
}
