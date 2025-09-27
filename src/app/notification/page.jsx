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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useBookingStore from "@/stores/useBookingStore";
import { Button } from "@/components/ui/button";
import Header from "../components/admin/Hearder";

export default function NotificationPage() {
  const [selection, setSelection] = useState("notification");
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
    getHotelsByRating?.(2);
  }, [getAdminNotifications, getBookings, getPackages, getHotelsByRating]);

  const getTypeIcon = (type) => {
    switch ((type || "").toString().toLowerCase()) {
      case "booking":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "system":
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <Settings className="h-5 w-5 text-blue-500" />;
    }
  };

  // ---------------- Display components ----------------
  // These return JSX for a booking. We call them like DisplayBooking(booking)

  const DisplayBooking = (booking) => {
    if (!booking) return null;
    return (
      <CardContent
        key={booking._id}
        id={booking._id}
        className="relative space-y-6 border p-0 rounded-lg bg-white shadow-lg overflow-hidden"
      >
        {/* top bar: id + download */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600">ID</span>
            <span className="text-sm font-mono text-gray-800">{`B2B${String(booking._id ?? "").slice(0, 6)}....`}</span>
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
              <p className="font-medium mb-3">{booking.package_name ?? "-"}</p>
              <div className="mb-3 text-sm">
                <div className="mb-1"><strong>Pickup</strong></div>
                <div className="ml-2">Date: {formatDate(booking.dates?.pickup_date)}</div>
                <div className="ml-2">Time: {formatTime(booking.dates?.pickup_time)}</div>
                <div className="ml-2">Location: {booking.dates?.pickup_location ?? "-"}</div>
              </div>
              <div className="mb-3 text-sm">
                <div className="mb-1"><strong>Drop</strong></div>
                <div className="ml-2">Date: {formatDate(booking.dates?.drop_date)}</div>
                <div className="ml-2">Time: {formatTime(booking.dates?.drop_time)}</div>
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
                <div className="font-medium">{booking.hotel?.hotel_name ?? "-"}</div>
                <div>Rooms: {booking.hotel?.rooms ?? "-"}</div>
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
              <div>
                Extra Food:{" "}
                {[
                  booking.extras?.breakfast ? "Breakfast" : null,
                  booking.extras?.lunchNonVeg ? "Lunch (Non-veg)" : null,
                  booking.extras?.lunchVeg ? "Lunch (Veg)" : null,
                ].filter(Boolean).join(", ") || "None"}
              </div>
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
    );
  };

  const DisplayDefaultBooking = (booking) => {
    if (!booking) return null;
    return (
      <CardContent
        key={booking._id}
        id={booking._id}
        className="relative space-y-6 border p-0 rounded-lg bg-white shadow-lg overflow-hidden"
      >
        {/* top bar: id + download */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-600">ID</span>
            <span className="text-sm font-mono text-gray-800">{`B2B${String(booking._id ?? "").slice(0, 6)}....`}</span>
            <span className="ml-2 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">Default Package</span>
            
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
            <Button size="sm" variant="ghost" onClick={() => generateDefaultPackagePdf(booking)} aria-label={`Download ${booking._id}`}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 bg-white">
          {/* contact */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Contact</h3>
            <div className="text-sm">
              <div className="font-medium">{booking.contact?.name ?? "-"}</div>
              <div>Email: {booking.contact?.email ?? "-"}</div>
              <div>Mobile: {booking.contact?.mobile_number ?? "-"}</div>
              <div>State: {booking.contact?.state ?? "-"}</div>
            </div>
          </div>

          {/* package */}
          <div className="border rounded-lg p-4 bg-gray-50 mt-4">
            <h3 className="font-semibold mb-2">Package</h3>
            <p className="font-medium mb-3">{booking.package_name ?? "-"}</p>
            <div className="text-sm">
              <div>Package ID: {booking.package_id ? String(booking.package_id) : "—"}</div>
            </div>
          </div>

          {/* outbound / return dates */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Outbound</h3>
              <div className="text-sm">
                <div>Date: {formatDate(booking.dates?.outbound?.pickup_date)}</div>
                <div>Departure: {formatTime(booking.dates?.outbound?.departureTime)}</div>
                <div>Arrival: {formatTime(booking.dates?.outbound?.arrivalTime)}</div>
                <div>Flight: {booking.dates?.outbound?.flight ?? "—"}</div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Return</h3>
              <div className="text-sm">
                <div>Date: {formatDate(booking.dates?.return?.drop_date)}</div>
                <div>Departure: {formatTime(booking.dates?.return?.departureTime)}</div>
                <div>Arrival: {formatTime(booking.dates?.return?.arrivalTime)}</div>
                <div>Flight: {booking.dates?.return?.flight ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* travelers */}
          <div className="border rounded-lg p-4 bg-gray-50 mt-4">
            <h3 className="font-semibold mb-2">Travelers</h3>
            <div className="text-sm">
              <div>Adults: {booking.guests?.adults_total ?? 0}</div>
              <div>Children (with bed): {booking.guests?.children_with_bed ?? 0}</div>
              <div>Children (without bed): {booking.guests?.children_without_bed ?? 0}</div>
              <div>Infants: {booking.guests?.infants ?? 0}</div>
            </div>
          </div>

          {/* summary / pricing */}
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
    );
  };

  // ---------------- Formatting helpers ----------------
  // show only date (e.g. 11 Sept 2025)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // show only time (e.g. 12:00 AM) — uses en-GB with hour12 true
  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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

  // ---------------- PDF generation (full implementations) ----------------

  // generatePdf (booking)
  const generatePdf = async (booking, options = {}) => {
    try {
      // helper - fetch image as base64
      const fetchImageAsBase64 = async (url) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.warn("Failed to fetch image:", url, err);
          return null;
        }
      };

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;

      let y = margin;

      const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
      const fmtCurrency = (amount) => (amount != null ? `Rs. ${Number(amount).toLocaleString("en-IN")}` : "-");
      const wrapLines = (text, maxWidth) => doc.splitTextToSize(String(text ?? "-"), Math.max(10, maxWidth));

      const ensureSpace = (needed) => {
        if (y + needed > pageHeight - margin - 20) {
          doc.addPage();
          y = margin;
          renderHeader();
        }
      };

      const renderHeader = () => {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(booking.package_name || "Booking Details", pageWidth / 2, y, { align: "center" });
        y += 10;
      };

      const renderFooter = () => {
        const footerY = pageHeight - 20;
        doc.setFontSize(8);
        doc.text(`Support: ${options.supportEmail || "support@example.com"} | ${options.supportPhone || "+91 12345 67890"}`, margin, footerY);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, footerY, { align: "right" });
      };

      const addSectionTitle = (title) => {
        ensureSpace(8);
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setDrawColor(0);
        y += 4;
      };

      const addInlineKV = (label, value) => {
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        const labelWidth = doc.getTextWidth(`${label}:`);
        const valueX = margin + labelWidth + 4;
        const lines = wrapLines(value, contentWidth - (valueX - margin));
        ensureSpace(lines.length * 6);
        doc.text(`${label}:`, margin, y);
        doc.setFont(undefined, "normal");
        doc.text(lines, valueX, y);
        y += lines.length * 6 + 2;
      };

      renderHeader();

      addSectionTitle("Customer Details");
      addInlineKV("Name", booking.contact?.name ?? "-");
      addInlineKV("Email", booking.contact?.email ?? "-");
      addInlineKV("Phone", booking.contact?.mobile_number ?? "-");
      addInlineKV("State", booking.contact?.state ?? "-");

      addSectionTitle("Package & Travel Dates");
      addInlineKV("Package", booking.package_name ?? "-");
      addInlineKV("Pickup Date", fmtDate(booking.dates?.pickup_date));
      addInlineKV("Pickup Time", booking.dates?.pickup_time ?? "-");
      addInlineKV("Pickup Location", booking.dates?.pickup_location ?? "-");
      addInlineKV("Drop Date", fmtDate(booking.dates?.drop_date));
      addInlineKV("Drop Time", booking.dates?.drop_time ?? "-");
      addInlineKV("Drop Location", booking.dates?.drop_location ?? "-");

      addSectionTitle("Guests");
      addInlineKV("Adults", booking.guests?.adults_total ?? 0);
      addInlineKV("Children", booking.guests?.children ?? 0);
      addInlineKV("Infants", booking.guests?.infants ?? 0);

      addSectionTitle("Extras");
      addInlineKV("Entry Ticket", booking.extras?.entry_ticket_needed ? "Yes" : "No");
      addInlineKV("Snow World", booking.extras?.snow_world_needed ? "Yes" : "No");
      addInlineKV("Breakfast", booking.extras?.breakfast ? "Yes" : "No");
      addInlineKV("Lunch Veg", booking.extras?.lunchVeg ? "Yes" : "No");
      addInlineKV("Lunch Non-Veg", booking.extras?.lunchNonVeg ? "Yes" : "No");
      addInlineKV("Guide Needed", booking.extras?.guideNeeded ? "Yes" : "No");

      if (booking.hotel_id) {
        addSectionTitle("Hotel Details");
        addInlineKV("Hotel", booking.hotel?.hotel_name ?? "-");
        addInlineKV("Rooms", booking.hotel?.rooms ?? 0);
        addInlineKV("Extra Beds", booking.hotel?.extra_beds ?? 0);
        addInlineKV("Food Plan", booking.hotel?.food_plan ?? "-");

        const hotel = hotels?.find((h) => String(h._id) === String(booking.hotel_id));
        if (hotel?.imageUrl) {
          const base64Img = await fetchImageAsBase64(hotel.imageUrl);
          if (base64Img) {
            const imgHeight = 40;
            const imgWidth = contentWidth;
            ensureSpace(imgHeight + 6);
            doc.addImage(base64Img, "JPEG", margin, y, imgWidth, imgHeight);
            y += imgHeight + 8;
          }
        }
      }

      addSectionTitle("Payment Summary");
      addInlineKV("Agent Commission", fmtCurrency(booking.pricing?.agent_commission));
      addInlineKV("Base Total", fmtCurrency(booking.pricing?.base_total));
      addInlineKV("Total Amount", fmtCurrency(booking.pricing?.total_amount));

      // Itinerary (from package data)
      const pkg = packages?.find((p) => String(p._id) === String(booking.package_id));
      if (pkg && Array.isArray(pkg.itineraries) && pkg.itineraries.length) {
        addSectionTitle("Itinerary");
        for (const it of pkg.itineraries) {
          const lineHeight = 6;
          const normalSize = 10;
          ensureSpace(lineHeight * 3);
          doc.setFontSize(normalSize);
          doc.setFont(undefined, "bold");
          doc.text(`Day ${it.day_number ?? "-"}`, margin, y);
          y += lineHeight;
          doc.setFont(undefined, "normal");
          const descLines = wrapLines(it.description || "-", contentWidth);
          doc.text(descLines, margin, y);
          y += descLines.length * lineHeight + 2;
          if (it.image) {
            const base64Img = await fetchImageAsBase64(it.image);
            if (base64Img) {
              const imgHeight = 40;
              const imgWidth = contentWidth;
              ensureSpace(imgHeight + 6);
              doc.addImage(base64Img, "JPEG", margin, y, imgWidth, imgHeight);
              y += imgHeight + 8;
            }
          }
        }
      }

      renderFooter();

      // Page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" });
      }

      doc.save(`booking_${booking._id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      throw err;
    }
  };

  // generateDefaultPackagePdf (full)
  const generateDefaultPackagePdf = async (booking, options = {}) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;

      const titleSize = 16;
      const sectionTitleSize = 12;
      const normalSize = 10;
      const lineHeight = 6.8;
      const labelGap = 4;

      let y = margin;
      doc.setProperties({ title: `DefaultPackageBooking_${booking._id}` });

      const fmtDate = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      };

      const fmtDateTime = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      };

      const fmtCurrency = (amount) => (amount != null && amount !== "" ? `Rs. ${Number(amount).toLocaleString("en-IN")}` : "—");

      const ensureSpace = (needed) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const wrapLines = (text, maxWidth, fontSize = normalSize) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, "normal");
        return doc.splitTextToSize(String(text ?? "-"), Math.max(10, maxWidth));
      };

      const addInlineKV = (label, value) => {
        const labelText = `${label}:`;
        doc.setFontSize(normalSize);
        doc.setFont(undefined, "bold");
        const labelWidth = doc.getTextWidth(labelText);
        const valueX = margin + labelWidth + labelGap;
        const availWidth = contentWidth - (valueX - margin);
        const lines = wrapLines(value, availWidth);
        ensureSpace(lines.length * lineHeight);
        doc.text(labelText, margin, y);
        doc.setFont(undefined, "normal");
        doc.text(lines, valueX, y);
        y += lines.length * lineHeight + 2;
      };

      const addSectionTitle = (title) => {
        ensureSpace(lineHeight + 6);
        doc.setFontSize(sectionTitleSize);
        doc.setFont(undefined, "bold");
        doc.text(title, margin, y);
        y += lineHeight;
        doc.setDrawColor(200);
        doc.line(margin, y - lineHeight / 3, pageWidth - margin, y - lineHeight / 3);
        doc.setDrawColor(0);
        y += 4;
      };

      const fetchImageAsBase64 = async (url) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error("Image fetch failed:", url, err);
          return null;
        }
      };

      // ====== Content ======
      doc.setFontSize(titleSize);
      doc.setFont(undefined, "bold");
      doc.text(booking.package_name || "Default Package Booking", pageWidth / 2, y, { align: "center" });
      y += 12;

      addSectionTitle("Customer Details");
      addInlineKV("Name", booking.contact?.name ?? "-");
      addInlineKV("Email", booking.contact?.email ?? "-");
      addInlineKV("Mobile", booking.contact?.mobile_number ?? "-");
      addInlineKV("State", booking.contact?.state ?? "-");

      addSectionTitle("Package Details");
      addInlineKV("Package", booking.package_name ?? "-");

      addSectionTitle("Outbound Journey");
      addInlineKV("Pickup Date", fmtDate(booking.dates?.outbound?.pickup_date));
      addInlineKV("Departure Time", fmtDateTime(booking.dates?.outbound?.departureTime));
      addInlineKV("Arrival Time", fmtDateTime(booking.dates?.outbound?.arrivalTime));
      addInlineKV("Flight", booking.dates?.outbound?.flight ?? "-");

      addSectionTitle("Return Journey");
      addInlineKV("Drop Date", fmtDate(booking.dates?.return?.drop_date));
      addInlineKV("Departure Time", fmtDateTime(booking.dates?.return?.departureTime));
      addInlineKV("Arrival Time", fmtDateTime(booking.dates?.return?.arrivalTime));
      addInlineKV("Flight", booking.dates?.return?.flight ?? "-");

      addSectionTitle("Travelers");
      addInlineKV("Adults", booking.guests?.adults_total ?? 0);
      addInlineKV("Children With Bed", booking.guests?.children_with_bed ?? 0);
      addInlineKV("Children Without Bed", booking.guests?.children_without_bed ?? 0);
      addInlineKV("Infants", booking.guests?.infants ?? 0);

      addSectionTitle("Payment Summary");
      const payRows = [
        ["Base Amount", fmtCurrency(booking.pricing?.base_total)],
        ["Agent Commission", fmtCurrency(booking.pricing?.agent_commission)],
        ["Total Payable", fmtCurrency(booking.pricing?.total_amount)],
      ];
      for (const [label, amount] of payRows) {
        ensureSpace(lineHeight);
        doc.setFontSize(normalSize);
        doc.setFont(undefined, label === "Total Payable" ? "bold" : "normal");
        doc.text(label, margin, y);
        doc.text(String(amount), pageWidth - margin, y, { align: "right" });
        y += lineHeight;
      }

      addSectionTitle("Status");
      addInlineKV("Booking Status", booking.status ?? "pending");

      // Itineraries from defaultPackages
      const pkg = defaultPackages?.find((p) => String(p._id) === String(booking.package_id));
      console.log(pkg)
      if (pkg && Array.isArray(pkg.itineraries) && pkg.itineraries.length) {
        addSectionTitle("Itinerary");
        for (const it of pkg.itineraries) {
          ensureSpace(lineHeight * 3);
          doc.setFontSize(normalSize);
          doc.setFont(undefined, "bold");
          doc.text(`Day ${it.day_number}`, margin, y);
          y += lineHeight;
          doc.setFont(undefined, "normal");
          const descLines = wrapLines(it.description, contentWidth);
          doc.text(descLines, margin, y);
          y += descLines.length * lineHeight + 2;
          if (it.image) {
            const base64Img = await fetchImageAsBase64(it.image);
            if (base64Img) {
              const imgHeight = 40;
              const imgWidth = contentWidth;
              ensureSpace(imgHeight + 6);
              doc.addImage(base64Img, "JPEG", margin, y, imgWidth, imgHeight);
              y += imgHeight + 8;
            }
          }
        }
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" });
      }

      doc.save(`default_booking_${booking._id}.pdf`);
    } catch (err) {
      console.error("Default Package PDF generation failed:", err);
      throw err;
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
        await generatePdf(previewBooking);
      } else {
        await generateDefaultPackagePdf(previewBooking);
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert(err?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Header />
      <div className="bg-white shadow-sm py-8 px-6">
        {/* Toggle */}
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
                <p className="text-gray-600 mt-1">You have {notifications?.length ?? 0} new notifications.</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-600" />
              </div>
            </div>

            <div className="space-y-4">
              {notifications?.map((notification) => (
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

            {(!notifications || notifications.length === 0) && (
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
              {bookings?.map((booking) => {
                return ((booking?.source || "").toString().toLowerCase() === "booking") ? (
                  DisplayBooking(booking)
                ) : (
                  DisplayDefaultBooking(booking)
                );
              })}

              {(!bookings || bookings.length === 0) && (
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
