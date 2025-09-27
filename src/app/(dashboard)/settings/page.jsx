"use client"; // VERY IMPORTANT

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAdminStore from "@/stores/useAdminStore";
import Header from "@/app/components/admin/Hearder";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { updatePassword } = useAdminStore();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setMessage(null);
  };

  const validate = () => {
    const e = {};
    const { newPassword, confirmPassword } = formData;
    if (!newPassword) e.newPassword = "New password is required.";
    else if (newPassword.length < 6)
      e.newPassword = "Must be at least 6 characters.";
    if (!confirmPassword) e.confirmPassword = "Please confirm your new password.";
    else if (newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMessage(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      await updatePassword(formData.newPassword);
      setFormData({ newPassword: "", confirmPassword: "" });
      setErrors({});
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to update password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-white px-4 m-2">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-700">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={errors.newPassword ? "border-red-400" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-600"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? "border-red-400" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-600"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`text-sm px-3 py-2 rounded ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-100"
                    : "bg-red-50 text-red-800 border border-red-100"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className={`w-full py-3  hover:scale-105${
                submitting ? "bg-gray-400" : "bg-black"
              } text-white rounded-lg`}
            >
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
    
  );
}
