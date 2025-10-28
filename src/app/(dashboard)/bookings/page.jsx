"use client";

import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EyeIcon } from "lucide-react";
import useAdminStore from "@/stores/useAdminStore";
import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Hotel,
  Plane,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/app/components/admin/Sidebar";
import { CalendarDays, Clock, CheckCircle, DollarSign } from "lucide-react";
import Header from "@/app/components/admin/Hearder";
import DefaultPackageBookingEditFromSelected from "./DefaultPackageBookingEditFromSelected";
import { indianStates } from "@/constants/indianStates";

// ---------- helpers ----------
const formatDateDisplay = (value) => {
  // Returns "11 Sep 2025" or "—" if invalid / missing
  if (value === undefined || value === null || value === "") return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (err) {
    return "—";
  }
};

const formatTimeDisplay = (value) => {
  // Accepts:
  // - full ISO datetime string
  // - time-only strings "HH:MM" or "HH:MM:SS"
  // Returns "02:30 PM" or "—" when invalid
  if (value === undefined || value === null || value === "") return "—";
  const s = String(value).trim();
  // If looks like time-only "9:30", "09:30:00"
  const timeOnlyMatch = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  try {
    if (timeOnlyMatch) {
      const hh = Number(timeOnlyMatch[1]);
      const mm = Number(timeOnlyMatch[2]);
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        const tmp = new Date();
        tmp.setHours(hh, mm, 0, 0);
        return tmp.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return "—";
    }
    // Otherwise try parse as date/time
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    return "—";
  }
};

