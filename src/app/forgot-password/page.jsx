"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";   // ✅ import router
import useAuthStore from "@/stores/useAuthStore";

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuthStore();
  const router = useRouter();  // ✅ initialize router

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(formData.email);

      // ✅ Redirect after success
      router.push("/reset-password");
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-5">
            <div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                  ${errors.email ? "ring-2 ring-red-500 border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mb-4">{errors.email}</p>
              )}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full text-white py-3 mt-3 rounded-lg font-medium hover:bg-gray-800 transition
              ${loading ? "bg-gray-400" : "bg-black"}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-4">
            <p className="text-black text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="text-[#0f558e]">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
