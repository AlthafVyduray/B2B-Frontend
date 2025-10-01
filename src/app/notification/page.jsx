"use client"

import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Settings,
  Calendar,
  User,
  Filter,
  EyeIcon,
  Download,
  X,
  Info,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useBookingStore from "@/stores/useBookingStore";
import { Button } from "@/components/ui/button";
import Header from "../components/agent/Header";
import { DisplayBooking, DisplayDefaultBooking, formatTimestamp, generateDefaultPackagePdf, generatePdf } from "../components/agent/utils";
export default function NotificationPage() {

  const {
    notifications,
    getAdminNotifications,
    bookings,
    getBookings,
    packages,
    getPackages,
    defaultPackages,
    hotels,
    getHotelsByRating,
  } = useBookingStore();

  // modal / preview state
  const [previewBooking, setPreviewBooking] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getAdminNotifications();
    getBookings();
    getPackages();
    getHotelsByRating?.(0);
  }, [getAdminNotifications, getBookings, getPackages, getHotelsByRating]);

  const getTypeIcon = (type) => {
    switch ((type || "").toString().toLowerCase()) {
      case "booking":
        // Warning/attention for new bookings
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "success":
        // Successful action
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "system":
        // System info or updates
        return <Settings className="h-5 w-5 text-blue-500" />;
      case "cancel":
        // Error notifications
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        // Generic info
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };


  // ---------------- Modal handlers ----------------
  const openPreviewByBookingId = (bookingId) => {
    const booking = bookings?.find((b) => String(b._id) === String(bookingId));
    if (!booking) {
      console.warn("Booking not found for id:", bookingId);
      return;
    }
    setPreviewBooking(booking);
  };

  const closePreview = () => {
    setPreviewBooking(null);
    setDownloading(false);
  };

  const handleDownloadFromPreview = async () => {
    if (!previewBooking) return;
    setDownloading(true);
    try {
      if (((previewBooking?.source || "").toString().toLowerCase() === "booking")) {
        await generatePdf(previewBooking, packages, hotels);
      } else {
        await generateDefaultPackagePdf(previewBooking, defaultPackages, hotels);
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert(err?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  //state for filtering
  const [filterType, setFilterType] = useState("all");

  const filteredNotifications = notifications?.filter((n) => 
    filterType === "all" ? true : n.type === filterType
  );



  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-white shadow-sm py-8 px-6">
        {/* Toggle */}


          <div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  You have {notifications?.length ?? 0} notifications.
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Filter Dropdown */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="booking">Booking</option>
                  <option value="success">Success</option>
                  <option value="system">System</option>
                  <option value="cancel">Cancel</option>
                </select>

                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bell className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>


            <div className="space-y-4">
              {filteredNotifications?.map((notification) => (
                <Card
                  key={notification._id}
                  className={`transition-all overflow-auto px-2 hover:shadow-md border-l-4
                    ${notification.type === "success" || notification.type === "confirm" ? "border-l-green-500" : ""}
                    ${notification.type === "booking" ? "border-l-yellow-500" : ""}
                    ${notification.type === "system" && notification.status === "active" ? "border-l-blue-500" : ""}
                    ${notification.type === "cancel" ? "border-l-red-500" : ""}
                    ${notification.type === "pending" ? "border-l-orange-500" : ""}`}
                >
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex-shrink-0">{(notification.type === "success" || notification.type === "booking" || notification.type === "cancel") && `Booking ID :  ${notification.booking}`}</div>
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
                                {(notification.type === "success" || notification.type === "booking" || notification.type === "cancel") && notification.recipient}
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

                    {/* Eye icon now opens modal preview */}
                    {notification.booking && (
                      <EyeIcon
                        onClick={() => openPreviewByBookingId(notification.booking)}
                        className="absolute top-0 right-2 cursor-pointer"
                      />
                    )}
                    
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!filteredNotifications || filteredNotifications.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
       
        {/* Preview Modal */}
        {previewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closePreview}
            />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-auto max-h-[90vh] z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {((previewBooking?.source || "").toString().toLowerCase() === "booking") ? "Booking Preview" : "Default Booking Preview"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closePreview}
                    className="p-1 text-gray-600 rounded hover:bg-gray-100"
                    aria-label="Close preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {((previewBooking?.source || "").toString().toLowerCase() === "booking") ? (
                  DisplayBooking(previewBooking)
                ) : (
                  DisplayDefaultBooking(previewBooking)
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t">
                <button
                  type="button"
                  onClick={closePreview}
                  className="px-4 py-2 rounded bg-gray-200"
                  disabled={downloading}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFromPreview}
                  className={`px-4 py-2 rounded text-white ${downloading ? "bg-gray-400" : "bg-blue-600 hover:opacity-90"}`}
                  disabled={downloading}
                >
                  {downloading ? "Preparing..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
