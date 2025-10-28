"use client"

import useAdminStore from "@/stores/useAdminStore"
import { useState, useEffect } from "react"
import {
  Plus,
  MapPin,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/app/components/admin/Hearder"
import DefaultPackageForm from "./DefaultPackageForm"
import UpdateDefaultPackageForm from "./UpdateDefaultPackageForm"
import ViewPackage from "./ViewPackage"
import CreateNormalPackage from "./CreateNormalPackage"
import UpdateNormalPackage from "./UpdateNormalPackage"
import DeletePackage from "./DeletePackage"


export default function PackagesPage() {

  const { getPackages, packages, updatePackage, deletePackage, createPackage, defaultPackages, createDefaultPackages, updateDefaultPackage } = useAdminStore();


  //Normal package create form popup close function
  const onCloseCreateNormal = () => {
    setForm({ package_name: "", place: "Hyderabad", nights: 0, days: 1, price: "" });
    itineraries.forEach((it) => {
      if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    });
    setItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
    setErrors({});
    setCreatedPackage(false);
  }

  //Normal package edit form popup close function
  const onCloseEditNormal = () => {
    editItineraries.forEach((it) => {
      if (it.preview && it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    });
    setToEdit(null);
    setEditForm({ package_name: "", place: "", nights: 0, days: 1, price: "" });
    setEditItineraries([{ id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" }]);
    setEditErrors({});
  };

  //Default package edit form pop up close function
  const onCloseEditDefault = () => {
    setToEditDefault(null)
  } 

  //Default package crate form popup close function
  const onCloseCreateDefault = () => {
    setCreateDefaultPackage(null)
  }

  //Delete package function 
  const confirmDelete = async (pkg) => {
    if (!pkg?._id) return;
    try {
      if (typeof deletePackage === "function") {
        await deletePackage(pkg._id);
      } else {
        alert("deletePackage not available in store");
      }
    } catch (err) {
      alert("Failed to delete package");
    } finally {
      setToDelete(null);
    }
  };

 
  // --- Helpers --- for itinerary id creation if a _id is not avilable
  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;


  //Create form for normal package
  const [form, setForm] = useState({
    package_name: "",
    place: "Hyderabad",
    nights: 0,
    days: 1,
    price: "",
  });


  //create form form normal package itineraries
  const [itineraries, setItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" },
  ]);
  

  //edit form for normal package
  const [editForm, setEditForm] = useState({
    package_name: "",
    place: "Hyderabad",
    nights: 0,
    days: 1,
    price: "",
  });


  //edit form for normal package itineraries
  const [editItineraries, setEditItineraries] = useState([
    { id: makeId(), day_number: 1, description: "", file: null, preview: "", existingImage: "" },
  ]);


  //fetching all packages api call
  useEffect(() => {
    if (typeof getPackages === "function") getPackages();

  }, []);


  //todo
  // // --- Normalized packages state (ensures stable ids/day_numbers) ---
  // const [normalizedPackages, setNormalizedPackages] = useState([]);
  // // useEffect also for setting the normalized packages
  // useEffect(() => {
  //   if (!Array.isArray(packages)) {
  //     setNormalizedPackages([]);
  //     return;
  //   }

  //   setNormalizedPackages(
  //     packages.map((p) => {
  //       const safeItins = Array.isArray(p.itineraries) ? p.itineraries : [];
  //       const mapped = safeItins.map((it, idx) => ({
  //         id: it._id ?? it.id ?? makeId(),
  //         _id: it._id ?? undefined,
  //         day_number: it.day_number ?? idx + 1,
  //         description: it.description ?? "",
  //         image: it.image ?? "",
  //         // keep any other backend fields
  //         ...it,
  //       }));
  //       return {
  //         ...p,
  //         itineraries: mapped,
  //       };
  //     })
  //   );
  // }, [packages]);

  

  //state for select both normal and default package
  const [selectedPackage, setSelectedPackage] = useState(null);

  //state for managing create normal package state if true form for creating package popup appear
  const [createdPackage, setCreatedPackage] = useState(false);

  //state for managing edit normal package if true form for editing package popup appear
  const [toEdit, setToEdit] = useState(null);

  //state for managing create default package state if true form for creating package popup appear
  const [createDefaultPackage, setCreateDefaultPackage] = useState(false)

  //state for managing edit default package if true form for editing package popup appear
  const [toEditDefault, setToEditDefault] = useState(null)

  //state for deleting both normal and default package if true dialogue box for confirmation appear
  const [toDelete, setToDelete] = useState(null);

  //errors state storing errors in create normal package form
  const [errors, setErrors] = useState({});
  
  // --- Edit form states ---
  const [editErrors, setEditErrors] = useState({});


  // --- Sync create itineraries with days. if days = 1 then only one itinerary will appear
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
  

  // --- Populate editForm & editItineraries when toEdit changes
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


  // --- Sync edit itineraries with days. if days = 1 only 1 itinerary will appear
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

  // Cleanup blob URLs on unmount for normal packages (releasing the temp memory)
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


 
  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">

      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 space-y-6 bg-gray-50">
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
            <div className="flex justify-end gap-4">
              <Button
              onClick={() => setCreatedPackage(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-md rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
              <Button
                onClick={() => setCreateDefaultPackage(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-md rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Default Package
              </Button>
              </div>
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
                        <p>
                          Adult: ₹
                          {(pkg?.pricing?.adult ?? 0).toLocaleString()}
                        </p>
                        <p>
                          Child With Bed: ₹
                          {(pkg?.pricing?.childWithBed ?? 0).toLocaleString()}
                        </p>
                        <p>
                          Child Without Bed: ₹
                          {(pkg?.pricing?.childWithoutBed ?? 0).toLocaleString()}
                        </p>
                        <p>
                          Infant: ₹
                          {(pkg?.pricing?.infant ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">{pkg.days}</p>
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
                      {pkg?.itineraries?.length > 2 && (
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
                      onClick={() => setToEditDefault(pkg)}
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
                        ₹{(pkg?.price ?? 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{pkg.days}Days</p>
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
                      {pkg?.itineraries?.length > 2 && (
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
                      onClick={() => setToEdit(pkg)}
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

          {packages?.length === 0 && (
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
        <UpdateNormalPackage toEdit={toEdit} editForm={editForm} setEditForm={setEditForm} editItineraries={editItineraries} setEditItineraries={setEditItineraries} editErrors={editErrors} setEditErrors={setEditErrors} onCloseEditNormal={onCloseEditNormal} updatePackage={updatePackage} />
      )}

      {/* Create Normal Package */}
      {createdPackage && (
        <CreateNormalPackage packages={packages} form={form} setForm={setForm} itineraries={itineraries} setItineraries={setItineraries} errors={errors} setErrors={setErrors} onCloseCreateNormal={onCloseCreateNormal} createPackage={createPackage} />
      )}

      {/* View Both Packages */}
      {selectedPackage && (
        <ViewPackage selectedPackage={selectedPackage} packages={packages} setSelectedPackage={setSelectedPackage} />
      )}
      
      {/* Create Default Package */}
      {createDefaultPackage && (
        <DefaultPackageForm onCloseCreateDefault={onCloseCreateDefault} createDefaultPackages={createDefaultPackages} />
      )}

      {/* Edit Default Package */}
      {toEditDefault && (
        <UpdateDefaultPackageForm toEditDefault={toEditDefault} onCloseEditDefault={onCloseEditDefault} updateDefaultPackage={updateDefaultPackage} />
      )}

    </div>
  )
}
