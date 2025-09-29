"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/stores/useAuthStore";
import Header from "../components/agent/Header";
import { indianStates } from "@/constants/indianStates";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"


export default function EditProfilePage() {
  const { user, checkAuth, updateProfile } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    gstNumber: "",
    mobileNumber: "",
    alternateMobile: "",
    area: "",
    state: "",
    fullAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        companyName: user.companyName || "",
        gstNumber: user.gstNumber || "",
        mobileNumber: user.mobileNumber || "",
        alternateMobile: user.alternateMobile || "",
        area: user.area || "",
        state: user.state || "",
        fullAddress: user.fullAddress || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Simple validation
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.match(/.+@.+\..+/)) newErrors.email = "Valid email required";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number required";
    if (formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await updateProfile(formData)
    } catch (error) {
      setSubmitting(false)
    }
    setSubmitting(false)
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center">
      <Header />
      <div className="w-full max-w-4xl mx-auto my-10 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">
          Edit Profile
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Update your personal information and preferences
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-600 pl-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                {errors.fullName && <p className="text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label>Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-green-600 pl-2">
              Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
              <div>
                <label>GST Number</label>
                <Input
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, gstNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-purple-600 pl-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>Mobile Number</label>
                <Input
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                />
                {errors.mobileNumber && <p className="text-red-500">{errors.mobileNumber}</p>}
              </div>
              <div>
                <label>Alternate Mobile</label>
                <Input
                  value={formData.alternateMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, alternateMobile: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-yellow-500 pl-2">
              Address Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>Area</label>
                <Input
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">State</label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData({ ...formData, state: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label>Full Address</label>
              <Input
                value={formData.fullAddress}
                onChange={(e) =>
                  setFormData({ ...formData, fullAddress: e.target.value })
                }
              />
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-red-500 pl-2">
              Security
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>New Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label>Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
