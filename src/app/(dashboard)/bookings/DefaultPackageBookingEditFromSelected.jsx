"use client"
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

// ---------- Helpers ----------
const formatDateLocal = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const formatTimeLocal = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * combineDateTimeToISO:
 * - returns ISO string only when BOTH dateStr and timeStr are present (non-empty)
 * - otherwise returns null (so we don't send default "00:00")
 */
const combineDateTimeToISO = (dateStr, timeStr) => {
  if (!dateStr) return null;
  if (!timeStr || !String(timeStr).trim()) return null;
  const local = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
};

// deep clone helper
const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj || {}));

// ---------- Component ----------
export default function DefaultPackageBookingEditModal({
  editedBooking,
  setEditedBooking,
  onCancel, // optional callback if parent passes it
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);

  const defaultForm = {
    // read-only
    contact: { name: "", email: "", mobile_number: "", state: "" },
    package_id: "",
    package_name: "",

    // outbound
    outbound_pickup_date: "",
    outbound_departure_time: "",
    outbound_arrival_time: "",
    outbound_flight: "",

    // return
    return_drop_date: "",
    return_departure_time: "",
    return_arrival_time: "",
    return_flight: "",

    // guests
    adults_total: 1,
    children_with_bed: 0,
    children_without_bed: 0,
    infants: 0,

    // pricing
    agent_commission: 0,
    base_total: "",
    total_amount: "",

  };

  const [form, setForm] = useState(defaultForm);

  const closeModal = () => {
    // reset local form and notify parent to clear editedBooking
    setForm(defaultForm);
    setServerErrors(null);
    setErrors({});
    if (typeof setEditedBooking === "function") setEditedBooking(null);
    if (typeof onCancel === "function") onCancel();
  };

  // populate form when editedBooking changes; deep-clone to avoid accidental mutation
  useEffect(() => {
    if (!editedBooking) {
      setForm(defaultForm);
      setLoading(false);
      return;
    }

    const data = cloneDeep(editedBooking);
    setForm({
      contact: data.contact || { name: "", email: "", mobile_number: "", state: "" },
      package_id: data.package_id || "",
      package_name: data.package_name || "",

      // outbound
      outbound_pickup_date: formatDateLocal(data.dates?.outbound?.pickup_date || data.dates?.outbound?.pickup_date), // keep if already date-string
      outbound_departure_time: formatTimeLocal(data.dates?.outbound?.departureTime),
      outbound_arrival_time: formatTimeLocal(data.dates?.outbound?.arrivalTime),
      outbound_flight: data.dates?.outbound?.flight || "",

      // return
      return_drop_date: formatDateLocal(data.dates?.return?.drop_date || data.dates?.return?.drop_date),
      return_departure_time: formatTimeLocal(data.dates?.return?.departureTime),
      return_arrival_time: formatTimeLocal(data.dates?.return?.arrivalTime),
      return_flight: data.dates?.return?.flight || "",

      // guests
      adults_total: data.guests?.adults_total ?? 1,
      children_with_bed: data.guests?.children_with_bed ?? 0,
      children_without_bed: data.guests?.children_without_bed ?? 0,
      infants: data.guests?.infants ?? 0,

      // pricing
      agent_commission: data.pricing?.agent_commission ?? 0,
      base_total: data.pricing?.base_total ?? "",
      total_amount: data.pricing?.total_amount ?? "",

      type: data.type ?? "default",
    });

    setLoading(false);
  }, [editedBooking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleGuestChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val === "" ? "" : Number(val) }));
  };

  const validate = () => {
    const e = {};
    if (!form.adults_total || Number(form.adults_total) < 1) e.adults_total = "At least 1 adult is required";
    if (form.base_total === "" || Number.isNaN(Number(form.base_total))) e.base_total = "Base total required";
    if (form.total_amount === "" || Number.isNaN(Number(form.total_amount))) e.total_amount = "Total amount required";
    if (!form.outbound_pickup_date) e.outbound_pickup_date = "Pickup date required";
    if (!form.return_drop_date) e.return_drop_date = "Return/drop date required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * buildPatchPayload:
   * - Only includes fields that the user provided or changed.
   * - Date-only fields (pickup_date/drop_date) are kept as "YYYY-MM-DD".
   * - departureTime/arrivalTime are ISO datetimes only if both date + time provided.
   */
  const buildPatchPayload = (original, formValues) => {
    const payload = {};
    const dates = {};
    const outbound = {};
    const ret = {};

    // outbound date-only
    if (formValues.outbound_pickup_date) {
      // send as date-only string
      outbound.pickup_date = formValues.outbound_pickup_date;
    }
    // outbound times only if both date & time present
    const outDepISO = combineDateTimeToISO(formValues.outbound_pickup_date, formValues.outbound_departure_time);
    if (outDepISO) outbound.departureTime = outDepISO;
    const outArrISO = combineDateTimeToISO(formValues.outbound_pickup_date, formValues.outbound_arrival_time);
    if (outArrISO) outbound.arrivalTime = outArrISO;

    if (typeof formValues.outbound_flight === "string") {
      // only include if non-empty (or include empty to explicitly clear)
      if (formValues.outbound_flight.trim() !== "") outbound.flight = formValues.outbound_flight.trim();
    }

    // return date-only
    if (formValues.return_drop_date) {
      ret.drop_date = formValues.return_drop_date;
    }
    const retDepISO = combineDateTimeToISO(formValues.return_drop_date, formValues.return_departure_time);
    if (retDepISO) ret.departureTime = retDepISO;
    const retArrISO = combineDateTimeToISO(formValues.return_drop_date, formValues.return_arrival_time);
    if (retArrISO) ret.arrivalTime = retArrISO;
    if (typeof formValues.return_flight === "string") {
      if (formValues.return_flight.trim() !== "") ret.flight = formValues.return_flight.trim();
    }

    if (Object.keys(outbound).length) dates.outbound = outbound;
    if (Object.keys(ret).length) dates.return = ret;
    if (Object.keys(dates).length) payload.dates = dates;

    // Guests: include only when user provided (non-empty) values OR value differs from original
    const guests = {};
    const origGuests = original?.guests || {};
    if (formValues.adults_total !== undefined && formValues.adults_total !== "") {
      if (Number(formValues.adults_total) !== Number(origGuests.adults_total)) guests.adults_total = Number(formValues.adults_total);
      else guests.adults_total = Number(formValues.adults_total); // optional: always include if provided
    }
    if (formValues.children_with_bed !== undefined && formValues.children_with_bed !== "") {
      guests.children_with_bed = Number(formValues.children_with_bed || 0);
    }
    if (formValues.children_without_bed !== undefined && formValues.children_without_bed !== "") {
      guests.children_without_bed = Number(formValues.children_without_bed || 0);
    }
    if (formValues.infants !== undefined && formValues.infants !== "") {
      guests.infants = Number(formValues.infants || 0);
    }
    if (Object.keys(guests).length) payload.guests = guests;

    // Pricing
    const pricing = {};
    const origPricing = original?.pricing || {};
    if (formValues.agent_commission !== undefined && !(formValues.agent_commission === "")) {
      pricing.agent_commission = Number(formValues.agent_commission || 0);
    }
    if (formValues.base_total !== undefined && formValues.base_total !== "") {
      pricing.base_total = Number(formValues.base_total);
    }
    if (formValues.total_amount !== undefined && formValues.total_amount !== "") {
      pricing.total_amount = Number(formValues.total_amount);
    }
    if (Object.keys(pricing).length) payload.pricing = pricing;

    // Type
    if (formValues.type !== undefined && formValues.type !== original?.type) {
      payload.type = formValues.type;
    }

    return payload;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!editedBooking || !editedBooking._id) {
      alert("No booking selected");
      return;
    }

    setSubmitting(true);
    setServerErrors(null);

    try {
      const payload = buildPatchPayload(editedBooking, form);
      // Defensive: if payload empty -> nothing to patch
      if (Object.keys(payload).length === 0) {
        alert("No changes to update");
        setSubmitting(false);
        return;
      }

      console.log("PATCH payload for booking", editedBooking._id, payload);

      // Use PATCH for partial update - change to PUT if your server only supports PUT (but be cautious)
      const res = await axiosInstance.put(`/admin/booking-details/default/${editedBooking._id}`, payload);

      // success: reset and close
      setForm(defaultForm);
      alert("Booking updated");
      closeModal();
    } catch (err) {
      console.error("Update failed:", err);
      setServerErrors(err?.response?.data || { message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  // close when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b">
          <h3 className="text-xl font-semibold">Edit Default Package Booking</h3>
          <button
            onClick={() => closeModal()}
            aria-label="Close"
            className="p-1 text-gray-600 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm text-gray-700">
          {serverErrors?.message && (
            <div className="text-sm text-red-700 bg-red-100 p-2 rounded">{serverErrors.message}</div>
          )}

          {/* READ-ONLY: Contact & Package */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Customer Name</span>
              <input value={form.contact?.name || ""} disabled className="border px-3 py-2 rounded bg-gray-50" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Email</span>
              <input value={form.contact?.email || ""} disabled className="border px-3 py-2 rounded bg-gray-50" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Mobile</span>
              <input value={form.contact?.mobile_number || ""} disabled className="border px-3 py-2 rounded bg-gray-50" />
            </label>

            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Package Name</span>
              <input value={form.package_name || ""} disabled className="border px-3 py-2 rounded bg-gray-50 col-span-2" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Package ID</span>
              <input value={form.package_id || ""} disabled className="border px-3 py-2 rounded bg-gray-50" />
            </label>
          </div>

          {/* Outbound */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Outbound (Going)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Pickup Date</span>
                <input
                  type="date"
                  name="outbound_pickup_date"
                  value={form.outbound_pickup_date}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
                {errors.outbound_pickup_date && <p className="text-xs text-red-500">{errors.outbound_pickup_date}</p>}
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Departure Time</span>
                <input
                  type="time"
                  name="outbound_departure_time"
                  value={form.outbound_departure_time}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Arrival Time</span>
                <input
                  type="time"
                  name="outbound_arrival_time"
                  value={form.outbound_arrival_time}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Flight / Vehicle</span>
                <input
                  type="text"
                  name="outbound_flight"
                  value={form.outbound_flight}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  placeholder="Flight number / Vehicle"
                />
              </label>
            </div>
          </div>

          {/* Return */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Return</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Drop Date</span>
                <input
                  type="date"
                  name="return_drop_date"
                  value={form.return_drop_date}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
                {errors.return_drop_date && <p className="text-xs text-red-500">{errors.return_drop_date}</p>}
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Departure Time</span>
                <input
                  type="time"
                  name="return_departure_time"
                  value={form.return_departure_time}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Arrival Time</span>
                <input
                  type="time"
                  name="return_arrival_time"
                  value={form.return_arrival_time}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Flight / Vehicle</span>
                <input
                  type="text"
                  name="return_flight"
                  value={form.return_flight}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  placeholder="Flight number / Vehicle"
                />
              </label>
            </div>
          </div>

          {/* Guests */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Guests</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Adults</span>
                <input
                  type="number"
                  min="1"
                  value={form.adults_total}
                  onChange={(e) => handleGuestChange("adults_total", e.target.value)}
                  className="border rounded px-3 py-2"
                />
                {errors.adults_total && <p className="text-xs text-red-500">{errors.adults_total}</p>}
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Children (with bed)</span>
                <input
                  type="number"
                  min="0"
                  value={form.children_with_bed}
                  onChange={(e) => handleGuestChange("children_with_bed", e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Children (without bed)</span>
                <input
                  type="number"
                  min="0"
                  value={form.children_without_bed}
                  onChange={(e) => handleGuestChange("children_without_bed", e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Infants</span>
                <input
                  type="number"
                  min="0"
                  value={form.infants}
                  onChange={(e) => handleGuestChange("infants", e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Pricing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">Agent Commission</span>
                <input
                  type="number"
                  value={form.agent_commission}
                  onChange={(e) => setForm(prev => ({ ...prev, agent_commission: Number(e.target.value) }))}
                  className="border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">Base Total</span>
                <input
                  type="number"
                  value={form.base_total}
                  onChange={(e) => setForm(prev => ({ ...prev, base_total: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                {errors.base_total && <p className="text-xs text-red-500">{errors.base_total}</p>}
              </label>

              <label className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">Total Amount</span>
                <input
                  type="number"
                  value={form.total_amount}
                  onChange={(e) => setForm(prev => ({ ...prev, total_amount: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                {errors.total_amount && <p className="text-xs text-red-500">{errors.total_amount}</p>}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => closeModal()}
              disabled={submitting}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
