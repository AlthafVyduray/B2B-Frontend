import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'>No image</text></svg>";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function DefaultPackageForm({ onCloseCreateDefault, createDefaultPackages }) {

  //form for creating default package
  const [form, setForm] = useState({
    package_name: "",
    departure: "",
    days: 1, // default to 1 so UI shows one itinerary field
    nights: 0,
    inclusions: [""],
    pricing: { adult: "", childWithBed: "", childWithoutBed: "", infant: "" },
  });

  const [itineraries, setItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cleanup blob urls when component unmounts
  useEffect(() => {
    return () => {
      itineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //handling the form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // support nested flight fields with dot notation: flight_details.from
    if (name.startsWith("flight_details.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, flight_details: { ...p.flight_details, [key]: value } }));
      return;
    }
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, pricing: { ...p.pricing, [key]: value } }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Inclusions handlers
  const handleInclusionChange = (idx, value) => {
    setForm((p) => {
      const inc = [...p.inclusions];
      inc[idx] = value;
      return { ...p, inclusions: inc };
    });
  };

  //these functions are for creating and removing the inclusion input field
  const addInclusion = () => setForm((p) => ({ ...p, inclusions: [...p.inclusions, ""] }));
  const removeInclusion = (idx) => setForm((p) => ({ ...p, inclusions: p.inclusions.filter((_, i) => i !== idx) }));


  // New: when days changes, ensure itineraries array length matches days
  const handleDaysChange = (e) => {
    let val = e.target.value;
    // Allow empty string while typing, but convert to number for logic
    if (val === "") {
      setForm((p) => ({ ...p, days: "" }));
      return;
    }
    // parse and clamp to minimum 1
    let num = Number(val);
    if (Number.isNaN(num) || num < 1) num = 1;
    // integer
    num = Math.floor(num);

    setForm((p) => ({ ...p, days: num }));

    setItineraries((prev) => {
      const prevCopy = [...prev];
      const currentLen = prevCopy.length;

      if (num === currentLen) return prevCopy;

      if (num > currentLen) {
        // add missing days preserving existing entries
        const toAdd = [];
        for (let i = currentLen + 1; i <= num; i++) {
          toAdd.push({ id: makeId(), day_number: i, description: "", file: null, preview: "" });
        }
        return [...prevCopy, ...toAdd];
      } else {
        // num < currentLen: revoke previews for removed items then slice
        for (let i = num; i < prevCopy.length; i++) {
          const rem = prevCopy[i];
          if (rem && rem.preview && rem.preview.startsWith("blob:")) {
            URL.revokeObjectURL(rem.preview);
          }
        }
        const sliced = prevCopy.slice(0, num).map((it, idx) => ({ ...it, day_number: idx + 1 }));
        return sliced;
      }
    });
  };


  //handling itinerary description change
  const handleItineraryDescChange = (idx, value) => {
    setItineraries((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], description: value };
      return copy;
    });
  };

  //handling itinerary file change
  const handleItineraryFileChange = (idx, file) => {
    setItineraries((prev) => {
      const copy = [...prev];
      // revoke previous preview if exists
      if (copy[idx].preview && copy[idx].preview.startsWith("blob:")) {
        URL.revokeObjectURL(copy[idx].preview);
      }
      copy[idx] = { ...copy[idx], file, preview: file ? URL.createObjectURL(file) : "" };
      return copy;
    });
  };

  // helper: manual add/remove days (kept for UX but days input drives the length)
  const addDay = () => {
    setForm((p) => ({ ...p, days: Number(p.days || 0) + 1 }));
    setItineraries((p) => [
      ...p,
      { id: makeId(), day_number: p.length + 1, description: "", file: null, preview: "" },
    ]);
  };

  const removeDay = (idx) => {
    setItineraries((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed && removed.preview && removed.preview.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
      }
      const newArr = copy.map((it, i) => ({ ...it, day_number: i + 1 }));
      setForm((p) => ({ ...p, days: newArr.length }));
      return newArr;
    });
  };
 
// Validating Default Package form
const validate = () => {
  const e = {};

  // ---------------------------
  // Package name & departure
  // ---------------------------
  if (!form.package_name?.trim()) {
    e.package_name = "Package name is required";
  }
  if (!form.departure?.trim()) {
    e.departure = "Departure (eg. Every Friday) is required";
  }

  // ---------------------------
  // Nights validation
  // ---------------------------
  const nightsNum = Number(form.nights);
  if (!Number.isInteger(nightsNum) || nightsNum < 0) {
    e.nights = "Nights must be a non-negative integer";
  }

  // ---------------------------
  // Days validation
  // ---------------------------
  const daysNum = Number(form.days);
  if (!Number.isInteger(daysNum) || daysNum < 1) {
    e.days = "Days must be at least 1";
  }

  // Days must equal nights + 1
  if (
    Number.isInteger(nightsNum) &&
    nightsNum >= 0 &&
    Number.isInteger(daysNum) &&
    daysNum >= 1 &&
    daysNum !== nightsNum + 1
  ) {
    e.days = "Days must always equal Nights + 1";
  }

  // ---------------------------
  // Itineraries count must match days
  // ---------------------------
  if (itineraries.length !== daysNum) {
    e.itineraries = `Itineraries count (${itineraries.length}) must match days (${daysNum})`;
  }

  // ---------------------------
  // Itinerary details validation
  // ---------------------------
  itineraries.forEach((it, idx) => {
    if (!it.description?.trim()) {
      e[`it_${idx}`] = `Description for day ${idx + 1} is required`;
    }
    if (!it.file && !it.existingImage) {
      e[`file_${idx}`] = `Image for day ${idx + 1} is required`;
    }
  });

  // ---------------------------
  // Pricing validation (optional but recommended)
  // ---------------------------
  if (!form.pricing) {
    e.pricing = "Pricing information is required";
  } else {
    const { adult, childWithBed, childWithoutBed, infant } = form.pricing;
    if (adult == null || adult < 0) e.adult = "Adult price required and must be >= 0";
    if (childWithBed == null || childWithBed < 0) e.childWithBed = "Child with bed price required and must be >= 0";
    if (childWithoutBed == null || childWithoutBed < 0) e.childWithoutBed = "Child without bed price required and must be >= 0";
    if (infant == null || infant < 0) e.infant = "Infant price required and must be >= 0";
  }

  // ---------------------------
  // Finalize
  // ---------------------------
  setErrors(e);
  return Object.keys(e).length === 0;
};


  //handling submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build itinerary payload (day_number, description, keep existingImage if any)
      const itineraryPayload = itineraries.map((it) => ({
        day_number: it.day_number,
        description: it.description,
        existingImage: it.existingImage || "",
      }));

      // Basic client-side checks
      if (itineraryPayload.length > 10) {
        throw new Error("Maximum 10 itinerary days/images allowed");
      }
      const filesCount = itineraries.filter((it) => it.file).length;
      if (filesCount !== itineraries.length) {
        throw new Error("Please attach one image per itinerary day");
      }

      // Build FormData
      const fd = new FormData();
      fd.append("package_name", form.package_name);        // required
      fd.append("departure", form.departure);              // required for default packages
      if (form.nights !== "") fd.append("nights", String(form.nights));
      fd.append("days", String(form.days ?? itineraryPayload.length));
      // flight_details, inclusions, pricing must be JSON strings (controller can parse)
      fd.append("flight_details", JSON.stringify(form.flight_details || {}));
      fd.append(
        "inclusions",
        JSON.stringify((form.inclusions || []).filter((inc) => inc && inc.toString().trim().length > 0))
      );
      fd.append("pricing", JSON.stringify(form.pricing || {}));

      // Append itineraries metadata (no file paths)
      fd.append("itineraries", JSON.stringify(itineraryPayload));

      // Append files in same order so req.files[i] corresponds to itinerary[i]
      // field name MUST be 'itineraryImages' (multer.array('itineraryImages', 10))
      itineraries.forEach((it) => {
        if (it.file) {
          // include a sensible filename to help debugging
          fd.append("itineraryImages", it.file, `day-${it.day_number}-${it.file.name}`);
        }
      });

    
      await createDefaultPackages(fd);

      // reset UI (revoke blobs, clear form)
      setForm({
        package_name: "",
        departure: "",
        days: 1,
        nights: 0,
        inclusions: [""],
        pricing: { adult: "", childWithBed: "", childWithoutBed: "", infant: "" },
      });
      itineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
      setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
      setErrors({});
      
    } catch (err) {
      console.error("Create default package failed:", err);
      // prefer server message when available
      const message = err?.response?.data?.message || err?.message || "Failed to create default package";
      alert(message);
    } finally {
      setSubmitting(false);
      onCloseCreateDefault()
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Add Default Package</h3>
            <button
              type="button"
              onClick={() => {
                itineraries.forEach((it) => {
                  if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
                });
                if (onCloseCreateDefault) onCloseCreateDefault();
              }}
              className="p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Package Name</label>
            <input
              name="package_name"
              value={form.package_name}
              onChange={handleFormChange}
              className="mt-2 w-full border rounded px-3 py-2"
              placeholder="Enter package name"
            />
            {errors.package_name && <p className="text-xs text-red-500 mt-1">{errors.package_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Departure</label>
            <input
              name="departure"
              value={form.departure}
              onChange={handleFormChange}
              className="mt-2 w-full border rounded px-3 py-2"
              placeholder="e.g., Every Friday"
            />
            {errors.departure && <p className="text-xs text-red-500 mt-1">{errors.departure}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Days</label>
              <input
                name="days"
                value={form.days}
                onChange={handleDaysChange}
                className="mt-2 w-full border rounded px-3 py-2"
                inputMode="numeric"
              />
              {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nights</label>
              <input
                name="nights"
                value={form.nights}
                onChange={(e) => setForm((p) => ({ ...p, nights: e.target.value }))}
                className="mt-2 w-full border rounded px-3 py-2"
                inputMode="numeric"
              />
              {errors.nights && <p className="text-xs text-red-500 mt-1">{errors.nights}</p>}
            </div>
          </div>

          

          {/* Inclusions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Inclusions</h4>
            <div className="space-y-2">
              {form.inclusions.map((inc, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={inc}
                    onChange={(e) => handleInclusionChange(idx, e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Inclusion (e.g., Breakfast, Transfers)"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion(idx)}
                    className="px-2 py-1 rounded bg-gray-200"
                  >
                    remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addInclusion} className="px-3 py-1 rounded bg-gray-100">
                + Add inclusion
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Itinerary</h3>
            <div className="space-y-4">
              {itineraries.map((it, idx) => (
                <div key={it.id} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-medium">Day {String(idx + 1).padStart(2, "0")}</div>
                    <div className="flex gap-2">
                      {itineraries.length > 1 && (
                        <button type="button" onClick={() => removeDay(idx)} className="px-2 py-1 bg-gray-100 rounded">
                          Remove Day
                        </button>
                      )}
                      {idx === itineraries.length - 1 && (
                        <button type="button" onClick={addDay} className="px-2 py-1 bg-gray-100 rounded">
                          + Add Day
                        </button>
                      )}
                    </div>
                  </div>

                  <label className="block mb-2">
                    <div className="text-sm text-gray-700 mb-1">Description</div>
                    <textarea
                      value={it.description}
                      onChange={(e) => handleItineraryDescChange(idx, e.target.value)}
                      placeholder={`Enter description for Day ${idx + 1}`}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                    />
                    {errors[`it_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`it_${idx}`]}</p>}
                  </label>

                  <label className="block">
                    <div className="text-sm text-gray-700 mb-1">Image</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleItineraryFileChange(idx, e.target.files?.[0] ?? null)}
                      className="w-full"
                    />
                    {errors[`file_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`file_${idx}`]}</p>}
                  </label>

                  {it.preview ? (
                    <div className="mt-3 w-48 border rounded p-1">
                      <img
                        src={it.preview || PLACEHOLDER_SVG}
                        alt={`Day ${idx + 1} preview`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallback) {
                            img.dataset.fallback = "1";
                            img.src = PLACEHOLDER_SVG;
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {errors.itineraries && <p className="text-xs text-red-500 mt-2">{errors.itineraries}</p>}
          </div>

          {/* pricing and buttons */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Pricing (₹)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                name="pricing.adult"
                value={form.pricing.adult}
                onChange={handleFormChange}
                className="border rounded px-3 py-2"
                placeholder="Adult"
                inputMode="numeric"
              />
              <input
                name="pricing.childWithBed"
                value={form.pricing.childWithBed}
                onChange={handleFormChange}
                className="border rounded px-3 py-2"
                placeholder="Child w/ bed"
                inputMode="numeric"
              />
              <input
                name="pricing.childWithoutBed"
                value={form.pricing.childWithoutBed}
                onChange={handleFormChange}
                className="border rounded px-3 py-2"
                placeholder="Child w/o bed"
                inputMode="numeric"
              />
              <input
                name="pricing.infant"
                value={form.pricing.infant}
                onChange={handleFormChange}
                className="border rounded px-3 py-2"
                placeholder="Infant"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end p-4 border-t">
            <button
              type="button"
              onClick={() => {
                itineraries.forEach((it) => {
                  if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
                });
                setForm({
                  package_name: "",
                  departure: "",
                  days: 1,
                  nights: "",
                  flight_details: { from: "", to: "", schedule: [] },
                  inclusions: [""],
                  pricing: { adult: "", childWithBed: "", childWithoutBed: "", infant: "" },
                });
                setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "" }]);
                setErrors({});
                if (onCloseCreateDefault) onCloseCreateDefault();
              }}
              className="px-4 py-2 rounded bg-gray-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>
              {submitting ? "Saving..." : "Add Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
