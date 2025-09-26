import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'>No image</text></svg>";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * UpdateDefaultPackageForm
 * - toEditDefault: the existing package object to edit (optional; if omitted form acts like "create")
 * - onClose: called when user cancels/closes
 * - onUpdated: called with server response after successful update/create
 */
export default function UpdateDefaultPackageForm({ toEditDefault = null, onClose, onUpdated }) {
  const initialForm = {
    package_name: "",
    departure: "",
    days: 1,
    nights: "",
    inclusions: [""],
    pricing: { adult: "", childWithBed: "", childWithoutBed: "", infant: "" },
  };

  const [form, setForm] = useState(initialForm);

  // itineraries hold: { id, day_number, description, file, preview, existingImage, removed }
  const [itineraries, setItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // populate state from toEditDefault when it arrives (edit mode)
  useEffect(() => {
    if (!toEditDefault) return;

    setForm({
      package_name: toEditDefault.package_name ?? "",
      departure: toEditDefault.departure ?? "",
      days: Number(toEditDefault.days) || 1,
      nights: toEditDefault.nights ?? "",
      inclusions: Array.isArray(toEditDefault.inclusions) && toEditDefault.inclusions.length
        ? toEditDefault.inclusions
        : [""],
      pricing: toEditDefault.pricing ?? { adult: "", childWithBed: "", childWithoutBed: "", infant: "" },
    });

    // Normalize itineraries coming from server (support multiple field names for image)
    const serverIts = Array.isArray(toEditDefault.itineraries) ? toEditDefault.itineraries : [];
    const mapped = serverIts.map((it, idx) => {
      const existingImage =
        it.existingImage || it.image || it.image_url || it.imageUrl || it.imagePath || "";
      return {
        id: makeId(),
        day_number: it.day_number ?? idx + 1,
        description: it.description ?? "",
        file: null,
        preview: existingImage || "",
        existingImage: existingImage || "",
        removed: false, // set true when user removes the existing image
      };
    });

    if (mapped.length > 0) {
      setItineraries(mapped);
    } else {
      setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toEditDefault]);

  // cleanup blob urls when unmount or when preview changes removed
  useEffect(() => {
    return () => {
      itineraries.forEach((it) => {
        if (it.preview && typeof it.preview === "string" && it.preview.startsWith("blob:")) {
          URL.revokeObjectURL(it.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, pricing: { ...p.pricing, [key]: value } }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  // same days -> itineraries sync as create form
  const handleDaysChange = (e) => {
    let val = e.target.value;
    if (val === "") {
      setForm((p) => ({ ...p, days: "" }));
      return;
    }
    let num = Number(val);
    if (Number.isNaN(num) || num < 1) num = 1;
    num = Math.floor(num);
    setForm((p) => ({ ...p, days: num }));

    setItineraries((prev) => {
      const prevCopy = [...prev];
      const currentLen = prevCopy.length;
      if (num === currentLen) return prevCopy;

      if (num > currentLen) {
        const toAdd = [];
        for (let i = currentLen + 1; i <= num; i++) {
          toAdd.push({ id: makeId(), day_number: i, description: "", file: null, preview: "", existingImage: "" });
        }
        return [...prevCopy, ...toAdd];
      } else {
        // revoke previews for removed items then slice
        for (let i = num; i < prevCopy.length; i++) {
          const rem = prevCopy[i];
          if (rem && rem.preview && rem.preview.startsWith("blob:")) {
            URL.revokeObjectURL(rem.preview);
          }
        }
        return prevCopy.slice(0, num).map((it, idx) => ({ ...it, day_number: idx + 1 }));
      }
    });
  };

  const handleItineraryDescChange = (idx, value) => {
    setItineraries((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], description: value };
      return copy;
    });
  };

  const handleItineraryFileChange = (idx, file) => {
    setItineraries((prev) => {
      const copy = [...prev];
      // revoke previous preview if blob
      if (copy[idx].preview && copy[idx].preview.startsWith("blob:")) {
        URL.revokeObjectURL(copy[idx].preview);
      }
      const preview = file ? URL.createObjectURL(file) : "";
      // if user selects a new file, we should clear existingImage (server will accept uploaded file)
      copy[idx] = { ...copy[idx], file, preview, existingImage: copy[idx].existingImage ? "" : copy[idx].existingImage, removed: false };
      return copy;
    });
  };

  const addDay = () => {
    setForm((p) => ({ ...p, days: Number(p.days || 0) + 1 }));
    setItineraries((p) => [
      ...p,
      { id: makeId(), day_number: p.length + 1, description: "", file: null, preview: "", existingImage: "" },
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

  // remove existing image without adding a new file (marks existingImage "")
  const removeExistingImage = (idx) => {
    setItineraries((prev) => {
      const copy = [...prev];
      const it = copy[idx];
      if (it.preview && it.preview.startsWith("blob:")) {
        URL.revokeObjectURL(it.preview);
      }
      copy[idx] = { ...it, file: null, preview: "", existingImage: "", removed: true };
      return copy;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.package_name?.trim()) e.package_name = "Package name is required";
    if (!form.departure?.trim()) e.departure = "Departure is required";
    const daysNum = Number(form.days) || 0;
    if (!daysNum || daysNum < 1) e.days = "Days must be at least 1";
    if (itineraries.length !== daysNum) {
      e.itineraries = `Itineraries count (${itineraries.length}) must match days (${daysNum})`;
    }
    itineraries.forEach((it, idx) => {
      if (!it.description?.trim()) e[`it_${idx}`] = `Description for day ${idx + 1} is required`;
      // for update: allow an itinerary to keep existingImage OR provide new file. If neither => error.
      if (!it.file && !it.existingImage) {
        e[`file_${idx}`] = `Image for day ${idx + 1} is required`;
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build itinerary metadata payload
      const itineraryPayload = itineraries.map((it) => ({
        day_number: it.day_number,
        description: it.description,
        existingImage: it.existingImage || "", // empty if removed or replaced
        removed: !!it.removed, // server can use this to delete existing file if true
      }));

      // basic client-side limits
      if (itineraryPayload.length > 10) throw new Error("Maximum 10 itinerary days/images allowed");
      const filesCount = itineraries.filter((it) => it.file).length;
      // require image per day either via existingImage or new file (validate ensured this)
      if (filesCount > 10) throw new Error("Too many files");

      const fd = new FormData();
      fd.append("package_name", form.package_name);
      fd.append("departure", form.departure);
      if (form.nights !== "") fd.append("nights", String(form.nights));
      fd.append("days", String(form.days ?? itineraryPayload.length));
      fd.append(
        "inclusions",
        JSON.stringify((form.inclusions || []).filter((inc) => inc && inc.toString().trim().length > 0))
      );
      fd.append("pricing", JSON.stringify(form.pricing || {}));
      fd.append("itineraries", JSON.stringify(itineraryPayload));

      // Append files in same order as itineraries so multer.array('itineraryImages') lines up
      itineraries.forEach((it) => {
        if (it.file) {
          fd.append("itineraryImages", it.file, `day-${it.day_number}-${it.file.name}`);
        }
      });

      // send to correct endpoint: update if toEditDefault has _id, otherwise create
      if (toEditDefault && toEditDefault._id) {
        await axiosInstance.put(`/admin/packages/default-package/${toEditDefault._id}`, fd);
      } 

      // cleanup previews
      itineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });

      // reset or call onUpdated
      if (onUpdated) onUpdated();
      // optionally close
      if (onClose) onClose();

      // reset local UI (optional)
      setForm(initialForm);
      setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
      setErrors({});
    } catch (err) {
      console.error("Update default package failed:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to update default package";
      alert(message);
    } finally {
        setSubmitting(false);
        onClose()
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">{toEditDefault ? "Edit Default Package" : "Add Default Package"}</h3>
            <button
              type="button"
              onClick={() => {
                itineraries.forEach((it) => {
                  if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
                });
                if (onClose) onClose();
              }}
              className="p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Package name */}
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

          {/* Departure */}
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

          {/* Days / Nights */}
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((p) => {
                        const incs = [...p.inclusions];
                        incs[idx] = val;
                        return { ...p, inclusions: incs };
                      });
                    }}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Inclusion (e.g., Breakfast, Transfers)"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, inclusions: p.inclusions.filter((_, i) => i !== idx) }))}
                    className="px-2 py-1 rounded bg-gray-200"
                  >
                    remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setForm((p) => ({ ...p, inclusions: [...p.inclusions, ""] }))} className="px-3 py-1 rounded bg-gray-100">
                + Add inclusion
              </button>
            </div>
          </div>

          {/* Itineraries */}
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

                  {/* show preview if available */}
                  {it.preview ? (
                    <div className="mt-3 w-48 border rounded p-1 flex flex-col gap-2">
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
                      <div className="flex gap-2">
                        <button type="button" onClick={() => removeExistingImage(idx)} className="px-2 py-1 bg-gray-100 rounded">
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {errors.itineraries && <p className="text-xs text-red-500 mt-2">{errors.itineraries}</p>}
          </div>

          {/* pricing and actions */}
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
                if (onClose) onClose();
              }}
              className="px-4 py-2 rounded bg-gray-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>
              {submitting ? "Saving..." : toEditDefault ? "Update Package" : "Add Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
