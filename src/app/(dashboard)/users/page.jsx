"use client";

import useAdminStore from "@/stores/useAdminStore";
import { useState, useEffect } from "react";
import { Plus, UserX, Calendar, Edit, Trash2, X, Loader } from "lucide-react";
import Header from "@/app/components/admin/Hearder";

export default function UsersPage() {
  const { getUsers, users, deleteUser, editUser, createUser, loadUsers } =
    useAdminStore();
  const [editedUser, setEditedUser] = useState(null);
  const [deletedUser, setDeletedUser] = useState(null);
  const [createdUser, setCreatedUser] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "Admin" });
  const [form, setForm] = useState({ email: "", password: "", role: "Admin" });
  const [submitting, setSubmitting] = useState(false);

  //Edit functions
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setEditedUser(null);
    setFormData({ email: "", role: "Admin" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await editUser(editedUser._id, formData);
      closeModal();
    } catch (error) {
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Create functions
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const closeCreateModel = () => {
    setCreatedUser(false);
    setForm({ email: "", password: "", role: "Admin" });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createUser(form);
      closeCreateModel();
    } catch (error) {
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  //Delete functions
  const onCancel = () => setDeletedUser(null);

  const onDelete = (id) => {
    deleteUser(deletedUser._id);
    setDeletedUser(null);
  };

  useEffect(() => {
    setFormData({ email: editedUser?.email, role: setEditedUser?.role });
  }, [editedUser]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (loadUsers && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin size-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Users Management
              </h1>
              <p className="text-gray-600">
                Manage customers, agents, and administrators
              </p>
            </div>
            <button
              onClick={() => setCreatedUser(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user?._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* User Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user?.email
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user?.email}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-blue`}
                      >
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Joined Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined {new Date(user?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditedUser(user)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletedUser(user)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
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
                  value={formData.email || ""}
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
              <h3 className="text-xl font-semibold text-gray-800">
                Delete User
              </h3>
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
  );
}
