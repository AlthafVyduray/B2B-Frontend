"use client"

import { Bell, CheckCircle, AlertTriangle, Settings, Calendar, User, Filter, EyeIcon, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useBookingStore from "@/stores/useBookingStore"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "../components/admin/Hearder"

export default function NotificationPage() {

  const [selection, setSelection] = useState("notification")
  const { notifications, getAdminNotifications, bookings, getBookings } = useBookingStore()

  useEffect(() => {
    getAdminNotifications()
    getBookings()
  }, [getAdminNotifications, getBookings])

  const getTypeIcon = (type) => {
    switch (type) {
      case "booking":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "system":
        return <Settings className="h-5 w-5 text-blue-500" />
      default:
        return <Settings className="h-5 w-5 text-blue-500" />
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Generate a plain-text PDF using jsPDF (no DOM/CSS rendering)
  const generatePdf = async (booking) => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const maxWidth = pageWidth - margin * 2
      const lineHeight = 7

      let y = margin

      const addWrappedText = (text, x = margin, startY = y, fontSize = 10, style = "normal") => {
        doc.setFontSize(fontSize)
        if (style === "bold") doc.setFont(undefined, "bold")
        else doc.setFont(undefined, "normal")

        const lines = doc.splitTextToSize(String(text), maxWidth)
        for (const line of lines) {
          if (startY + lineHeight > pageHeight - margin) {
            doc.addPage()
            startY = margin
          }
          doc.text(line, x, startY)
          startY += lineHeight
        }
        y = startY
        return y
      }

      const addKV = (key, value) => {
        addWrappedText(`${key}: ${value ?? "-"}`, margin, y, 10)
      }

      // Header
      addWrappedText("Booking Details", margin, y, 14, "bold")
      y += 4
      addKV("Booking ID", booking._id)
      addKV("Created", formatTimestamp(booking.createdAt))
      y += 4

      // Package
      addWrappedText("Package", margin, y, 12, "bold")
      y += 6
      if (booking.package_id) {
        addKV("Name", booking.package_name)
        addWrappedText(`Pickup: Date: ${booking.dates?.pickup_date ?? "-"}, Time: ${booking.dates?.pickup_time ?? "-"}, Location: ${booking.dates?.pickup_location ?? "-"}`, margin, y)
        y += 4
        addWrappedText(`Drop: Date: ${booking.dates?.drop_date ?? "-"}, Time: ${booking.dates?.drop_time ?? "-"}, Location: ${booking.dates?.drop_location ?? "-"}`, margin, y)
      } else {
        addWrappedText("No package selected", margin, y)
      }
      y += 8

      // Travelers
      addWrappedText("Travelers", margin, y, 12, "bold")
      y += 6
      addKV("Adults", booking.guests?.adults_total ?? 0)
      addKV("Children", booking.guests?.children ?? 0)
      addKV("Infants", booking.guests?.infants ?? 0)
      y += 8

      // Hotel
      addWrappedText("Hotel", margin, y, 12, "bold")
      y += 6
      if (booking.hotel_id) {
        addKV("Name", booking.hotel?.hotel_name)
        addKV("Rooms", booking.hotel?.rooms)
        addKV("Extra Beds", booking.hotel?.extra_beds ?? 0)
        addKV("Food Plan", booking.hotel?.food_plan ?? "—")
      } else {
        addWrappedText("No hotel selected", margin, y)
      }
      y += 8

      // Vehicle
      addWrappedText("Vehicle", margin, y, 12, "bold")
      y += 6
      if (booking.vehicle_id) {
        addKV("Vehicle", booking.vehicle_name ?? "—")
      } else {
        addWrappedText("No vehicle selected", margin, y)
      }
      y += 8

      // Extras
      addWrappedText("Extras", margin, y, 12, "bold")
      y += 6
      const foods = [booking.extras?.breakfast ? "Breakfast" : null, booking.extras?.lunchNonVeg ? "Lunch (Non-Veg)" : null, booking.extras?.lunchVeg ? "Lunch (Veg)" : null].filter(Boolean).join(", ") || "None"
      addKV("Extra Food", foods)
      addKV("Guide Needed", booking.extras?.guideNeeded ? "Yes" : "No")
      addKV("Entry Ticket", booking.extras?.entry_ticket_needed ? "Yes" : "No")
      addKV("Snow World Ticket", booking.extras?.snow_world_needed ? "Yes" : "No")
      y += 8

      // Summary
      addWrappedText("Summary", margin, y, 12, "bold")
      y += 6
      addKV("Package Amount", booking.pricing?.base_total
        ? `Rs. ${Number(booking.pricing.base_total).toLocaleString("en-IN")}`
        : "—"
      )

      addKV("Agent Commission", booking.pricing?.agent_commission
        ? `Rs. ${Number(booking.pricing.agent_commission).toLocaleString("en-IN")}`
        : "—"
      )

      addKV("Total Amount", booking.pricing?.total_amount
        ? `Rs. ${Number(booking.pricing.total_amount).toLocaleString("en-IN")}`
        : "—"
      )

      y += 10

      // Footer support
      addWrappedText("Support: support@example.com | +91 12345 67890", margin, y, 9)
      y += 6
      addWrappedText(`Generated: ${formatTimestamp(new Date().toISOString())}`, margin, y, 9)

      doc.save(`booking_${booking._id}.pdf`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PDF generation failed:", err)
      alert("Could not generate PDF. See console for details.")
    }
  }

  return (

    <div className="min-h-screen bg-gray-50 p-4">
      <Header />
      <div className="bg-white shadow-sm py-8 px-6">
        {/* Toggle - improved segmented control */}
        <div className="max-w-3xl flex items-center justify-start gap-3 mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setSelection("notification")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selection === "notification" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
            >
              Notifications
            </button>
            <button
              onClick={() => setSelection("booking")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selection === "booking" ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
            >
              Bookings
            </button>
          </div>
        </div>

        {selection === "notification" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">You have {notifications.length} new notifications.</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-600" />
              </div>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`transition-all overflow-auto px-2 hover:shadow-md ${(notification.type === "system" && notification.status === "active") ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-green-500"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex-shrink-0">{(notification.type === "success" || notification.type === "booking") && `Booking ID :  ${notification.booking}`}</div>
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">{getTypeIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                              {(notification.type === "system" && notification.status === "active") && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{notification.message}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatTimestamp(notification.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {(notification.type === "success" || notification.type === "booking") && notification.recipient}
                              </div>
                              <div className="flex items-center gap-1">
                                <Filter className="h-4 w-4" />
                                {notification.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {notifications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </>

        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {bookings.map((booking) => (
                <CardContent
                  key={booking._id}
                  id={booking._id}
                  className="relative space-y-6 border p-0 rounded-lg bg-white shadow-lg overflow-hidden"
                >
                  {/* top bar: id + download */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-600">ID</span>
                      <span className="text-sm font-mono text-gray-800">{`B2B${booking._id.slice(0,6)}....`}</span>
                      {booking.status && (
                        <Badge
                          className={`ml-8 p-2
                            ${booking.status === "pending" ? "bg-yellow-500 text-white" : ""}
                            ${booking.status === "confirmed" ? "bg-green-500 text-white" : ""}
                            ${booking.status === "cancelled" ? "bg-red-500 text-white" : ""}
                          `}
                        >
                          {booking.status}
                        </Badge>
                      )}

                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => generatePdf(booking)} aria-label={`Download ${booking._id}`}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    {/* package */}
                    {booking.package_id ? (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-2">Package</h3>
                        <p className="font-medium mb-3">{booking.package_name}</p>
                        <div className="mb-3 text-sm">
                          <div className="mb-1"><strong>Pickup</strong></div>
                          <div className="ml-2">Date: {booking.dates?.pickup_date ?? "-"}</div>
                          <div className="ml-2">Time: {booking.dates?.pickup_time ?? "-"}</div>
                          <div className="ml-2">Location: {booking.dates?.pickup_location ?? "-"}</div>
                        </div>
                        <div className="mb-3 text-sm">
                          <div className="mb-1"><strong>Drop</strong></div>
                          <div className="ml-2">Date: {booking.dates?.drop_date ?? "-"}</div>
                          <div className="ml-2">Time: {booking.dates?.drop_time ?? "-"}</div>
                          <div className="ml-2">Location: {booking.dates?.drop_location ?? "-"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-2">Package</h3>
                        <span className="text-sm text-gray-600">No package selected</span>
                      </div>
                    )}

                    {/* travelers */}
                    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                      <h3 className="font-semibold mb-2">Travelers</h3>
                      <div className="text-sm">
                        <div>Adults: {booking.guests?.adults_total ?? 0}</div>
                        <div>Children: {booking.guests?.children ?? 0}</div>
                        <div>Infants: {booking.guests?.infants ?? 0}</div>
                      </div>
                    </div>

                    {/* hotel */}
                    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                      <h3 className="font-semibold mb-2">Hotel</h3>
                      {booking.hotel_id ? (
                        <div className="text-sm">
                          <div className="font-medium">{booking.hotel?.hotel_name}</div>
                          <div>Rooms: {booking.hotel?.rooms}</div>
                          <div>Extra Beds: {booking.hotel?.extra_beds ?? 0}</div>
                          <div>Food Plan: {booking.hotel?.food_plan ?? "—"}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">No hotel selected</div>
                      )}
                    </div>

                    {/* vehicle */}
                    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                      <h3 className="font-semibold mb-2">Vehicle</h3>
                      {booking.vehicle_id ? (
                        <div className="text-sm">{booking.vehicle_name ?? "—"}</div>
                      ) : (
                        <div className="text-sm text-gray-600">No vehicle selected</div>
                      )}
                    </div>

                    {/* extras */}
                    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                      <h3 className="font-semibold mb-2">Extras</h3>
                      <div className="text-sm">
                        <div>Extra Food: {`${booking.extras?.breakfast ? "Breakfast, " : ""}${booking.extras?.lunchNonVeg ? "lunchNonVeg, " : ""}${booking.extras?.lunchVeg ? "lunchVeg" : ""}` || "None"}</div>
                        <div>Guide Needed: {booking.extras?.guideNeeded ? "Yes" : "No"}</div>
                        <div>Entry Ticket: {booking.extras?.entry_ticket_needed ? "Yes" : "No"}</div>
                        <div>Snow World Ticket: {booking.extras?.snow_world_needed ? "Yes" : "No"}</div>
                      </div>
                    </div>

                    {/* summary */}
                    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <div className="text-sm">
                        <div>Package Amount: {booking.pricing?.base_total ? `₹ ${booking.pricing.base_total}` : "0"}</div>
                        <div>Agent commission: {booking.pricing?.agent_commission ? `₹ ${booking.pricing.agent_commission}` : "0"}</div>
                        <div className="text-lg font-semibold">Total Amount: {booking.pricing?.total_amount ? `₹ ${booking.pricing.total_amount}` : "0"}</div>
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-600 border-t pt-4">
                      <div>For support: support@example.com | +91 12345 67890</div>
                      <div className="mt-1">Generated on: {formatTimestamp(new Date().toISOString())}</div>
                    </div>
                  </div>
                </CardContent>
              ))}

              {bookings.length === 0 && (
                <div className="col-span-1 md:col-span-2">
                  <CardContent className="p-12 text-center">
                    <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600">When users make bookings, they will appear here with a downloadable PDF.</p>
                  </CardContent>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
