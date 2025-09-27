"use client"
import { useState } from "react";
import { X } from "lucide-react";
import useAdminStore from "@/stores/useAdminStore";

const UpdateNormalPackage = ({toEdit, editForm, setEditForm, editItineraries, setEditItineraries, editErrors, setEditErrors, onCloseEditNormal, updatePackage}) => {
  

  
  //For substitute of package preview images if not available
  const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>`
  )}`;

  const [editingSubmitting, setEditingSubmitting] = useState(false);

  
  
  //handling form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  //handling itinerary description change
  const handleEditItineraryDescChange = (index, value) => {
    setEditItineraries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  };

  //handle itinerary file change
  const handleEditItineraryFileChange = (index, file) => {
    setEditItineraries((prev) => {
      const copy = [...prev];
      if (copy[index]?.preview && copy[index].preview.startsWith("blob:")) URL.revokeObjectURL(copy[index].preview);

      if (!file) {
        copy[index] = { ...copy[index], file: null, preview: copy[index].existingImage || "", existingImage: copy[index].existingImage || "" };
        return copy;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setEditErrors((e) => ({ ...e, [`file_${index}`]: "Only JPG/PNG/WEBP allowed" }));
        return copy;
      }
      if (file.size > 5 * 1024 * 1024) {
        setEditErrors((e) => ({ ...e, [`file_${index}`]: "File too large (max 5 MB)" }));
        return copy;
      }

      setEditErrors((e) => {
        const n = { ...e };
        delete n[`file_${index}`];
        return n;
      });

      const blob = URL.createObjectURL(file);
      copy[index] = { ...copy[index], file, preview: blob, existingImage: "" };
      return copy;
    });
  };

  // validating the form
  const validateEdit = () => {
    const e = {};

    // ---------------------------
    // Package name & place
    // ---------------------------
    if (!editForm.package_name.trim()) {
      e.package_name = "Package name required";
    }

    // place is optional in backend (defaults to "Hyderabad")
    // ⚠️ If you want frontend to enforce required, keep this line
    if (!editForm.place.trim()) {
      e.place = "Place required";
    }

    // ---------------------------
    // Nights validation
    // ---------------------------
    const nights = Number(editForm.nights);
    if (!Number.isInteger(nights) || nights < 0) {
      e.nights = "Nights must be a non-negative integer"; // backend allows 0
    }

    // ---------------------------
    // Days validation
    // ---------------------------
    const days = Number(editForm.days);
    if (!Number.isInteger(days) || days <= 0) {
      e.days = "Days must be a positive integer";
    }

    // Days must equal nights + 1
    if (
      Number.isInteger(nights) &&
      nights >= 0 &&   // allow 0 since backend allows it
      Number.isInteger(days) &&
      days > 0 &&
      days !== nights + 1
    ) {
      e.days = "Days should always be Nights + 1";
    }

    // ---------------------------
    // Price validation
    // ---------------------------
    if (editForm.price === "" || Number.isNaN(Number(editForm.price))) {
    e.price = "Price required";
    } else if (Number(editForm.price) < 0) {
      e.price = "Price cannot be negative";
    }

    // ---------------------------
    // Itinerary validation
    // ---------------------------
    // Backend does NOT enforce itineraries,
    // but frontend stricter rule is fine if you want each itinerary to have desc + img
    editItineraries.forEach((it, idx) => {
      if (!it.description.trim()) {
        e[`it_${idx}`] = `Description for Day ${idx + 1} required`;
      }
      if (!it.file && !it.existingImage) {
        e[`file_${idx}`] = `Image for Day ${idx + 1} required`;
      }
    });

    // ---------------------------
    // Finalize
    // ---------------------------
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };


  //handle sumbit form
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!toEdit?._id) return;
    if (!validateEdit()) return;

    setEditingSubmitting(true);
    try {
      const itineraryPayload = editItineraries.map((it) => ({
        id: it.id,
        day_number: it.day_number,
        description: it.description,
        existingImage: it.existingImage || "",
      }));

      const fd = new FormData();
      fd.append("package_name", editForm.package_name);
      fd.append("place", editForm.place);
      if (editForm.nights !== "") fd.append("nights", String(editForm.nights));
      fd.append("days", String(editForm.days));
      fd.append("price", String(editForm.price));
      fd.append("itineraries", JSON.stringify(itineraryPayload));

      // IMPORTANT: append files with day-based filenames so backend can match by day
      editItineraries.forEach((it) => {
        if (it.file) {
          fd.append("itineraryImages", it.file, `day-${it.day_number}-${it.file.name}`);
        }
      });

      if (typeof updatePackage === "function") {
        await updatePackage(toEdit._id, fd);
      } else {
        console.error("updatePackage not available in store");
        throw new Error("updatePackage not available");
      }

      // cleanup and close
      editItineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
      onCloseEditNormal();
    } catch (err) {
      console.error("Failed to update package:", err);
      alert(err?.response?.data?.message || "Failed to update package");
    } finally {
      setEditingSubmitting(false);
    }
  };

  
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
            <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Edit Package</h3>
                <button
                    type="button"
                    onClick={() => onCloseEditNormal()}
                    className="p-1"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                </div>
            
            
                <div>
                <label className="block text-sm font-medium text-gray-700">Package Name</label>
                <input name="package_name" value={editForm.package_name} onChange={handleEditFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter package name" />
                {editErrors.package_name && <p className="text-xs text-red-500 mt-1">{editErrors.package_name}</p>}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700">Place</label>
                <input name="place" value={editForm.place} onChange={handleEditFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter place" />
                {editErrors.place && <p className="text-xs text-red-500 mt-1">{editErrors.place}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nights</label>
                    <input name="nights" value={editForm.nights} onChange={handleEditFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter nights" inputMode="numeric" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Days</label>
                    <input
                    name="days"
                    value={editForm.days}
                    onChange={(e) => {
                        const val = e.target.value;
                        const num = Number(val);
                        setEditForm((p) => ({ ...p, days: val === "" ? val : Math.max(1, Math.floor(num || 0)) }));
                    }}
                    className="mt-2 w-full border rounded px-3 py-2"
                    inputMode="numeric"
                    />
                    {editErrors.days && <p className="text-xs text-red-500 mt-1">{editErrors.days}</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input name="price" value={editForm.price} onChange={handleEditFormChange} className="mt-2 w-full border rounded px-3 py-2" inputMode="numeric" />
                    {editErrors.price && <p className="text-xs text-red-500 mt-1">{editErrors.price}</p>}
                </div>
                </div>

                {/* Itinerary Editor */}
                <div>
                <h3 className="font-semibold text-gray-800 mb-3">Itinerary</h3>
                <div className="space-y-4">
                    {editItineraries.map((it, idx) => (
                    <div key={it.id} className="border rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                        <div className="font-medium">Day {String(idx + 1).padStart(2, "0")}</div>
                        </div>

                        <label className="block mb-2">
                        <div className="text-sm text-gray-700 mb-1">Description</div>
                        <textarea value={it.description} onChange={(e) => handleEditItineraryDescChange(idx, e.target.value)} placeholder={`Enter description for Day ${idx + 1}`} className="w-full border rounded px-3 py-2" rows={3} />
                        {editErrors[`it_${idx}`] && <p className="text-xs text-red-500 mt-1">{editErrors[`it_${idx}`]}</p>}
                        </label>

                        <label className="block">
                        <div className="text-sm text-gray-700 mb-1">Day {String(idx + 1).padStart(2, "0")} Image</div>
                        <input type="file" accept="image/*" onChange={(e) => handleEditItineraryFileChange(idx, e.target.files?.[0] ?? null)} className="w-full" />
                        {editErrors[`file_${idx}`] && <p className="text-xs text-red-500 mt-1">{editErrors[`file_${idx}`]}</p>}
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
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 justify-end p-4 border-t">
                <button type="button" onClick={() => onCloseEditNormal()} className="px-4 py-2 rounded bg-gray-200" disabled={editingSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={editingSubmitting}>
                    {editingSubmitting ? "Saving..." : "Save Changes"}
                </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default UpdateNormalPackage