"use client"


import useAdminStore from "@/stores/useAdminStore"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Users,
  Utensils,
  MapPin,
  Star,
  Ticket,
  Snowflake,
  User,
} from "lucide-react"
import Header from "@/app/components/admin/Hearder"

export default function PricingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  const {
    pricing,
    getPricing,
    deletePricing,
    updatePricing,
    createPricing,
    getPackages,
    packages,
    loadPricing,
  } = useAdminStore();

  useEffect(() => {
    if (typeof getPackages === "function") getPackages();
    if (typeof getPricing === "function") getPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pricesToDelete, setPricesToDelete] = useState(null);
  const [pricesToUpdate, setPricesToUpdate] = useState(null);
  const [pricesToCreate, setPricesToCreate] = useState(false);

  const initialForm = {
    package_id: "",
    entryAdult: "",
    entryChild: "",
    snowAdult: "",
    snowChild: "",
    breakfast: "",
    lunchVeg: "",
    lunchNonVeg: "",
    guide: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    
    if (pricesToUpdate) {
      setFormData({
        package_id: pricesToUpdate.package_id?._id ?? "",
        entryAdult: String(pricesToUpdate.entryAdult ?? ""),
        entryChild: String(pricesToUpdate.entryChild ?? ""),
        snowAdult: String(pricesToUpdate.snowAdult ?? ""),
        snowChild: String(pricesToUpdate.snowChild ?? ""),
        breakfast: String(pricesToUpdate.breakfast ?? ""),
        lunchVeg: String(pricesToUpdate.lunchVeg ?? ""),
        lunchNonVeg: String(pricesToUpdate.lunchNonVeg ?? ""),
        guide: String(pricesToUpdate.guide ?? ""),
      });
      setErrors({});
    } else {
      setFormData(initialForm);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesToUpdate]);

  // handleChange: numeric inputs sanitized, package_id accepted as-is
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "package_id") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    const str = value === null || value === undefined ? "" : String(value);
    const sanitized = str === "" ? "" : str.replace(/[^\d]/g, "");
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
  };

  const clearForm = () => {
    setFormData(initialForm);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    // package_id required
    if (!formData.package_id) newErrors.package_id = "Package is required";
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "package_id") return;
      if (v === "") newErrors[k] = "Required";
      else if (Number(v) < 0) newErrors[k] = "Must be >= 0";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // create new pricing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (typeof createPricing !== "function") {
      console.error("createPricing is not a function", createPricing);
      alert("Create action not available — check the store.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const payload = {
      package_id: formData.package_id,
      entryAdult: Number(formData.entryAdult),
      entryChild: Number(formData.entryChild),
      snowAdult: Number(formData.snowAdult),
      snowChild: Number(formData.snowChild),
      breakfast: Number(formData.breakfast),
      lunchVeg: Number(formData.lunchVeg),
      lunchNonVeg: Number(formData.lunchNonVeg),
      guide: Number(formData.guide),
    };

    try {
      setIsSubmitting(true);
      await createPricing(payload);
      if (typeof getPricing === "function") await getPricing();
      clearForm();
      setPricesToCreate(false);
    } catch (err) {
      console.error("Failed to create pricing:", err);
      alert(err?.response?.data?.message || "Failed to add pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  // update pricing
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!pricesToUpdate?._id) return;
    if (!validateForm()) return;

    if (typeof updatePricing !== "function") {
      console.error("updatePricing is not a function", updatePricing);
      alert("Update action not available — check the store.");
      return;
    }

    const payload = {
      package_id: formData.package_id,
      entryAdult: Number(formData.entryAdult),
      entryChild: Number(formData.entryChild),
      snowAdult: Number(formData.snowAdult),
      snowChild: Number(formData.snowChild),
      breakfast: Number(formData.breakfast),
      lunchVeg: Number(formData.lunchVeg),
      lunchNonVeg: Number(formData.lunchNonVeg),
      guide: Number(formData.guide),
    };

    try {
      setIsUpdating(true);
      await updatePricing(pricesToUpdate._id, payload);
      if (typeof getPricing === "function") await getPricing();
      setPricesToUpdate(null);
    } catch (err) {
      console.error("Failed to update pricing:", err);
      alert(err?.response?.data?.message || "Failed to update pricing");
    } finally {
      setIsUpdating(false);
    }
  };


  const safePricing = Array.isArray(pricing) ? pricing.filter(Boolean) : [];
  const safePackages = Array.isArray(packages) ? packages.filter(Boolean) : [];

  // helper to display package name
  const getPackageName = (pkgId) => {
    const pkg = safePackages.find((p) => String(p._id) === String(pkgId));
    return pkg ? pkg.package_name : "-";
  };

  


  // const filteredPricing = pricingData.filter((item) => {
  //   const matchesSearch = item.package.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesFilter = filterCategory === "all" || item.category === filterCategory
  //   return matchesSearch && matchesFilter
  // })

  // const categories = ["all", "weekend", "extended", "luxury", "premium"]

  return (
    <div className="min-h-screen bg-white lg:p-6 lg:mt-0 mt-10 m-2">
      <Header />
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-gray-600 mt-1">Manage package pricing and service rates</p>
          </div>
          <Button
            onClick={() => setPricesToCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Price
          </Button>
        </div>
        

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {safePricing.map((pricing) => (
            <Card key={pricing._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{pricing.package_id?.package_name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPricesToUpdate(pricing)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPricesToDelete(pricing)}
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry Pricing */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Entry Fees
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Adult</p>
                      <p className="font-semibold text-gray-900">₹{pricing.entryAdult}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Child</p>
                      <p className="font-semibold text-gray-900">₹{pricing.entryChild}</p>
                    </div>
                  </div>
                </div>

                {/* Snow Activity Pricing */}
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-cyan-600" />
                    Snow Activities
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Adult</p>
                      <p className="font-semibold text-gray-900">₹{pricing.snowAdult}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Child</p>
                      <p className="font-semibold text-gray-900">₹{pricing.snowChild}</p>
                    </div>
                  </div>
                </div>

                {/* Meal Pricing */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Utensils className="w-4 h-4 mr-2 text-green-600" />
                    Meals & Services
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Breakfast</p>
                      <p className="font-semibold text-gray-900">₹{pricing.breakfast}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guide</p>
                      <p className="font-semibold text-gray-900">₹{pricing.guide}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lunch (Veg)</p>
                      <p className="font-semibold text-gray-900">₹{pricing.lunchVeg}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lunch (Non-Veg)</p>
                      <p className="font-semibold text-gray-900">₹{pricing.lunchNonVeg}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created: {pricing.createdAt}
                  </div>
                  <div className="text-sm text-gray-500">{pricing.updatedAt}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {pricesToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-2">Delete Pricing?</h3>
              <button onClick={() => setPricesToDelete(null)} className="p-1" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pricing entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPricesToDelete(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pricesToDelete?._id) {
                    await deletePricing(pricesToDelete._id);
                    if (typeof getPricing === "function") await getPricing();
                  }
                  setPricesToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {pricesToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/25 backdrop-blur-sm z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">Edit Pricing</h3>
              <button onClick={() => setPricesToUpdate(null)} className="p-1" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 gap-4">
              {/* Package select */}
              <div>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Package</span>
                  <select name="package_id" value={formData.package_id} onChange={handleChange} className="border rounded px-3 py-2">
                    <option value="">-- select package --</option>
                    {safePackages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.package_name}
                      </option>
                    ))}
                  </select>
                  {errors.package_id && <span className="text-xs text-red-500 mt-1">{errors.package_id}</span>}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Entry Adult (₹)</span>
                  <input name="entryAdult" value={formData.entryAdult} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" placeholder="e.g. 200" />
                  {errors.entryAdult && <span className="text-xs text-red-500 mt-1">{errors.entryAdult}</span>}
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Entry Child (₹)</span>
                  <input name="entryChild" value={formData.entryChild} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" placeholder="e.g. 100" />
                  {errors.entryChild && <span className="text-xs text-red-500 mt-1">{errors.entryChild}</span>}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Snow Adult (₹)</span>
                  <input name="snowAdult" value={formData.snowAdult} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.snowAdult && <span className="text-xs text-red-500 mt-1">{errors.snowAdult}</span>}
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Snow Child (₹)</span>
                  <input name="snowChild" value={formData.snowChild} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.snowChild && <span className="text-xs text-red-500 mt-1">{errors.snowChild}</span>}
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Breakfast (₹)</span>
                  <input name="breakfast" value={formData.breakfast} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.breakfast && <span className="text-xs text-red-500 mt-1">{errors.breakfast}</span>}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Lunch Veg (₹)</span>
                  <input name="lunchVeg" value={formData.lunchVeg} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.lunchVeg && <span className="text-xs text-red-500 mt-1">{errors.lunchVeg}</span>}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Lunch Non-Veg (₹)</span>
                  <input name="lunchNonVeg" value={formData.lunchNonVeg} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.lunchNonVeg && <span className="text-xs text-red-500 mt-1">{errors.lunchNonVeg}</span>}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Guide (₹)</span>
                  <input name="guide" value={formData.guide} onChange={handleChange} inputMode="numeric" className="border rounded px-3 py-2" />
                  {errors.guide && <span className="text-xs text-red-500 mt-1">{errors.guide}</span>}
                </label>

                <div className="flex items-end justify-end gap-3">
                  <button type="button" onClick={() => setPricesToUpdate(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className={`px-4 py-2 rounded-lg ${isUpdating ? "bg-green-300 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"} transition`}>
                    {isUpdating ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal (responsive) */}
      {pricesToCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/25 backdrop-blur-sm z-50 px-2">
          {/* outer overlay click area */}
          <div className="absolute inset-0" onClick={() => setPricesToCreate(false)} />

          {/* responsive modal container */}
          <div className="relative z-10 bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-3xl mx-4 sm:mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Add Pricing</h1>
              <button onClick={() => setPricesToCreate(false)} className="p-1" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* form wrapper uses compact padding on small screens */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package select (required) */}
              <div>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Package</span>
                  <select name="package_id" value={formData.package_id} onChange={handleChange} className="border rounded px-3 py-2">
                    <option value="">-- select package --</option>
                    {safePackages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.package_name}
                      </option>
                    ))}
                  </select>
                  {errors.package_id && <span className="text-xs text-red-500 mt-1">{errors.package_id}</span>}
                </label>
              </div>

              {/* Entry Tickets */}
              <div className="rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Ticket className="text-blue-500" size={18} /> Entry Tickets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="entryAdult"
                      placeholder="Adult Price"
                      value={formData.entryAdult}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    {errors.entryAdult && <span className="text-xs text-red-500 mt-1">{errors.entryAdult}</span>}
                  </label>
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="entryChild"
                      placeholder="Child Price"
                      value={formData.entryChild}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    {errors.entryChild && <span className="text-xs text-red-500 mt-1">{errors.entryChild}</span>}
                  </label>
                </div>
              </div>

              {/* Snow World */}
              <div className="rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Snowflake className="text-cyan-500" size={18} /> Snow World
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="snowAdult"
                      placeholder="Adult Price"
                      value={formData.snowAdult}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    />
                    {errors.snowAdult && <span className="text-xs text-red-500 mt-1">{errors.snowAdult}</span>}
                  </label>
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="snowChild"
                      placeholder="Child Price"
                      value={formData.snowChild}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    />
                    {errors.snowChild && <span className="text-xs text-red-500 mt-1">{errors.snowChild}</span>}
                  </label>
                </div>
              </div>

              {/* Food Plans */}
              <div className="rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Utensils className="text-orange-500" size={18} /> Food Plans
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="breakfast"
                      placeholder="Breakfast Price"
                      value={formData.breakfast}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    {errors.breakfast && <span className="text-xs text-red-500 mt-1">{errors.breakfast}</span>}
                  </label>
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="lunchVeg"
                      placeholder="Veg Lunch Price"
                      value={formData.lunchVeg}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    {errors.lunchVeg && <span className="text-xs text-red-500 mt-1">{errors.lunchVeg}</span>}
                  </label>
                  <label className="flex flex-col">
                    <input
                      type="number"
                      name="lunchNonVeg"
                      placeholder="Non-Veg Lunch Price"
                      value={formData.lunchNonVeg}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    {errors.lunchNonVeg && <span className="text-xs text-red-500 mt-1">{errors.lunchNonVeg}</span>}
                  </label>
                </div>
              </div>

              {/* Guide Charges */}
              <div className="rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <User className="text-purple-500" size={18} /> Guide Charges
                </h3>
                <label className="flex flex-col">
                  <input
                    type="number"
                    name="guide"
                    placeholder="Guide Price"
                    value={formData.guide}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  />
                  {errors.guide && <span className="text-xs text-red-500 mt-1">{errors.guide}</span>}
                </label>
              </div>

              {/* Buttons inside the form */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 ${
                    isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <DollarSign size={18} /> {isSubmitting ? "Adding…" : "Add Price"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setPricesToCreate(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
