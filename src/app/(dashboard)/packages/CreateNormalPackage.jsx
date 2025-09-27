import { useState } from 'react'
import { X } from 'lucide-react';


const CreateNormalPackage = ({ form, setForm, itineraries, setItineraries, errors, setErrors, onCloseCreateNormal, createPackage}) => {


  const [submitting, setSubmitting] = useState(false);
  
  //For substitute of package preview images if not available
  const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>`
  )}`;
  

  
  
  // handling form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  //for handling itinerary description change
  const handleItineraryDescChange = (index, value) => {
    setItineraries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  };

  //handle itinerary file change
  const handleItineraryFileChange = (index, file) => {
    setItineraries((prev) => {
      const copy = [...prev];
      if (copy[index]?.preview && copy[index].preview.startsWith("blob:")) URL.revokeObjectURL(copy[index].preview);

      if (!file) {
        copy[index] = { ...copy[index], file: null, preview: copy[index].existingImage || "", existingImage: copy[index].existingImage || "" };
        return copy;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setErrors((e) => ({ ...e, [`file_${index}`]: "Only JPG/PNG/WEBP allowed" }));
        return copy;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((e) => ({ ...e, [`file_${index}`]: "File too large (max 5 MB)" }));
        return copy;
      }

      setErrors((e) => {
        const n = { ...e };
        delete n[`file_${index}`];
        return n;
      });

      const blob = URL.createObjectURL(file);
      copy[index] = { ...copy[index], file, preview: blob, existingImage: "" };
      return copy;
    });
  };

  // Validating function when submitting
  const validate = () => {
    const e = {};

   
    if (!form.package_name.trim()) {
      e.package_name = "Package name required";
    }


    // Option B (stricter, enforce place required on frontend):
    if (!form.place.trim()) {
      e.place = "Place required";
    }

    // ---------------------------
    // Nights validation
    // ---------------------------
    const nights = Number(form.nights);
    if (!Number.isInteger(nights) || nights < 0) {
      e.nights = "Nights must be at least 0";
    }

    // ---------------------------
    // Days validation
    // ---------------------------
    const days = Number(form.days);
    if (!Number.isInteger(days) || days <= 0) {
      e.days = "Days must be a positive integer";
    }

    // Nights + 1 rule
    if (
      Number.isInteger(nights) &&
      nights > 0 &&
      Number.isInteger(days) &&
      days > 0 &&
      days !== nights + 1
    ) {
      e.days = "Days should always be Nights + 1";
    }

    // ---------------------------
    // Price validation
    // ---------------------------
    if (form.price === "" || Number.isNaN(Number(form.price))) {
      e.price = "Price required";
    } else if (Number(form.price) < 0) {
      e.price = "Price cannot be negative";
    }

    // ---------------------------
    // Itineraries validation (frontend stricter than backend)
    // Backend allows empty itineraries,
    // but if you want each itinerary to have desc + image, keep this
    // ---------------------------
    itineraries.forEach((it, idx) => {
      if (!it.description.trim()) {
        e[`it_${idx}`] = `Description for Day ${idx + 1} required`;
      }
      if (!it.file && !it.existingImage) {
        e[`file_${idx}`] = `Image for Day ${idx + 1} required`;
      }
    });

    
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  //function for handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const itineraryPayload = itineraries.map((it) => ({ day_number: it.day_number, description: it.description, existingImage: it.existingImage || "" }));
      const fd = new FormData();
      fd.append("package_name", form.package_name);
      fd.append("place", form.place);
      if (form.nights !== "") fd.append("nights", String(form.nights));
      fd.append("days", String(form.days));
      fd.append("price", String(form.price));
      fd.append("itineraries", JSON.stringify(itineraryPayload));
      // append files with day-based name to make matching robust
      itineraries.forEach((it) => {
        if (it.file) fd.append("itineraryImages", it.file, `day-${it.day_number}-${it.file.name}`);
      });
      
      await createPackage(fd);
      onCloseCreateNormal()
        
    } catch (err) {
      console.error("Create package failed:", err);
      alert(err?.response?.data?.message || "Failed to create package");
    } 
  };
  

   

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Add Package</h3>
                    <button
                    type="button"
                    onClick={() => {
                        onCloseCreateNormal()
                    }}
                    className="p-1"
                    aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Package Name</label>
                    <input name="package_name" value={form.package_name} onChange={handleFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter package name" />
                    {errors.package_name && <p className="text-xs text-red-500 mt-1">{errors.package_name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Place</label>
                    <input name="place" value={form.place} onChange={handleFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter place" />
                    {errors.place && <p className="text-xs text-red-500 mt-1">{errors.place}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Nights</label>
                    <input name="nights" value={form.nights} onChange={handleFormChange} className="mt-2 w-full border rounded px-3 py-2" placeholder="Enter nights" inputMode="numeric" />
                    {errors.nights && <p className="text-xs text-red-500 mt-1">{errors.nights}</p>}
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Days</label>
                    <input name="days" value={form.days} onChange={(e) => { const val = e.target.value; const num = Number(val); setForm((p) => ({ ...p, days: val === "" ? val : Math.max(1, Math.floor(num || 0)) })); }} className="mt-2 w-full border rounded px-3 py-2" inputMode="numeric" />
                    {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days}</p>}
                    </div>

                    <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input name="price" value={form.price} onChange={handleFormChange} className="mt-2 w-full border rounded px-3 py-2" inputMode="numeric" />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Itinerary</h3>
                    <div className="space-y-4">
                    {itineraries.map((it, idx) => (
                        <div key={it.id} className="border rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="font-medium">Day {String(idx + 1).padStart(2, "0")}</div>
                        </div>

                        <label className="block mb-2">
                            <div className="text-sm text-gray-700 mb-1">Description</div>
                            <textarea value={it.description} onChange={(e) => handleItineraryDescChange(idx, e.target.value)} placeholder={`Enter description for Day ${idx + 1}`} className="w-full border rounded px-3 py-2" rows={3} />
                            {errors[`it_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`it_${idx}`]}</p>}
                        </label>

                        <label className="block">
                            <div className="text-sm text-gray-700 mb-1">Day {String(idx + 1).padStart(2, "0")} Image</div>
                            <input type="file" accept="image/*" onChange={(e) => handleItineraryFileChange(idx, e.target.files?.[0] ?? null)} className="w-full" />
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
                    {errors.files && <p className="text-xs text-red-500 mt-2">{errors.files}</p>}
                </div>

                <div className="flex gap-3 justify-end p-4 border-t">
                    <button type="button" onClick={() => onCloseCreateNormal()} className="px-4 py-2 rounded bg-gray-200" disabled={submitting}>Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>{submitting ? "Saving..." : "Add Package"}</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default CreateNormalPackage