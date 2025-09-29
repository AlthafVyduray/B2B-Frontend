"use client"

import useAdminStore from "@/stores/useAdminStore"
import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Plus,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Settings,
  X,
} from "lucide-react"
import Header from "@/app/components/admin/Hearder"

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const { notifications, loadNotifications, deleteNotification, getNotifications, notificationStats,
  notificationPagination = {page: 1, totalPages: 1, limit: 10, totalRecords: 0,} } = useAdminStore();
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [notificationToCreate, setNotificationToCreate] = useState(false)


  const [page, setPage] = useState(notificationPagination.page || 1);
  const [limit, setLimit] = useState(notificationPagination.limit || 10);
  

  useEffect(() => {
    if (page === 1) {
    getNotifications({ filterType, filterStatus, page, limit });
      
    } else {
      setPage(1);
    } 
  }, [filterType, filterStatus]);
      
    // fetch bookings on mount
    useEffect(() => {
      if (typeof getNotifications === "function") {
        getNotifications({ filterType, filterStatus, page, limit });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType, filterStatus, page, limit]);
  
 

  const [notification, setNotification] = useState({
    title: "",
    message: "",
    type: "system"
  });

  const {createNotification} = useAdminStore()

  const handleSend = () => {
    createNotification(notification)
    setNotification({
      title: "",
      message: "",
      type: "system"
    })
    setNotificationToCreate(false)
  };

  const handleCancel = () => {
    setNotification({
      title: "",
      message: "",
      type: "system"
    })
    setNotificationToCreate(false)
  };

 

  const getTypeIcon = (type) => {
    switch (type) {
      case "booking":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "system":
        return <Settings className="h-5 w-5 text-blue-500" />
      case "cancel":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
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



  return (
    <div className="lg:p-6 p-3 space-y-6 lg:mt-0 mt-10 m-2 bg-background">
      <main className="flex-1 flex flex-col bg-gray-50 gap-3">
        {/* Header */}
        <Header />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage system notifications and alerts</p>
          </div>
          <Button onClick={() => setNotificationToCreate(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Notification
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.system}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6  text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booking Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.booking}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Success Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.success}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="system">System</option>
                  <option value="success">Success</option>
                  <option value="booking">Booking</option>
                  <option value="cancel">Cancelled</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all hover:shadow-md border-l-4
                ${notification.type === "success" ? "border-l-green-600" : ""}
                ${notification.type === "booking" ? "border-l-yellow-600" : ""}
                ${notification.type === "system" ? "border-l-blue-600" : ""}
                ${notification.type === "cancel" ? "border-l-red-600" : ""}`}
            >
              <CardContent className="p-6 overflow-y-auto">
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
          
                  <div className="flex items-center gap-2 ml-4">
                    <Button onClick={() => setNotificationToDelete(notification)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Prev */}
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>

            {/* Page Numbers with dots */}
            {Array.from({ length: notificationPagination.totalPages || 1 }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === notificationPagination.totalPages ||
                (p >= page - 1 && p <= page + 1)
            )
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showDots = prev && p - prev > 1;

              return (
                <React.Fragment key={p}>
                  {showDots && <span className="px-2">...</span>}
                  <Button
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}
            

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              disabled={page === notificationPagination.totalPages || 1}
              onClick={() => setPage((p) => Math.min(notificationPagination.totalPages || 1, p + 1))}
            >
              Next
            </Button>
          </div>
      </main>
      {notificationToDelete && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative border border-gray-200">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">Delete Notification</h3>
              <button onClick={() => setNotificationToDelete(null)}>
                <X size={22} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-gray-700">
              <p>
                Are you sure you want to delete this notification?
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-4">
              <button
                onClick={() => setNotificationToDelete(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {deleteNotification(notificationToDelete._id); setNotificationToDelete(null)}}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {notificationToCreate && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative border border-gray-200">
          {/* Page Title - Left aligned */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8 self-start p-2">
              Notifications
            </h1>

            {/* Card */}
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 transform transition-all hover:shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Notification</h2>

              <label className="block text-sm font-medium text-gray-600 mb-2">
                title
              </label>
              <input
                type= "text"
                value={notification.title}
                onChange={(e) => setNotification(pre => ({...pre, title: e.target.value}))}
                placeholder="title"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none transition-all"
              />
              
              {/* Input */}
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Notification Message
              </label>
              <textarea
                value={notification.message}
                onChange={(e) => setNotification(pre => ({...pre, message: e.target.value}))}
                placeholder="Enter notification message..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none transition-all"
                rows="4"
              />

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={(handleSend)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  Send
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