const formatDateTimeDisplay = (dateValue, timeValue) => {
  // If both are present, show "11 Sep 2025, 02:30 PM"
  const dateStr = formatDateDisplay(dateValue);
  const timeStr = formatTimeDisplay(timeValue);
  if (dateStr === "—" && timeStr === "—") return "—";
  if (dateStr === "—") return timeStr;
  if (timeStr === "—") return dateStr;
  return `${dateStr}, ${timeStr}`;
};

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const {
    getVehicles,
    vehicles,
    hotels,
    getHotels,
    getBookings,
    deleteBooking,
    changeState,
    loadBookings,
    bookings,
    updateBooking,
    bookingStats,
    confirmBooking,
    cancelBooking,
    updateDefaultBooking,
    bookingPagination = { page: 1, totalPages: 1, limit: 10, total: 0 },
  } = useAdminStore();

  // selection/modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editedBooking, setEditedBooking] = useState(null);
  const [deletedBooking, setDeletedBooking] = useState(null);
  // local pagination state
  const [page, setPage] = useState(bookingPagination.page || 1);
  const [limit, setLimit] = useState(bookingPagination.limit || 10);

  // datas for stats display
  const stats = [
    {
      title: "Total Bookings",
      value: bookingStats.totalBookings,
      icon: <CalendarDays className="text-blue-500 w-7 h-7" />,
      color: "bg-blue-100",
    },
    {
      title: "Pending Bookings",
      value: bookingStats.pendingBookings,
      icon: <Clock className="text-yellow-500 w-7 h-7" />,
      color: "bg-yellow-100",
    },
    {
      title: "Confirmed Bookings",
      value: bookingStats.confirmedBookings,
      icon: <CheckCircle className="text-green-500 w-7 h-7" />,
      color: "bg-green-100",
    },
    {
      title: "Revenue",
      value: `₹ ${Number(bookingStats.totalRevenue).toLocaleString()}`,
      icon: <DollarSign className="text-purple-500 w-7 h-7" />,
      color: "bg-purple-100",
    },
  ];

  // default form shape matching booking schema for resetting the form
  const defaultForm = {
    email: "",
    mobile_number: "",
    name: "",
    state: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    package_name: "",
    package_id: "",
    vehicle_name: "",
    vehicle_id: "",
    pickup_date: "",
    pickup_time: "",
    pickup_location: "",
    pickup_location_other: "",
    drop_date: "",
    drop_time: "",
    drop_location: "",
    drop_location_other: "",
    adults_total: 1,
    children: 0,
    infants: 0,
    entry_ticket_needed: false,
    snow_world_needed: false,
    food_plan: "None",
    extra_food: { breakfast: false, lunchVeg: false, lunchNonVeg: false },
    hotel_name: "",
    hotel_id: "",
    rooms: 1,
    extra_beds: 0,
    guideNeeded: false,
    agent_commission: 0,
    base_total: 0,
    total_amount: 0,
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (editedBooking) {
      getHotels();
      getVehicles();
    }
  }, [editedBooking]);

  // when search/state filter changes, reset to page 1
  useEffect(() => {
    const effectiveState = stateFilter === "all" ? "" : stateFilter;

    if (page === 1) {
      getBookings({ stateFilter: effectiveState, searchTerm, page, limit });
    } else {
      setPage(1);
    }
  }, [stateFilter, searchTerm]);

  // fetch bookings on mount + whenever pagination changes
  useEffect(() => {
    if (typeof getBookings === "function") {
      const effectiveState = stateFilter === "all" ? "" : stateFilter;

      getBookings({ stateFilter: effectiveState, searchTerm, page, limit });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, searchTerm, page, limit]);

  //Populating the values of booking details in editing normal package form
  useEffect(() => {
    if (editedBooking && editedBooking.source === "booking") {
      const pkgId =
        editedBooking.package_id && typeof editedBooking.package_id === "object"
          ? editedBooking.package_id || ""
          : editedBooking.package_id || "";

      const vehicleId =
        editedBooking.vehicle_id && typeof editedBooking.vehicle_id === "object"
          ? editedBooking.vehicle_id || ""
          : editedBooking.vehicle_id || "";

      const hotelId =
        editedBooking.hotel_id && typeof editedBooking.hotel_id === "object"
          ? editedBooking.hotel_id || ""
          : editedBooking.hotel_id || "";

      setFormData({
        email: editedBooking.contact?.email ?? "",
        mobile_number: editedBooking.contact?.mobile_number ?? "",
        name: editedBooking.contact?.name ?? "",
        state: editedBooking.contact?.state ?? "",
        client_name: editedBooking.client_contact?.name ?? "",
        client_email: editedBooking.client_contact?.email ?? "",
        client_phone: editedBooking.client_contact?.phone ?? "",
        package_name:
          editedBooking.package_name ??
          (editedBooking.package_id && editedBooking.package_name) ??
          "",
        package_id: pkgId,
        vehicle_name:
          editedBooking.vehicle_name ??
          (editedBooking.vehicle_id && editedBooking.vehicle_name) ??
          "",
        vehicle_id: vehicleId,
        pickup_date: editedBooking.dates.pickup_date
          ? String(editedBooking.dates.pickup_date).slice(0, 10)
          : "",
        pickup_time: editedBooking.dates.pickup_time ?? "",
        pickup_location: editedBooking.dates.pickup_location ?? "",
        drop_date: editedBooking.dates.drop_date
          ? String(editedBooking.dates.drop_date).slice(0, 10)
          : "",
        drop_time: editedBooking.dates.drop_time ?? "",
        drop_location: editedBooking.dates.drop_location ?? "",
        adults_total: editedBooking.guests.adults_total ?? 1,
        children: editedBooking.guests.children ?? 0,
        infants: editedBooking.guests.infants ?? 0,
        entry_ticket_needed: !!editedBooking.extras.entry_ticket_needed,
        snow_world_needed: !!editedBooking.extras.snow_world_needed,
        food_plan: editedBooking.hotel.food_plan ?? "None",
        extra_food: {
          breakfast: !!(
            editedBooking.extras.breakfast && editedBooking.extras.breakfast
          ),
          lunchVeg: !!(
            editedBooking.extras.lunchVeg && editedBooking.extras.lunchVeg
          ),
          lunchNonVeg: !!(
            editedBooking.extras.lunchNonVeg && editedBooking.extras.lunchNonVeg
          ),
        },
        hotel_name:
          editedBooking.hotel.hotel_name ??
          (editedBooking.hotel_id && editedBooking.hotel.hotel_name) ??
          "",
        hotel_id: hotelId,
        rooms: editedBooking.hotel.rooms ?? 1,
        extra_beds: editedBooking.hotel.extra_beds ?? 0,
        guideNeeded: !!editedBooking.extras.guideNeeded,
        agent_commission: editedBooking.pricing.agent_commission ?? 0,
        base_total: editedBooking.pricing.base_total ?? 0,
        total_amount: editedBooking.pricing.total_amount ?? 0,
      });
    } else {
      setFormData(defaultForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedBooking]);

  // Generic change for text/number/select inputs
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // checkbox handler for top-level booleans
  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // nested checkbox handler for extra_food
  const handleExtraFoodChange = (e) => {
    const { name, checked } = e.target; // name will be 'breakfast'|'lunchVeg'|'lunchNonVeg'
    setFormData((prev) => ({
      ...prev,
      extra_food: { ...prev.extra_food, [name]: checked },
    }));
  };

  // Submit edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedBooking?._id) return;

    // Build payload mapping only allowed/expected fields
    const payload = {
      email: formData.email,
      mobile_number: formData.mobile_number,
      name: formData.name,
      state: formData.state,
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_phone: formData.client_phone,
      package_name: formData.package_name,
      package_id: formData.package_id || null,
      vehicle_name: formData.vehicle_name,
      vehicle_id: formData.vehicle_id || null,
      pickup_date: formData.pickup_date || null,
      pickup_time: formData.pickup_time || "",
      pickup_location: formData.pickup_location || "",
      pickup_location_other: formData.pickup_location_other || "",
      drop_date: formData.drop_date || null,
      drop_time: formData.drop_time || "",
      drop_location: formData.drop_location || "",
      drop_location_other: formData.drop_location_other || "",
      adults_total: Number(formData.adults_total || 0),
      children: Number(formData.children || 0),
      infants: Number(formData.infants || 0),
      entry_ticket_needed: !!formData.entry_ticket_needed,
      snow_world_needed: !!formData.snow_world_needed,
      food_plan: formData.food_plan || "None",
      extra_food: formData.extra_food || {
        breakfast: false,
        lunchVeg: false,
        lunchNonVeg: false,
      },
      hotel_name: formData.hotel_name || "",
      hotel_id: formData.hotel_id || null,
      rooms: Number(formData.rooms || 0),
      extra_beds: Number(formData.extra_beds || 0),
      guideNeeded: !!formData.guideNeeded,
      agent_commission: Number(formData.agent_commission || 0),
      base_total: Number(formData.base_total || 0),
      total_amount: Number(formData.total_amount || 0),
    };

    try {
      if (typeof updateBooking === "function") {
        await updateBooking(editedBooking._id, payload);
      } else {
        console.warn("updateBooking is not a function in store");
      }
      closeModal();
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  };

  const handleBookingConfirm = async () => {
    if (selectedBooking.status === "confirmed") {
      setSelectedBooking(null);
      return;
    }
    try {
      await confirmBooking(selectedBooking._id);
      setSelectedBooking(null);
    } catch (error) {}
  };

  const handleBookingCancel = async () => {
    if (selectedBooking.status === "cancelled") {
      setSelectedBooking(null);
      return;
    }
    try {
      await cancelBooking(selectedBooking._id);
      setSelectedBooking(null);
    } catch (error) {}
  };

  // Close edit modal
  const closeModal = () => {
    setEditedBooking(null);
    setFormData(defaultForm);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStateFilter("");
    setPage(1);
  };

  // small helper to format numbers/currency
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "—");

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      {/* <Sidebar active="Destinations" /> */}

      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-balance">
                Bookings Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all travel bookings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat?.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat?.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat?.color}`}>
                      {stat?.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Filter by State
                  </label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All states</SelectItem>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Filter by Name or Email
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Full name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Grid */}
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card
                key={booking?._id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Booking ID & Status */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2 overflow-hidden">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Booking ID
                        </p>
                        <p className="font-mono text-sm font-medium text-gray-900">
                          {booking?._id}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking?.package_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatTimestamp(booking?.createdAt)}
                        </p>
                        <p>
                          <Badge
                            className={`${getStatusColor(
                              booking?.status
                            )} capitalize`}
                          >
                            {booking?.status}
                          </Badge>
                        </p>
                        <p>
                          <Badge
                            className={`${
                              booking?.source === "defaultPackageBooking"
                                ? "bg-red-300"
                                : "bg-blue-300"
                            }`}
                          >
                            {booking?.source === "booking"
                              ? "Normal Package"
                              : "Default Package"}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {/* Agent Contact Info */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Agent Contact
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking?.contact?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking?.contact?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking?.contact?.mobile_number}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {booking?.contact?.state}
                        </div>
                      </div>
                    </div>

                    {/* Client Contact Info */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Client Contact
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking?.client_contact?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking?.client_contact?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking?.client_contact?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Package Info */}
                    {/* <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Package
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking?.package_name}
                        </p>
                        {/* <div className="flex items-center gap-1 text-sm text-cyan-600">
                                              <MapPin className="w-3 h-3" />
                                              {booking.package.destination}
                                          </div> */}
                    {/* </div>
                    </div> */}

                    {/* Pricing & Actions */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹
                          {booking?.pricing?.total_amount?.toLocaleString() ??
                            0}
                        </p>
                        <p className="text-xs text-gray-500">
                          Base: ₹
                          {booking?.pricing?.base_total?.toLocaleString() ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          Commission: ₹
                          {booking?.pricing?.agent_commission?.toLocaleString() ??
                            0}
                        </p>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditedBooking(booking);
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletedBooking(booking);
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {bookings?.length === 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or create a new booking.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>

            {Array.from(
              { length: bookingPagination.totalPages || 1 },
              (_, i) => i + 1
            )
              .filter(
                (p) =>
                  p === 1 ||
                  p === bookingPagination.totalPages ||
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

            <Button
              variant="outline"
              size="sm"
              disabled={page === (bookingPagination.totalPages || 1)}
              onClick={() =>
                setPage((p) =>
                  Math.min(bookingPagination.totalPages || 1, p + 1)
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {/* VIEW Modal */}
      {selectedBooking && selectedBooking.source === "booking" && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            <Card>
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <EyeIcon className="w-5 h-5 text-primary" />
                  Booking Details
                </CardTitle>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-600 hover:text-red-500" />
                </button>
              </CardHeader>

              {/* Content */}
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Agent Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedBooking?.contact?.name ?? "—"}
                    </p>
                    <p>
                      <strong>State:</strong>{" "}
                      {selectedBooking?.contact?.state ?? "—"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedBooking?.contact?.email ?? "—"}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{" "}
                      {selectedBooking?.contact?.mobile_number ?? "—"}
                    </p>
                  </div>
                  <h3 className="font-semibold mt-4 mb-2">
                    Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedBooking?.client_contact?.name ?? "—"}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{" "}
                      {selectedBooking?.client_contact?.phone ?? "—"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedBooking?.client_contact?.email ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Booking ID:</strong> {selectedBooking?._id ?? "—"}
                    </p>
                    <p>
                      <strong>Package:</strong>{" "}
                      {selectedBooking?.package_name ?? "—"}
                    </p>
                    <p>
                      <strong>Pickup:</strong>{" "}
                      {selectedBooking?.dates?.pickup_date
                        ? formatDateDisplay(selectedBooking.dates.pickup_date)
                        : "—"}{" "}
                      {selectedBooking?.dates?.pickup_time
                        ? `@ ${formatTimeDisplay(
                            selectedBooking.dates.pickup_time
                          )}`
                        : ""}
                    </p>
                    <p>
                      <strong>Pickup Location:</strong>{" "}
                      {selectedBooking?.dates?.pickup_location ?? "—"}
                    </p>
                    <p>
                      <strong>Drop:</strong>{" "}
                      {selectedBooking?.dates?.drop_date
                        ? formatDateDisplay(selectedBooking.dates.drop_date)
                        : "—"}{" "}
                      {selectedBooking?.dates?.drop_time
                        ? `@ ${formatTimeDisplay(
                            selectedBooking.dates.drop_time
                          )}`
                        : ""}
                    </p>
                    <p>
                      <strong>Drop Location:</strong>{" "}
                      {selectedBooking?.dates?.drop_location ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Guests & Extras */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Guests & Extras</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Adults:</strong>{" "}
                      {selectedBooking?.guests?.adults_total ?? "—"}
                    </p>
                    <p>
                      <strong>Children:</strong>{" "}
                      {selectedBooking?.guests?.children ?? "—"}
                    </p>
                    <p>
                      <strong>Infants:</strong>{" "}
                      {selectedBooking?.guests?.infants ?? "—"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking?.extras?.entry_ticket_needed && (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Entry Ticket
                        </span>
                      )}
                      {selectedBooking?.extras?.snow_world_needed && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          Snow World
                        </span>
                      )}
                      {selectedBooking?.extras?.guideNeeded && (
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          Guide Needed
                        </span>
                      )}
                      {selectedBooking?.extras?.breakfast && (
                        <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                          Breakfast
                        </span>
                      )}
                      {selectedBooking?.extras?.lunchVeg && (
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          Lunch (Veg)
                        </span>
                      )}
                      {selectedBooking?.extras?.lunchNonVeg && (
                        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          Lunch (Non-Veg)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hotel */}
                {selectedBooking.hotel_id ? (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Hotel</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Hotel:</strong>{" "}
                        {selectedBooking?.hotel?.hotel_name ?? "—"}
                      </p>
                      <p>
                        <strong>Rooms:</strong>{" "}
                        {selectedBooking?.hotel?.rooms ?? "—"}
                      </p>
                      <p>
                        <strong>Extra Beds:</strong>{" "}
                        {selectedBooking?.hotel?.extra_beds ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Hotel</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>Hotel not selected</p>
                    </div>
                  </div>
                )}

                {/* Vehicle */}
                {selectedBooking.vehicle_id ? (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Vehicle</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Vehicle:</strong>{" "}
                        {selectedBooking?.vehicle_name ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Vehicle</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>Vehicle not selected</p>
                    </div>
                  </div>
                )}

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Base Total:</strong>{" "}
                      {fmt(selectedBooking?.pricing?.base_total ?? 0)}
                    </p>
                    <p>
                      <strong>Agent Commission:</strong>{" "}
                      {fmt(selectedBooking?.pricing?.agent_commission ?? 0)}
                    </p>
                    <p className="text-lg font-bold">
                      <strong>Total Amount:</strong>{" "}
                      {fmt(selectedBooking?.pricing?.total_amount ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Footer with Cancel */}
                <div className="flex justify-between pt-4 border-t">
                  <label className="flex gap-2">
                    <span className="font-medium text-sm text-gray-700">
                      Booking Status
                    </span>

                    <select
                      name="status"
                      value={selectedBooking.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;

                        // Prevent changing if still quoted
                        if (selectedBooking.status === "quoted") {
                          alert(
                            "Booking is still quoted — admin cannot change status until user confirms."
                          );
                          return;
                        }

                        // Prevent admin from setting to confirmed directly
                        if (newStatus === "confirmed") {
                          toast.error(
                            "Admin cannot change booking to 'confirmed'."
                          );
                          return;
                        }
                        if (newStatus === "quoted") {
                          toast.error(
                            "Admin cannot change booking to 'quoted'."
                          );
                          return;
                        }

                        // Update UI instantly
                        setSelectedBooking((prev) => ({
                          ...prev,
                          status: newStatus,
                        }));

                        // Call backend API
                        changeState(selectedBooking._id, newStatus);
                      }}
                      disabled={selectedBooking.status === "quoted"}
                      className={`border rounded-lg px-3 py-2 w-full cursor-pointer
                        ${
                          selectedBooking.status === "quoted"
                            ? "bg-yellow-100 cursor-not-allowed"
                            : ""
                        }
                        ${
                          selectedBooking.status === "confirmed"
                            ? "bg-green-50"
                            : ""
                        }
                        ${
                          selectedBooking.status === "pending"
                            ? "bg-yellow-50"
                            : ""
                        }
                        ${
                          selectedBooking.status === "booked"
                            ? "bg-blue-50"
                            : ""
                        }
                        ${
                          selectedBooking.status === "cancelled"
                            ? "bg-red-50"
                            : ""
                        }
                      `}
                    >
                      {/* Always show all possible statuses for admin visibility */}
                      <option value="quoted">Quoted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="booked">Booked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Info messages */}
                    {selectedBooking.status === "quoted" && (
                      <p className="text-xs text-yellow-700">
                        ⚠️ Booking is still <b>quoted</b>. Admin cannot change
                        the status until the user confirms.
                      </p>
                    )}

                    {selectedBooking.status === "confirmed" && (
                      <p className="text-xs text-green-700">
                        ✅ Booking is <b>confirmed</b>. Admin can now update to
                        Pending, Booked, or Cancelled.
                      </p>
                    )}
                  </label>

                  {/* <button
                    onClick={handleBookingConfirm}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-sm font-semibold"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={handleBookingCancel}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-sm font-semibold"
                  >
                    Cancel Booking
                  </button> */}
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedBooking &&
        selectedBooking?.source === "defaultPackageBooking" && (
          <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
              <Card>
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5 text-primary" />
                    Booking Details
                  </CardTitle>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Close booking details"
                  >
                    <X size={20} className="text-gray-600 hover:text-red-500" />
                  </button>
                </CardHeader>

                {/* Content */}
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedBooking?.contact?.name ?? "—"}
                      </p>
                      <p>
                        <strong>State:</strong>{" "}
                        {selectedBooking?.contact?.state ?? "—"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedBooking?.contact?.email ?? "—"}
                      </p>
                      <p>
                        <strong>Mobile:</strong>{" "}
                        {selectedBooking?.contact?.mobile_number ?? "—"}
                      </p>
                    </div>
                    <h3 className="font-semibold mt-4 mb-2">
                      Client Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedBooking?.client_contact?.name ?? "—"}
                      </p>
                      <p>
                        <strong>Mobile:</strong>{" "}
                        {selectedBooking?.client_contact?.phone ?? "—"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedBooking?.client_contact?.email ?? "—"}
                      </p>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Booking Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Booking ID:</strong>{" "}
                        {selectedBooking?._id ?? "—"}
                      </p>
                      <p>
                        <strong>Package:</strong>{" "}
                        {selectedBooking?.package_name ?? "—"}
                      </p>

                      <div>
                        <p>
                          <strong>Pickup:</strong>{" "}
                          {formatDateDisplay(
                            selectedBooking?.dates?.outbound?.pickup_date
                          )}
                        </p>
                        <p>
                          <strong>Flight details:</strong>{" "}
                          {selectedBooking?.dates?.outbound?.flight ?? "—"}
                        </p>
                        <p>
                          <strong>Departure:</strong>{" "}
                          {formatTimeDisplay(
                            selectedBooking?.dates?.outbound?.departureTime
                          )}
                        </p>
                        <p>
                          <strong>Arrival:</strong>{" "}
                          {formatTimeDisplay(
                            selectedBooking?.dates?.outbound?.arrivalTime
                          )}
                        </p>
                      </div>

                      <div>
                        <p>
                          <strong>Drop:</strong>{" "}
                          {formatDateDisplay(
                            selectedBooking?.dates?.return?.drop_date
                          )}
                        </p>
                        <p>
                          <strong>Flight details:</strong>{" "}
                          {selectedBooking?.dates?.return?.flight ?? "—"}
                        </p>
                        <p>
                          <strong>Departure:</strong>{" "}
                          {formatTimeDisplay(
                            selectedBooking?.dates?.return?.departureTime
                          )}
                        </p>
                        <p>
                          <strong>Arrival:</strong>{" "}
                          {formatTimeDisplay(
                            selectedBooking?.dates?.return?.arrivalTime
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guests & Extras */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Guests & Extras</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Adults:</strong>{" "}
                        {selectedBooking?.guests?.adults_total ?? "—"}
                      </p>
                      <p>
                        <strong>Children With Bed:</strong>{" "}
                        {selectedBooking?.guests?.children_with_bed ?? "—"}
                      </p>
                      <p>
                        <strong>Children Without Bed:</strong>{" "}
                        {selectedBooking?.guests?.children_without_bed ?? "—"}
                      </p>
                      <p>
                        <strong>Infants:</strong>{" "}
                        {selectedBooking?.guests?.infants ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>
                        <strong>Base Total:</strong>{" "}
                        {fmt(selectedBooking?.pricing?.base_total)}
                      </p>
                      <p>
                        <strong>Agent Commission:</strong>{" "}
                        {fmt(selectedBooking?.pricing?.agent_commission)}
                      </p>
                      <p className="text-lg font-bold">
                        <strong>Total Amount:</strong>{" "}
                        {fmt(selectedBooking?.pricing?.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Footer with actions */}
                  <div className="flex justify-between pt-4 border-t">
                    <label className="flex gap-2">
                      <span className="font-medium text-sm text-gray-700">
                        Booking Status
                      </span>

                      <select
                        name="status"
                        value={selectedBooking.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;

                          // Prevent changing if still quoted
                          if (selectedBooking.status === "quoted") {
                            alert(
                              "Booking is still quoted — admin cannot change status until user confirms."
                            );
                            return;
                          }

                          // Prevent admin from setting to confirmed directly
                          if (newStatus === "confirmed") {
                            toast.error(
                              "Admin cannot change booking to 'confirmed'."
                            );
                            return;
                          }
                          if (newStatus === "quoted") {
                            toast.error(
                              "Admin cannot change booking to 'quoted'."
                            );
                            return;
                          }

                          // Update UI instantly
                          setSelectedBooking((prev) => ({
                            ...prev,
                            status: newStatus,
                          }));

                          // Call backend API
                          changeState(selectedBooking._id, newStatus);
                        }}
                        disabled={selectedBooking.status === "quoted"}
                        className={`border rounded-lg px-3 py-2 w-full cursor-pointer
                          ${
                            selectedBooking.status === "quoted"
                              ? "bg-yellow-100 cursor-not-allowed"
                              : ""
                          }
                          ${
                            selectedBooking.status === "confirmed"
                              ? "bg-green-50"
                              : ""
                          }
                          ${
                            selectedBooking.status === "pending"
                              ? "bg-yellow-50"
                              : ""
                          }
                          ${
                            selectedBooking.status === "booked"
                              ? "bg-blue-50"
                              : ""
                          }
                          ${
                            selectedBooking.status === "cancelled"
                              ? "bg-red-50"
                              : ""
                          }
                        `}
                      >
                        {/* Always show all possible statuses for admin visibility */}
                        <option value="quoted">Quoted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {/* Info messages */}
                      {selectedBooking.status === "quoted" && (
                        <p className="text-xs text-yellow-700">
                          ⚠️ Booking is still <b>quoted</b>. Admin cannot change
                          the status until the user confirms.
                        </p>
                      )}

                      {selectedBooking.status === "confirmed" && (
                        <p className="text-xs text-green-700">
                          ✅ Booking is <b>confirmed</b>. Admin can now update
                          to Pending, Booked, or Cancelled.
                        </p>
                      )}
                    </label>

                    {/* 
                    <button
                      onClick={handleBookingConfirm}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 text-sm font-semibold"
                    >
                      Confirm Booking
                    </button> */}

                    <div className="flex gap-2">
                      {/* <button
                        onClick={handleBookingCancel}
                        className="bg-yellow-600 text-white px-5 py-2.5 rounded hover:bg-yellow-700 text-sm font-semibold"
                      >
                        Cancel Booking
                      </button> */}

                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {deletedBooking && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            <div className="flex justify-between items-center px-6 py-5 bg-gray-300">
              <h3 className="text-2xl font-semibold text-gray-800">
                Confirm Delete
              </h3>
              <button onClick={() => setDeletedBooking(null)} className="p-1">
                <X size={24} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 text-gray-700 text-base">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </div>

            <div className="flex justify-center gap-4 p-5">
              <button
                onClick={() => setDeletedBooking(null)}
                className="bg-gray-300 text-gray-800 px-5 py-2.5 rounded hover:bg-gray-400 text-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletedBooking?._id) deleteBooking(deletedBooking?._id);
                  setDeletedBooking(null);
                }}
                className="bg-red-600 text-white px-5 py-2.5 rounded hover:bg-red-700 text-lg font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal (includes new fields) */}
      {editedBooking && editedBooking.source === "booking" && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            <div className="flex justify-between items-center px-6 py-5 bg-gray-100">
              <h3 className="text-2xl font-semibold text-gray-800">
                Edit Booking
              </h3>
              <button onClick={closeModal}>
                <X size={24} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 text-base text-gray-700"
            >
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Agent Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email"
                    className="border rounded-lg px-3 py-2 w-full"
                    disabled
                  />
                  <input
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number}
                    placeholder="Mobile Number"
                    className="border rounded-lg px-3 py-2 w-full"
                    disabled
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 mt-4 text-lg">
                  Client Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    placeholder="client Name"
                    className="border rounded-lg px-3 py-2 w-full"
                    disabled
                  />
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    placeholder="Client Email"
                    className="border rounded-lg px-3 py-2 w-full"
                    disabled
                  />
                  <input
                    type="text"
                    name="client_phone"
                    value={formData.client_phone}
                    placeholder="Client Number"
                    className="border rounded-lg px-3 py-2 w-full"
                    disabled
                  />
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Booking Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label htmlFor="package_name">
                    Package{" "}
                    <input
                      type="text"
                      id="package_name"
                      value={formData.package_name}
                      placeholder="Package Name"
                      className="border rounded-lg px-3 py-2 w-full"
                      disabled
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span>Vehicle</span>
                    <select
                      name="vehicle_id"
                      value={formData.vehicle_id} // this will hold the _id
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedVehicle = vehicles.find(
                          (v) => v._id === selectedId
                        );

                        setFormData((prev) => ({
                          ...prev,
                          vehicle_id: selectedId,
                          vehicle_name: selectedVehicle
                            ? selectedVehicle.name
                            : "",
                        }));
                      }}
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      {/* Current vehicle from formData */}
                      {formData.vehicle_id && (
                        <option value={formData.vehicle_id}>
                          {formData.vehicle_name}
                        </option>
                      )}

                      {/* All vehicles from DB */}
                      {vehicles.map(
                        (vehicle) =>
                          // Avoid duplicate if current vehicle is in the list
                          vehicle._id !== formData.vehicle_id && (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.name}
                            </option>
                          )
                      )}
                    </select>
                  </label>

                  <label>
                    pickup date
                    <input
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    pickup time
                    <input
                      type="time"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    drop date
                    <input
                      type="date"
                      name="drop_date"
                      value={formData.drop_date}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    drop time
                    <input
                      type="time"
                      name="drop_time"
                      value={formData.drop_time}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    pickup location
                    <input
                      type="text"
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    drop location
                    <input
                      type="text"
                      name="drop_location"
                      value={formData.drop_location}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                </div>
              </div>

              {/* Guests */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Guests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="number"
                    name="adults_total"
                    value={formData.adults_total}
                    onChange={handleChange}
                    placeholder="Adults"
                    className="border rounded-lg px-3 py-2 w-full"
                    min="0"
                  />
                  <input
                    type="number"
                    name="children"
                    value={formData.children}
                    onChange={handleChange}
                    placeholder="Children"
                    className="border rounded-lg px-3 py-2 w-full"
                    min="0"
                  />
                  <input
                    type="number"
                    name="infants"
                    value={formData.infants}
                    onChange={handleChange}
                    placeholder="Infants"
                    className="border rounded-lg px-3 py-2 w-full"
                    min="0"
                  />
                </div>
              </div>

              {/* Options & extras */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Options & Extras
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="entry_ticket_needed"
                      checked={!!formData.entry_ticket_needed}
                      onChange={handleCheckbox}
                    />{" "}
                    <span>Entry Ticket</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="snow_world_needed"
                      checked={!!formData.snow_world_needed}
                      onChange={handleCheckbox}
                    />{" "}
                    <span>Snow World</span>
                  </label>
                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      name="guideNeeded"
                      checked={!!formData.guideNeeded}
                      onChange={handleCheckbox}
                    />{" "}
                    <span>Guide needed</span>
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="breakfast"
                      checked={!!formData.extra_food.breakfast}
                      onChange={handleExtraFoodChange}
                    />{" "}
                    <span>Breakfast</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="lunchVeg"
                      checked={!!formData.extra_food.lunchVeg}
                      onChange={handleExtraFoodChange}
                    />{" "}
                    <span>Lunch (Veg)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="lunchNonVeg"
                      checked={!!formData.extra_food.lunchNonVeg}
                      onChange={handleExtraFoodChange}
                    />{" "}
                    <span>Lunch (Non-Veg)</span>
                  </label>
                </div>
              </div>

              {/* Hotel Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Hotel Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-2">
                    <span>Hotel</span>
                    <select
                      name="hotel_id"
                      value={formData.hotel_id} // stores the _id
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedHotel = hotels.find(
                          (h) => h._id === selectedId
                        );

                        setFormData((prev) => ({
                          ...prev,
                          hotel_id: selectedId,
                          hotel: selectedHotel
                            ? {
                                ...prev.hotel,
                                hotel_name: selectedHotel.hotel_name,
                              }
                            : { ...prev.hotel },
                        }));
                      }}
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      {/* Show current hotel from formData */}
                      {formData.hotel_id && formData.hotel?.hotel_name && (
                        <option value={formData.hotel_id}>
                          {formData.hotel.hotel_name}
                        </option>
                      )}

                      {/* All hotels from DB (skip the current one to avoid duplicate) */}
                      {hotels.map(
                        (hotel) =>
                          hotel._id !== formData.hotel_id && (
                            <option key={hotel._id} value={hotel._id}>
                              {hotel.name}
                            </option>
                          )
                      )}
                    </select>
                  </label>

                  <label>
                    Rooms
                    <input
                      type="number"
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                      placeholder="Rooms"
                      className="border rounded-lg px-3 py-2 w-full"
                      min="0"
                    />
                  </label>
                  <label>
                    Extra Bed
                    <input
                      type="number"
                      name="extra_beds"
                      value={formData.extra_beds}
                      onChange={handleChange}
                      placeholder="Extra beds"
                      className="border rounded-lg px-3 py-2 w-full"
                      min="0"
                    />
                  </label>
                  <label>
                    Food Plan
                    <input
                      type="text"
                      name="food_plan"
                      value={formData.food_plan}
                      onChange={handleChange}
                      placeholder="food plan"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Payment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label>
                    Base Total
                    <input
                      type="text"
                      name="base_total"
                      value={formData.base_total}
                      onChange={handleChange}
                      placeholder="Base Total"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    Agent Commission
                    <input
                      type="text"
                      name="agent_commission"
                      value={formData.agent_commission}
                      onChange={handleChange}
                      placeholder="Agent Commission"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                  <label>
                    Total Amount
                    <input
                      type="text"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleChange}
                      placeholder="Total Amount"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-800 px-5 py-2.5 rounded hover:bg-gray-400 text-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-5 py-2.5 rounded hover:bg-green-700 text-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editedBooking && editedBooking.source === "defaultPackageBooking" && (
        <DefaultPackageBookingEditFromSelected
          editedBooking={editedBooking}
          setEditedBooking={setEditedBooking}
          updateDefaultBooking={updateDefaultBooking}
        />
      )}
    </div>
  );
}
