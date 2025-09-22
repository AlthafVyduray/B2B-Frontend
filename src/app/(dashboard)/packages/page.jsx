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


export default function PackagesPage() {

  const { getPackages, packages = [], updatePackage, deletePackage, createPackage } = useAdminStore();

  useEffect(() => {
    if (typeof getPackages === "function") getPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helpers ---
  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>`
  )}`;

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
  const [createdPackage, setCreatedPackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null)
  // --- Edit form states ---
  const [toDelete, setToDelete] = useState(null);
  const [toEdit, setToEdit] = useState(null); // full package object being edited
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  // const [searchTerm, setSearchTerm] = useState("")
  // const [filterType, setFilterType] = useState("all")
  // const [filterDuration, setFilterDuration] = useState("all")

  // Sample data
  // const packages = [
  //   {
  //     id: 1,
  //     name: "2 NIGHT 3 DAY",
  //     duration: "2 Nights / 3 Days",
  //     price: 1100,
  //     currency: "₹",
  //     type: "Adventure",
  //     destination: "Kerala Backwaters",
  //     rating: 4.5,
  //     bookings: 45,
  //     status: "active",
  //     image:
  //       "https://www.bsr.org/images/heroes/bsr-travel-hero..jpg",
  //     itinerary: [
  //       {
  //         day: 1,
  //         title: "Arrival & Houseboat Check-in",
  //         description: "Pleasant vibe with traditional Kerala welcome",
  //       },
  //       {
  //         day: 2,
  //         title: "Backwater Cruise",
  //         description: "Pleasant vibe exploring local villages and wildlife",
  //       },
  //       {
  //         day: 3,
  //         title: "Departure",
  //         description: "Morning cruise and checkout",
  //       },
  //     ],
  //     inclusions: [
  //       "Houseboat Stay",
  //       "All Meals",
  //       "Sightseeing",
  //       "Transportation",
  //     ],
  //     highlights: [
  //       "Backwater Cruise",
  //       "Traditional Cuisine",
  //       "Village Tours",
  //       "Wildlife Spotting",
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: "1NIGHT 2DAY",
  //     duration: "1 Night / 2 Days",
  //     price: 1100,
  //     currency: "₹",
  //     type: "Weekend Getaway",
  //     destination: "Munnar Hills",
  //     rating: 4.2,
  //     bookings: 32,
  //     status: "active",
  //     image:
  //       "https://d3d5bpai12ti8.cloudfront.net/wp-content/uploads/20200911134852/Rajasthan-Approves-New-Tourism-Policy-With-Focus-On-Lesser-known-Destinations.jpg",
  //     itinerary: [
  //       {
  //         day: 1,
  //         title: "Hill Station Arrival",
  //         description: "Scenic drive through tea plantations and check-in",
  //       },
  //       {
  //         day: 2,
  //         title: "Sightseeing & Departure",
  //         description:
  //           "Visit viewpoints and local attractions before departure",
  //       },
  //     ],
  //     inclusions: [
  //       "Hotel Stay",
  //       "Breakfast",
  //       "Sightseeing",
  //       "Transportation",
  //     ],
  //     highlights: [
  //       "Tea Gardens",
  //       "Mountain Views",
  //       "Cool Climate",
  //       "Photography",
  //     ],
  //   },
  // ]

  // const filteredPackages = packages.filter((pkg) => {
  //   const matchesSearch =
  //     pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesType =
  //     filterType === "all" ||
  //     pkg.type.toLowerCase() === filterType.toLowerCase()
  //   const matchesDuration =
  //     filterDuration === "all" ||
  //     (filterDuration === "short" && pkg.duration.includes("1")) ||
  //     pkg.duration.includes("2") ||
  //     (filterDuration === "medium" &&
  //       (pkg.duration.includes("3") || pkg.duration.includes("4"))) ||
  //     (filterDuration === "long" &&
  //       (pkg.duration.includes("5") || pkg.duration.includes("6")))

  //   return matchesSearch && matchesType && matchesDuration
  // })

  // const stats = {
  //   total: packages.length,
  //   active: packages.filter((p) => p.status === "active").length,
  //   totalBookings: packages.reduce((sum, p) => sum + p.bookings, 0),
  //   avgRating: (
  //     packages.reduce((sum, p) => sum + p.rating, 0) / packages.length
  //   ).toFixed(1),
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex lg:mt-0 mt-10">
        {/* <div>
                  <Sidebar active="Destinations" />

        </div> */}

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
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Total Packages",
                value: stats.total,
                icon: <MapPin className="w-6 h-6 text-blue-600" />,
                color: "from-blue-50 to-blue-100",
              },
              {
                title: "Active Packages",
                value: stats.active,
                icon: <Calendar className="w-6 h-6 text-green-600" />,
                color: "from-green-50 to-green-100",
              },
              {
                title: "Total Bookings",
                value: stats.totalBookings,
                icon: <Users className="w-6 h-6 text-purple-600" />,
                color: "from-purple-50 to-purple-100",
              },
              {
                title: "Avg Rating",
                value: stats.avgRating,
                icon: <Star className="w-6 h-6 text-yellow-600" />,
                color: "from-yellow-50 to-yellow-100",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="hover:shadow-xl transition-shadow rounded-2xl border-0 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 bg-gradient-to-br ${stat.color} rounded-full shadow`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* Filters */}
          {/* <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search packages or destinations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full lg:w-48 rounded-lg">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Package Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="beach">Beach</SelectItem>
                    <SelectItem value="weekend getaway">
                      Weekend Getaway
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterDuration}
                  onValueChange={setFilterDuration}
                >
                  <SelectTrigger className="w-full lg:w-48 rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="short">1-2 Days</SelectItem>
                    <SelectItem value="medium">3-4 Days</SelectItem>
                    <SelectItem value="long">5+ Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card> */}

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
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button onClick={() => setToDelete(null)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{toDelete.package_name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setToDelete(null)} className="px-4 py-2 rounded bg-gray-100">
                  Cancel
                </button>
                <button onClick={() => confirmDelete(toDelete)} className="px-4 py-2 rounded bg-red-600 text-white">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (full form like Create) */}
      {toEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
            <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Edit Package</h3>
                <button
                  type="button"
                  onClick={() => closeEditModal()}
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
                <button type="button" onClick={() => closeEditModal()} className="px-4 py-2 rounded bg-gray-200" disabled={editingSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={editingSubmitting}>
                  {editingSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createdPackage && (
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
      )}

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
            <CardContent className="px-10 p-6 overflow-y-auto">
              <div className="flex justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedPackage?.package_name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(null);
                  }}
                  className="p-1 self-end text-red-500"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

              </div>
              <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    {selectedPackage?.place}
                  </p>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-blue-600">
                      ${((selectedPackage?.price ?? 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedPackage?.days} Days
                    </p>
                  </div>
                </div>

              {/* Itinerary Preview */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Itinerary Highlights
                </h4>
                <div className="space-y-2">
                  {selectedPackage?.itineraries?.map((it) => (
                    <div
                      key={it?._id}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {it?.day_number}
                      </div>
                      <img
                        src={it?.image || "/placeholder.svg"}
                        alt={String(it?.day_number ?? "")}
                        className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div>
                        <p className="text-xs text-gray-600">
                          {it?.description}
                        </p>
                      </div>
                    </div>
                  )) ?? null}
                </div>
              </div>
              <div className="flex gap-3 justify-end p-4 border-t">
                <button type="button" onClick={() => setSelectedPackage(null)} className="px-4 py-2 rounded bg-red-500">
                  Cancel
                </button>
              </div>
            </CardContent>
          </div>
        </div>
      )}

    </div>
  )
}
