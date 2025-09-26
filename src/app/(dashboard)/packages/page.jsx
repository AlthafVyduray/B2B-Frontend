"use client"

import useAdminStore from "@/stores/useAdminStore"
import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  Filter,
  Clock,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/app/components/admin/Hearder"
import DefaultPackageForm from "./DefaultPackageForm"
import UpdateDefaultPackageForm from "./UpdateDefaultPackageForm"
import ViewPackage from "./ViewPackage"
import CreateNormalPackage from "./CreateNormalPackage"
import UpdateNormalPackage from "./UpdateNormalPackage"
import DeletePackage from "./DeletePackage"


export default function PackagesPage() {

  const onClose = () => {
    setToEditDefault(null)
  } 

  const onCloseCreateForm = () => {
    setCreateDefaultPackage(null)
  }

  
  // --- Helpers ---
  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>`
  )}`;

  const [editForm, setEditForm] = useState({
    package_name: "",
    place: "",
    nights: "",
    days: 1,
    price: "",
  });

  const [editItineraries, setEditItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" },
  ]);

  const { getPackages, packages, updatePackage, deletePackage, createPackage, defaultPackages } = useAdminStore();

  useEffect(() => {
    if (typeof getPackages === "function") getPackages();
  
  }, []);



  // --- Normalized packages state (ensures stable ids/day_numbers) ---
  const [normalizedPackages, setNormalizedPackages] = useState([]);

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

  const [itineraries, setItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [createdPackage, setCreatedPackage] = useState(false);
  const [createDefaultPackage, setCreateDefaultPackage] = useState(false)
  const [toDelete, setToDelete] = useState(null);
  const [toEdit, setToEdit] = useState(null);
  const [toEditDefault, setToEditDefault] = useState(null)
  
    // --- Edit form states ---
  const [editErrors, setEditErrors] = useState({});
  const [editingSubmitting, setEditingSubmitting] = useState(false);


  // --- Sync create itineraries with days ---
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
 
  }, [form.days]);

  // --- Populate editForm & editItineraries when toEdit changes ---
  useEffect(() => {
    // if no package selected, reset edit form & itineraries
    if (!toEdit) {
      setEditForm({
        package_name: "",
        place: "",
        nights: "",
        days: 1,
        price: "",
      });
      // revoke old previews and reset
      setEditItineraries((prev) => {
        prev.forEach((it) => {
          if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
        });
        return [{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }];
      });
      setEditErrors({});
      return;
    }

    // populate editForm from toEdit
    setEditForm({
      package_name: toEdit.package_name || "",
      place: toEdit.place || "",
      nights: toEdit.nights ?? "",
      days: toEdit.days ?? 1,
      price: String(toEdit.price ?? ""),
    });

    // map backend itineraries -> editItineraries shape you use in UI
    const mapped =
      Array.isArray(toEdit.itineraries) && toEdit.itineraries.length
        ? toEdit.itineraries.map((it, idx) => ({
            id: it._id ?? it.id ?? makeId(),
            day_number: it.day_number ?? idx + 1,
            description: it.description ?? "",
            file: null,
            existingImage: it.image || it.existingImage || "",
            preview: it.image || it.existingImage || "",
          }))
        : [{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }];

    // ensure mapped length equals toEdit.days (pad if necessary)
    const days = Number(toEdit.days) || mapped.length || 1;
    while (mapped.length < days) {
      mapped.push({ id: makeId(), day_number: mapped.length + 1, description: "", file: null, preview: "", existingImage: "" });
    }

    // replace editItineraries AND revoke any previous blob previews safely
    setEditItineraries((prev) => {
      prev.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
      return mapped.map((it, idx) => ({ ...it, day_number: idx + 1 }));
    });

    setEditErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toEdit]);

  // --- Sync edit itineraries with days ---
  useEffect(() => {
    const days = Number(editForm.days) || 0;
    setEditItineraries((prev) => {
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
  }, [editForm.days]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      itineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
      editItineraries.forEach((it) => {
        if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Create handlers ---
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

  // --- Edit handlers ---
  const openEdit = (pkg) => {
    setToEdit(pkg);
    setEditForm({
      package_name: pkg.package_name || "",
      place: pkg.place || "",
      nights: pkg.nights ?? "",
      days: pkg.days ?? 1,
      price: String(pkg.price ?? ""),
    });

    const mapped =
      Array.isArray(pkg.itineraries) && pkg.itineraries.length
        ? pkg.itineraries.map((it, idx) => ({
            id: it._id ?? it.id ?? makeId(),
            day_number: it.day_number ?? idx + 1,
            description: it.description ?? "",
            file: null,
            existingImage: it.image || "",
            preview: it.image || "",
          }))
        : [{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }];

    const days = Number(pkg.days) || mapped.length || 1;
    while (mapped.length < days) mapped.push({ id: makeId(), day_number: mapped.length + 1, description: "", file: null, preview: "", existingImage: "" });
    setEditItineraries(mapped.map((it, idx) => ({ ...it, day_number: idx + 1 })));
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleEditItineraryDescChange = (index, value) => {
    setEditItineraries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  };

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

  const validateEdit = () => {
    const e = {};
    if (!editForm.package_name.trim()) e.package_name = "Package name required";
    if (!editForm.place.trim()) e.place = "Place required";
    const days = Number(editForm.days);
    if (!Number.isInteger(days) || days <= 0) e.days = "Days must be a positive integer";
    if (!editForm.price || Number.isNaN(Number(editForm.price))) e.price = "Price required";
    editItineraries.forEach((it, idx) => {
      if (!it.description.trim()) e[`it_${idx}`] = `Description for Day ${idx + 1} required`;
      if (!it.file && !it.existingImage) e[`file_${idx}`] = `Image for Day ${idx + 1} required`;
    });
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

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
      closeEditModal();
    } catch (err) {
      console.error("Failed to update package:", err);
      alert(err?.response?.data?.message || "Failed to update package");
    } finally {
      setEditingSubmitting(false);
    }
  };

  // centralized close to clear edit form and revoke previews
  const closeEditModal = () => {
    editItineraries.forEach((it) => {
      if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    });
    setToEdit(null);
    setEditForm({ package_name: "", place: "", nights: "", days: 1, price: "" });
    setEditItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
    setEditErrors({});
  };

  const confirmDelete = async (pkg) => {
    if (!pkg?._id) return;
    try {
      if (typeof deletePackage === "function") {
        await deletePackage(pkg._id);
      } else {
        console.error("deletePackage not available in store");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete package");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex lg:mt-0 mt-10">

      <main className="flex-1 flex flex-col">
        <Header />
        <div className="lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                ✈️ Travel Packages
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and organize your travel packages
              </p>
            </div>
            <Button onClick={() => setCreatedPackage(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-md rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
            <Button onClick={() => setCreateDefaultPackage(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-md rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Default Package
            </Button>
          </div>

          <h1>Default Packages</h1>
          {/* Packages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {defaultPackages.map((pkg) => (
              <Card
                key={pkg._id}
                className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white"
              >

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {pkg.package_name}
                      </h3>
                      
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {pkg.place}
                      </p>

                      <p>Departure: {pkg.departure}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-small text-blue-600">
                        <p>Adult: ${pkg?.pricing?.adult.toLocaleString()}</p>
                        <p>Child With Bed: ${pkg?.pricing?.childWithBed.toLocaleString()}</p>
                        <p>Child Without Bed: ${pkg?.pricing?.childWithoutBed.toLocaleString()}</p>
                        <p>Infant: ${pkg?.pricing?.infant.toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {pkg.days}
                      </p>
                    </div>
                  </div>

                  {/* Itinerary Preview */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Itinerary Highlights
                    </h4>
                    <div className="space-y-2">
                      {pkg.itineraries.slice(0, 2).map((it) => (
                        <div
                          key={it._id}
                          className="flex flex-col items-center gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {it.day_number}
                          </div>
                          <img
                            src={it.image || "/placeholder.svg"}
                            alt={it.day_number}
                            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div>
                            <p className="text-xs text-gray-600">
                              {it.description}
                            </p>
                          </div>
                        </div>
                      ))}
                      {pkg.itineraries.length > 2 && (
                        <p className="text-xs text-blue-600 ml-9 font-medium">
                          +{pkg.itineraries.length - 2} more days...
                        </p>
                      )}
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => setSelectedPackage(pkg)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={() => setToEditDefault(pkg) }
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-yellow-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setToDelete(pkg)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h1>Normal Packages</h1>
          {/* Packages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg._id}
                className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white"
              >

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {pkg.package_name}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {pkg.place}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-blue-600">
                        ${pkg.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pkg.days}
                      </p>
                    </div>
                  </div>

                  {/* Itinerary Preview */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Itinerary Highlights
                    </h4>
                    <div className="space-y-2">
                      {pkg.itineraries.slice(0, 2).map((it) => (
                        <div
                          key={it._id}
                          className="flex flex-col items-center gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {it.day_number}
                          </div>
                          <img
                            src={it.image || "/placeholder.svg"}
                            alt={it.day_number}
                            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div>
                            <p className="text-xs text-gray-600">
                              {it.description}
                            </p>
                          </div>
                        </div>
                      ))}
                      {pkg.itineraries.length > 2 && (
                        <p className="text-xs text-blue-600 ml-9 font-medium">
                          +{pkg.itineraries.length - 2} more days...
                        </p>
                      )}
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => setSelectedPackage(pkg)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={() => setToEdit(pkg) }
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg hover:bg-yellow-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setToDelete(pkg)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {packages.length === 0 && (
            <Card className="rounded-2xl shadow-md border-0">
              <CardContent className="p-12 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No packages found
                </h3>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <DeletePackage toDelete={toDelete} setToDelete={setToDelete} confirmDelete={confirmDelete} />
      )}

      {/* Edit Normal Package */}
      {toEdit && (
        <UpdateNormalPackage toEdit={toEdit} editForm={editForm} setEditForm={setEditForm} editItineraries={editItineraries} setEditItineraries={setEditItineraries} editErrors={editErrors} setEditErrors={setEditErrors} closeEditModal={closeEditModal} />
      )}

      {/* Create Normal Package */}
      {createdPackage && (
        <CreateNormalPackage />
      )}

      {/* View Both Packages */}
      {selectedPackage && (
        <ViewPackage selectedPackage={selectedPackage} packages={packages} setSelectedPackage={setSelectedPackage} />
      )}
      
      {/* Create Default Package */}
      {createDefaultPackage && (
        <DefaultPackageForm onCloseCreateForm={onCloseCreateForm} />
      )}

      {/* Edit Default Package */}
      {toEditDefault && (
        <UpdateDefaultPackageForm toEditDefault={toEditDefault} onClose={onClose} />
      )}

    </div>
  )
}
