"use client";

import useAdminStore from "@/stores/useAdminStore";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Plus,
  MapPin,
  Star,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  Waves,
  Eye,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/app/components/admin/Sidebar";
import Header from "@/app/components/admin/Hearder";

export default function HotelsPage() {
  const {
    hotels,
    loadHotels,
    getHotels,
    createHotel,
    updateHotel,
    deleteHotel,
  } = useAdminStore();

  const cancelDeleteRef = useRef(null);

  // modal state
  const [hotelToUpdate, setHotelToUpdate] = useState(null);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [hotelToCreate, setHotelToCreate] = useState(false);

  // form initial structure (updated keys: roomPrice, extraBedPrice)
  const initialForm = {
    name: "",
    details: "",
    starRating: "",
    pricing: {
      cpPrice: 0,
      apPrice: 0,
      mapPrice: 0,
      roomPrice: 0,
      extraBedPrice: 0,
    },
  };

  // shared form state (used for create + update)
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // fetch hotels on mount
  useEffect(() => {
    if (typeof getHotels === "function") getHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup blob previews when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // lock body scroll when any modal open
  useEffect(() => {
    const anyOpen = hotelToCreate || hotelToUpdate || hotelToDelete;
    const prev = document.body.style.overflow;
    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [hotelToCreate, hotelToUpdate, hotelToDelete]);

  // when editing a hotel, populate form (map new keys roomPrice & extraBedPrice)
  useEffect(() => {
    if (hotelToUpdate) {
      setFormData({
        name: String(hotelToUpdate.name ?? ""),
        details: String(hotelToUpdate.details ?? ""),
        starRating:
          hotelToUpdate.starRating != null
            ? String(hotelToUpdate.starRating)
            : "",
        pricing: {
          cpPrice:
            hotelToUpdate.pricing?.cpPrice != null
              ? String(hotelToUpdate.pricing.cpPrice)
              : "",
          apPrice:
            hotelToUpdate.pricing?.apPrice != null
              ? String(hotelToUpdate.pricing.apPrice)
              : "",
          mapPrice:
            hotelToUpdate.pricing?.mapPrice != null
              ? String(hotelToUpdate.pricing.mapPrice)
              : "",
          roomPrice:
            hotelToUpdate.pricing?.roomPrice != null
              ? String(hotelToUpdate.pricing.roomPrice)
              : "",
          extraBedPrice:
            hotelToUpdate.pricing?.extraBedPrice != null
              ? String(hotelToUpdate.pricing.extraBedPrice)
              : "",
        },
      });

      setImageFile(null);
      setImagePreview(hotelToUpdate.imageUrl ?? hotelToUpdate.image ?? "");
    } else {
      setFormData(initialForm);
      setImageFile(null);
      setImagePreview("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelToUpdate]);

  // generic handleChange that supports pricing.* inputs by using dot syntax in `name`
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      // if updating preserve previous preview (hotelToUpdate) otherwise clear
      setImagePreview(hotelToUpdate?.imageUrl ?? hotelToUpdate?.image ?? "");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        image: "Only JPG / PNG / WEBP images allowed",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "File too large (max 5 MB)" }));
      return;
    }

    // clear previous blob if any
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    const blobUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(blobUrl);
    setErrors((p) => ({ ...p, image: undefined }));
  };

  //validation for create form
  const validate = () => {
    const e = {};

    // Hotel name
    if (!formData.name?.trim()) {
      e.name = "Hotel name is required";
    }

    // Details max length
    if (formData.details && formData.details.length > 1000) {
      e.details = "Details cannot exceed 1000 characters";
    }

    // Star rating between 1 and 5
    const star = Number(formData.starRating);
    if (formData.starRating !== undefined && formData.starRating !== null) {
      if (Number.isNaN(star) || star < 1 || star > 5) {
        e.starRating = "Star rating must be between 1 and 5";
      }
    }

    // Pricing validations (all required + non-negative)
    const pricingFields = [
      "cpPrice",
      "apPrice",
      "mapPrice",
      "roomPrice",
      "extraBedPrice",
    ];
    pricingFields.forEach((field) => {
      const value = formData.pricing?.[field];

      // Required check
      if (value === undefined || value === null || value === "") {
        e[field] = `${field} is required`;
        return;
      }

      const num = Number(value);

      // Invalid or negative check
      if (Number.isNaN(num) || num < 0) {
        e[field] = `${field} must be a non-negative number`;
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  //validation for update form
  // const validateHotelUpdate = (formData) => {
  //   const e = {};

  //   // Name
  //   if (!formData.name?.trim()) {
  //     e.name = "Hotel name is required";
  //   }

  //   // Details
  //   if (formData.details && formData.details.length > 1000) {
  //     e.details = "Details cannot exceed 1000 characters";
  //   }

  //   // Star rating
  //   if (formData.starRating !== "" && formData.starRating !== undefined) {
  //     const star = Number(formData.starRating);
  //     if (Number.isNaN(star) || star < 1 || star > 5) {
  //       e.starRating = "Star rating must be between 1 and 5";
  //     }
  //   }

  //   // Pricing
  //   const pricing = formData.pricing || {};

  //   if (pricing.cpPrice !== "" && pricing.cpPrice !== undefined) {
  //     if (Number(pricing.cpPrice) < 0) e.cpPrice = "CP price cannot be negative";
  //   }
  //   if (pricing.apPrice !== "" && pricing.apPrice !== undefined) {
  //     if (Number(pricing.apPrice) < 0) e.apPrice = "AP price cannot be negative";
  //   }
  //   if (pricing.mapPrice !== "" && pricing.mapPrice !== undefined) {
  //     if (Number(pricing.mapPrice) < 0) e.mapPrice = "MAP price cannot be negative";
  //   }
  //   if (pricing.roomPrice === "" || pricing.roomPrice === undefined) {
  //     e.roomPrice = "Room price is required";
  //   } else if (Number(pricing.roomPrice) < 0) {
  //     e.roomPrice = "Room price cannot be negative";
  //   }
  //   if (pricing.extraBedPrice !== "" && pricing.extraBedPrice !== undefined) {
  //     if (Number(pricing.extraBedPrice) < 0) e.extraBedPrice = "Extra bed price cannot be negative";
  //   }

  //   return e;
  // };

  // CREATE handler
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const fd = new FormData();

      if (imageFile) fd.append("image", imageFile);

      fd.append("name", formData.name ?? "");
      fd.append("details", formData.details ?? "");
      if (formData.starRating !== "")
        fd.append("starRating", String(formData.starRating));

      if (formData.pricing?.cpPrice !== "")
        fd.append("cpPrice", String(formData.pricing.cpPrice));
      if (formData.pricing?.apPrice !== "")
        fd.append("apPrice", String(formData.pricing.apPrice));
      if (formData.pricing?.mapPrice !== "")
        fd.append("mapPrice", String(formData.pricing.mapPrice));
      if (formData.pricing?.roomPrice !== "")
        fd.append("roomPrice", String(formData.pricing.roomPrice));
      if (formData.pricing?.extraBedPrice !== "")
        fd.append("extraBedPrice", String(formData.pricing.extraBedPrice));

      if (typeof createHotel === "function") {
        await createHotel(fd);
      } else {
        throw new Error("createHotel is not available in store");
      }

      // refresh & reset
      if (typeof getHotels === "function") await getHotels();
      setFormData(initialForm);
      setImageFile(null);
      if (imagePreview && imagePreview.startsWith("blob:"))
        URL.revokeObjectURL(imagePreview);
      setImagePreview("");
      setErrors({});
      setHotelToCreate(false);
    } catch (err) {
      console.error("Failed to create hotel:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create hotel";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE handler
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!hotelToUpdate?._id) return;

    setSubmitting(true);

    try {
      const fd = new FormData();
      if (imageFile) fd.append("image", imageFile);

      fd.append("name", formData.name ?? "");
      fd.append("details", formData.details ?? "");
      if (formData.starRating !== "")
        fd.append("starRating", String(formData.starRating));

      if (formData.pricing?.cpPrice !== "")
        fd.append("cpPrice", String(formData.pricing.cpPrice));
      if (formData.pricing?.apPrice !== "")
        fd.append("apPrice", String(formData.pricing.apPrice));
      if (formData.pricing?.mapPrice !== "")
        fd.append("mapPrice", String(formData.pricing.mapPrice));
      if (formData.pricing?.roomPrice !== "")
        fd.append("roomPrice", String(formData.pricing.roomPrice));
      if (formData.pricing?.extraBedPrice !== "")
        fd.append("extraBedPrice", String(formData.pricing.extraBedPrice));

      if (typeof updateHotel === "function") {
        await updateHotel(hotelToUpdate._id, fd);
      } else {
        throw new Error("updateHotel is not available in store");
      }

      if (typeof getHotels === "function") await getHotels();
      setHotelToUpdate(null);
      setFormData(initialForm);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      console.error("Failed to update hotel:", err);
      alert(
        err?.response?.data?.message || err?.message || "Failed to update hotel"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE handler
  const handleDeleteConfirmed = async () => {
    if (!hotelToDelete?._id) return;
    setSubmitting(true);
    try {
      if (typeof deleteHotel === "function") {
        await deleteHotel(hotelToDelete._id);
      } else {
        throw new Error("deleteHotel not available in store");
      }
      if (typeof getHotels === "function") await getHotels();
      setHotelToDelete(null);
    } catch (err) {
      console.error("Failed to delete hotel:", err);
      setHotelToDelete(null);
    } finally {
      setSubmitting(false);
    }
  };

  const [searchName, setSearchName] = useState("");
  const [searchStar, setSearchStar] = useState("");

  // Filtered hotels based on name and star rating
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesName = hotel.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesStar = searchStar
        ? hotel.starRating === Number(searchStar)
        : true;
      return matchesName && matchesStar;
    });
  }, [hotels, searchName, searchStar]);
  // simple loading placeholder
  if (loadHotels && !hotels) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      {/* Sidebar */}
      {/* <Sidebar active="Destinations" /> */}
      {/* Main Content */}

      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Hotels Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your hotel inventory and partnerships
              </p>
            </div>

            <Button
              onClick={() => setHotelToCreate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm: justify-between gap-4 p-4 rounded-lg border bg-background">
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
            <select
              value={searchStar}
              onChange={(e) => setSearchStar(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-40"
            >
              <option value="">All Stars</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setSearchName("");
                setSearchStar("");
              }}
              className="bg-gray-400 hover:bg-gray-500"
            >
              Reset
            </Button>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHotels.map((hotel) => (
              <Card
                key={hotel._id}
                className="border rounded-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/3">
                    <img
                      src={hotel.imageUrl || null}
                      alt={hotel.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="md:w-2/3 p-6 space-y-3">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {hotel.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">{hotel.details}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1">{hotel.starRating}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Room:</span> ₹
                      {hotel.pricing.roomPrice}
                      <span className="ml-4 font-medium">Extra Bed:</span> ₹
                      {hotel.pricing.extraBedPrice}
                      <span className="ml-4 text-gray-500">
                        CP ₹{hotel.pricing.cpPrice}, AP ₹{hotel.pricing.apPrice}
                        , MAP₹{hotel.pricing.mapPrice}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setHotelToUpdate(hotel)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => setHotelToDelete(hotel)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 flex-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredHotels.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hotels found
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {hotelToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setHotelToDelete(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden z-10">
            <div className="flex items-start justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Hotel
              </h3>
              <button
                onClick={() => setHotelToDelete(null)}
                aria-label="Close"
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  {hotelToDelete?.name ?? "this hotel"}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="text-sm text-gray-500 mb-4">
                <div>ID: {hotelToDelete?._id ?? "—"}</div>
                <div>
                  Created:{" "}
                  {hotelToDelete?.createdAt
                    ? String(hotelToDelete.createdAt).slice(0, 10)
                    : "—"}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  ref={cancelDeleteRef}
                  onClick={() => setHotelToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  disabled={submitting}
                >
                  {submitting ? "Deleting..." : "Delete Hotel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {hotelToUpdate && (
        <Card
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-auto z-10">
            <CardHeader className="flex items-center justify-between p-5 border-b">
              <h3 className="text-2xl font-semibold text-gray-900">
                Edit Hotel
              </h3>
              <Button
                onClick={() => setHotelToUpdate(null)}
                aria-label="Close"
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </Button>
            </CardHeader>

            <form
              onSubmit={handleUpdateSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Label className="flex flex-col">
                  <span className="text-sm font-medium">Name</span>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded px-3 py-2"
                  />
                </Label>

                <Label className="flex flex-col">
                  <span className="text-sm font-medium">Star Rating</span>
                  <Input
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="border rounded px-3 py-2"
                  />
                </Label>
              </div>

              <Label className="flex flex-col">
                <span className="text-sm font-medium">Details</span>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </Label>

              <div className="grid grid-cols-1">
                <Label className="flex flex-col">
                  <span className="text-sm font-medium">Upload Image</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a new image to upload (optional).
                  </p>
                </Label>
              </div>

              {imagePreview ? (
                <div className="p-2 border rounded w-48">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ) : null}

              <fieldset className="border p-3 rounded">
                <legend className="text-sm font-semibold">
                  Pricing (flat keys)
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <Label className="flex flex-col">
                    <span className="text-xs">CP Price</span>
                    <input
                      name="pricing.cpPrice"
                      value={formData.pricing.cpPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                  </Label>
                  <Label className="flex flex-col">
                    <span className="text-xs">AP Price</span>
                    <input
                      name="pricing.apPrice"
                      value={formData.pricing.apPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                  </Label>
                  <Label className="flex flex-col">
                    <span className="text-xs">MAP Price</span>
                    <input
                      name="pricing.mapPrice"
                      value={formData.pricing.mapPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                  </Label>
                  <Label className="flex flex-col">
                    <span className="text-xs">Room Price (₹)</span>
                    <input
                      name="pricing.roomPrice"
                      value={formData.pricing.roomPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                  </Label>
                  <Label className="flex flex-col">
                    <span className="text-xs">Extra Bed Price (₹)</span>
                    <input
                      name="pricing.extraBedPrice"
                      value={formData.pricing.extraBedPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                  </Label>
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => {
                    setHotelToUpdate(null);
                    setFormData(initialForm);
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      {hotelToCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setHotelToCreate(false)}
          />
          <div className="relative z-10 p-6 bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Add Hotel</h2>
              <button
                onClick={() => setHotelToCreate(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Hotel Name *</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded px-3 py-2"
                    placeholder="Hotel name"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Star Rating</span>
                  <input
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="border rounded px-3 py-2"
                    placeholder="e.g. 3"
                  />
                  {errors.starRating && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.starRating}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Details</span>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  placeholder="Short description"
                />
                {errors.details && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.details}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border rounded px-3 py-2"
                  />
                  {errors.image && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.image}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Optional. Max 5 MB. JPG / PNG / WEBP.
                  </p>
                </label>
              </div>

              {imagePreview && (
                <div className="w-48 p-2 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Preview</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (imagePreview.startsWith("blob:"))
                          URL.revokeObjectURL(imagePreview);
                        setImagePreview("");
                        setImageFile(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              <fieldset className="shadow-lg p-3 rounded">
                <legend className="text-sm font-semibold">
                  Pricing (flat keys)
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <label className="flex flex-col">
                    <span className="text-xs">CP Price (₹)</span>
                    <input
                      name="pricing.cpPrice"
                      value={formData.pricing.cpPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                      placeholder="e.g. 2000"
                    />
                    {errors.cpPrice && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.cpPrice}
                      </span>
                    )}
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs">AP Price (₹)</span>
                    <input
                      name="pricing.apPrice"
                      value={formData.pricing.apPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                    {errors.apPrice && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.apPrice}
                      </span>
                    )}
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs">MAP Price (₹)</span>
                    <input
                      name="pricing.mapPrice"
                      value={formData.pricing.mapPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                    />
                    {errors.mapPrice && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.mapPrice}
                      </span>
                    )}
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs">Room Price (₹)</span>
                    <input
                      name="pricing.roomPrice"
                      value={formData.pricing.roomPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                      placeholder="e.g. 3500"
                    />
                    {errors.roomPrice && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.roomPrice}
                      </span>
                    )}
                  </label>

                  <label className="flex flex-col">
                    <span className="text-xs">Extra Bed Price (₹)</span>
                    <input
                      name="pricing.extraBedPrice"
                      value={formData.pricing.extraBedPrice}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border rounded px-2 py-2"
                      placeholder="e.g. 500"
                    />
                    {errors.extraBedPrice && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.extraBedPrice}
                      </span>
                    )}
                  </label>
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialForm);
                    setImageFile(null);
                    if (imagePreview && imagePreview.startsWith("blob:"))
                      URL.revokeObjectURL(imagePreview);
                    setImagePreview("");
                    setErrors({});
                    setHotelToCreate(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
