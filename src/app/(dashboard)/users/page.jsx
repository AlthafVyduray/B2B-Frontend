"use client"

import useAdminStore from "@/stores/useAdminStore"
import { useState, useEffect } from "react"
import {
    Search,
    Plus,
    Filter,
    Users,
    UserCheck,
    UserX,
    Star,
    MapPin,
    Calendar,
    Phone,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    X
} from "lucide-react"
import Sidebar from "@/app/components/admin/Sidebar"
import Header from "@/app/components/admin/Hearder"

export default function UsersPage() {

    const { getUsers, users, deleteUser, editUser, createUser, loadUsers } = useAdminStore();
  const [editedUser, setEditedUser] = useState(null);
  const [deletedUser, setDeletedUser] = useState(null);
  const [createdUser, setCreatedUser] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "" });
  const [form, setForm] = useState({ email: "", password: "", role: "Admin" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getUsers();
  }, [getUsers]);



  //Edit functions
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const closeModal = () => {
    setEditedUser(null);
    setFormData({ email: "", role: "" });
  };

  const closeCreateModel = () => {
    setCreatedUser(false);
    setForm({ email: "", password: "", role: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true)
      await editUser(editedUser._id, formData);
      closeModal();
    } catch (error) {
      console.log(error)
    } finally {
      setSubmitting(false)
    }
    
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await createUser(form)
      closeCreateModel()
    } catch (error) {
      console.log(error)
    } finally {
      setSubmitting(false)
    }
  }

  //Delete functions
  const onCancel = () => setDeletedUser(null)

  const onDelete = (id) => {
    deleteUser(deletedUser._id)
    setDeletedUser(null);
  }

  if (loadUsers && !users) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin size-20" />
      </div>
    );
  }

    
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")

    // Sample user data
    // const users = [
    //     {
    //         id: 1,
    //         name: "Sarah Johnson",
    //         email: "sarah.johnson@gmail.com",
    //         phone: "+1 (555) 123-4567",
    //         role: "Customer",
    //         status: "Active",
    //         joinDate: "2024-01-15",
    //         location: "New York, USA",
    //         totalBookings: 12,
    //         totalSpent: 45600,
    //         lastBooking: "2024-08-20",
    //         rating: 4.8,
    //         avatar: "https://www.pngmart.com/files/10/Female-User-Account-PNG-Transparent-Image.png",
    //     },
    //     {
    //         id: 2,
    //         name: "Michael Chen",
    //         email: "michael.chen@outlook.com",
    //         phone: "+1 (555) 987-6543",
    //         role: "Agent",
    //         status: "Active",
    //         joinDate: "2023-06-10",
    //         location: "California, USA",
    //         totalBookings: 156,
    //         totalSpent: 0,
    //         lastBooking: "2024-09-10",
    //         rating: 4.9,
    //         avatar: "https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png",
    //     },
    //     {
    //         id: 3,
    //         name: "Priya Sharma",
    //         email: "priya.sharma@yahoo.com",
    //         phone: "+91 98765 43210",
    //         role: "Customer",
    //         status: "Active",
    //         joinDate: "2024-03-22",
    //         location: "Mumbai, India",
    //         totalBookings: 8,
    //         totalSpent: 28400,
    //         lastBooking: "2024-09-05",
    //         rating: 4.7,
    //         avatar: "https://cdn1.iconfinder.com/data/icons/elevator/154/elevator-user-man-ui-round-login-1024.png",
    //     },

    // ]

    // const filteredUsers = users.filter((user) => {
    //     const matchesSearch =
    //         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    //     const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase()
    //     const matchesStatus = filterStatus === "all" || user.status.toLowerCase() === filterStatus.toLowerCase()

    //     return matchesSearch && matchesRole && matchesStatus
    // })

    // const stats = {
    //     total: users.length,
    //     active: users.filter((u) => u.status === "Active").length,
    //     customers: users.filter((u) => u.role === "Customer").length,
    //     agents: users.filter((u) => u.role === "Agent").length,
    // }

    const getRoleColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-purple-100 text-purple-800"
            case "Agent":
                return "bg-cyan-100 text-cyan-800"
            case "Customer":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // const getStatusColor = (status) => {
    //     return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    // }

    return (
        <div className="min-h-screen bg-background lg:mt-0 mt-10">
            {/* <Sidebar active="Destinations" /> */}
            <Header />
            <main className="flex-1 flex flex-col">
                <div className="lg:p-6 space-y-6 bg-gray-50">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
                                <p className="text-gray-600">Manage customers, agents, and administrators</p>
                            </div>
                            <button
                                onClick={() => setCreatedUser(true)}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg">
                                <Plus className="w-5 h-5" />
                                Add User
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div> */}

                        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div> */}

                        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Customers</p>
                                    <p className="text-2xl font-bold text-cyan-600">{stats.customers}</p>
                                </div>
                                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-cyan-600" />
                                </div>
                            </div>
                        </div> */}

                        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Agents</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.agents}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Filters and Search */}
                    {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Filter className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div> */}

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                                {/* User Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                {user.email
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{user.email}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status and Rating
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium text-gray-700">{user.rating}</span>
                                        </div>
                                    </div> */}

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{user.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.location}</span>
                                        </div> */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Stats
                                    {user.role === "Customer" && (
                                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-900">{user.totalBookings}</p>
                                                <p className="text-xs text-gray-600">Bookings</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-900">${user.totalSpent.toLocaleString()}</p>
                                                <p className="text-xs text-gray-600">Total Spent</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.role === "Agent" && (
                                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-900">{user.totalBookings}</p>
                                                <p className="text-xs text-gray-600">Bookings Handled</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-900">{user.rating}</p>
                                                <p className="text-xs text-gray-600">Rating</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Last Activity */}
                                    {/* <div className="text-sm text-gray-600 mb-4">
                                        <span className="font-medium">Last booking:</span> {user.lastBooking}
                                    </div> */} 
                                </div>

                                {/* Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditedUser(user)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletedUser(user)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </main>
            
            {/* Edit User Modal */}
      {editedUser && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-gray-100">
              <h3 className="text-2xl font-semibold text-gray-800">
                Edit User
              </h3>
              <button onClick={closeModal}>
                <X size={24} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400 text-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-lg font-semibold"
                >
                  {submitting ? "Submitting..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletedUser && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative border border-gray-200">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">Delete User</h3>
              <button onClick={onCancel}>
                <X size={24} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-lg text-gray-700">
                Are you sure you want to delete this user ?
              </p>
              <p className="text-md text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 p-5">
              <button
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(deletedUser._id)}
                className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {createdUser && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-gray-100">
              <h3 className="text-2xl font-semibold text-gray-800">
                Create User
              </h3>
              <button onClick={closeCreateModel}>
                <X size={24} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModel}
                  className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400 text-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-lg font-semibold"
                >
                  {submitting ? "Submitting..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
    )
}
