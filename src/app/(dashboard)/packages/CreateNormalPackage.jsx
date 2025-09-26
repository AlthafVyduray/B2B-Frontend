import {useState, useEffect} from 'react'

const CreateNormalPackage = () => {
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
      if (!Array.isArray(packages)) {
        setNormalizedPackages([]);
        return;
      }
  
      setNormalizedPackages(
        packages.map((p) => {
          const safeItins = Array.isArray(p.itineraries) ? p.itineraries : [];
          const mapped = safeItins.map((it, idx) => ({
            id: it._id ?? it.id ?? makeId(),
            _id: it._id ?? undefined,
            day_number: it.day_number ?? idx + 1,
            description: it.description ?? "",
            image: it.image ?? "",
            // keep any other backend fields
            ...it,
          }));
          return {
            ...p,
            itineraries: mapped,
          };
        })
      );
    }, [packages]);
  
    // --- Create form states ---
    const [form, setForm] = useState({
      package_name: "",
      place: "",
      nights: "",
      days: 1,
      price: "",
    });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleItineraryDescChange = (index, value) => {
    setItineraries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  };

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

  const validate = () => {
    const e = {};
    if (!form.package_name.trim()) e.package_name = "Package name required";
    if (!form.place.trim()) e.place = "Place required";
    const days = Number(form.days);
    if (!Number.isInteger(days) || days <= 0) e.days = "Days must be a positive integer";
    if (!form.price || Number.isNaN(Number(form.price))) e.price = "Price required";
    itineraries.forEach((it, idx) => {
      if (!it.description.trim()) e[`it_${idx}`] = `Description for Day ${idx + 1} required`;
      if (!it.file && !it.existingImage) e[`file_${idx}`] = `Image for Day ${idx + 1} required`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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

      if (typeof createPackage === "function") {
        await createPackage(fd);
      } else {
        console.error("createPackage not available in store");
        throw new Error("createPackage not available");
      }

      // reset
      setForm({ package_name: "", place: "", nights: "", days: 1, price: "" });
      itineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
      setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
      setErrors({});
      setCreatedPackage(false);
    } catch (err) {
      console.error("Create package failed:", err);
      alert(err?.response?.data?.message || "Failed to create package");
    } finally {
      setSubmitting(false);
    }
  };
  
   useEffect(() => {
      const days = Number(form.days) || 0;
      setItineraries((prev) => {
        const next = [...prev];
        if (days <= 0) return [];
        while (next.length < days) {
          next.push({ id: makeId(), day_number: next.length + 1, description: "", file: null, preview: "", existingImage: "" });
        }
        while (next.length > days) {
          const rem = next.pop();
          if (rem?.preview?.startsWith("blob:")) URL.revokeObjectURL(rem.preview);
        }
        return next.map((it, idx) => ({ ...it, day_number: idx + 1 }));
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.days]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Add Package</h3>
                    <button
                    type="button"
                    onClick={() => {
                        itineraries.forEach((it) => {
                        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
                        });
                        setCreatedPackage(false);
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
                    <button type="button" onClick={() => { itineraries.forEach((it) => { if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview); }); setForm({ package_name: "", place: "", nights: "", days: 1, price: "" }); setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]); setErrors({}); setCreatedPackage(false); }} className="px-4 py-2 rounded bg-gray-200" disabled={submitting}>Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={submitting}>{submitting ? "Saving..." : "Add Package"}</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default CreateNormalPackage