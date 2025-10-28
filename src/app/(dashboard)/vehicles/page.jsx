"use client";

import useAdminStore from "@/stores/useAdminStore";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Bus,
  Truck,
  Users,
  Fuel,
  MapPin,
  Star,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Tag,
  DollarSign,
} from "lucide-react";
import Header from "@/app/components/admin/Hearder";

export default function VehiclesPage() {
  const { vehicles, getVehicles, deleteVehicle, updateVehicle } =
    useAdminStore();

  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicleToUpdate, setVehicleToUpdate] = useState(null);
  const [vehicleToCreate, setVehicleToCreate] = useState(false);
  const [updatedVehicle, setUpdatedVehicle] = useState({
    name: "",
    type: "",
    capacity: "",
    price: "",
  });

  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");

  // Extract unique vehicle types dynamically
  const vehicleTypes = useMemo(() => {
    const types = vehicles.map((v) => v.type).filter(Boolean); // remove null/undefined
    return [...new Set(types)]; // unique types
  }, [vehicles]);

  // Apply filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesName = v.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesType = filterType ? v.type === filterType : true;
      return matchesName && matchesType;
    });
  }, [vehicles, filterName, filterType]);

  useEffect(() => {
    getVehicles();
  }, [vehicleToUpdate]);

  const [vehicle, setVehicle] = useState({
    name: "",
    type: "",
    capacity: "",
    price: "",
  });

  const { createVehicle } = useAdminStore();

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createVehicle(vehicle);
    setVehicleToCreate(false);
    setVehicle({ name: "", type: "", capacity: "", price: "" });
  };

  const handleCancel = () => {
    setVehicle({ name: "", type: "", capacity: "", price: "" });
    setVehicleToCreate(false);
  };

  // Handle Update Modal Form Change
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Update Modal with Current Vehicle Data
  const openUpdateModal = (vehicle) => {
    setUpdatedVehicle({
      name: vehicle.name,
      type: vehicle.type,
      capacity: vehicle.capacity,
      price: vehicle.price,
    });
    setVehicleToUpdate(vehicle);
  };

  const getVehicleIcon = (type) => {
    switch (type.toLowerCase()) {
      case "suv":
      case "sedan":
        return <Car className="h-5 w-5" />;
      case "bus":
      case "van":
        return <Bus className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex mt-14 lg:mt-0">
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 space-y-6 bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-balance">
                Vehicle Fleet Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your travel agency vehicle fleet
              </p>
            </div>
            <Button
              onClick={() => setVehicleToCreate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm: justify-between gap-4 p-4 rounded-lg border bg-background">
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 w-full sm:w-1/2"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 w-full sm:w-1/4"
            >
              <option value="">All Types</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle._id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getVehicleIcon(vehicle.type)}
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {vehicle.name}
                        </CardTitle>
                        <p className="text-md text-gray-900">{vehicle.type}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vehicle Image */}
                  <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Capacity: {vehicle.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ₹{vehicle.price}/day
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => openUpdateModal(vehicle)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setVehicleToDelete(vehicle)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex-1 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No vehicles found
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Vehicle
              </h3>
              <button onClick={() => setVehicleToDelete(null)}>
                <X size={22} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{vehicleToDelete.name}</span>?
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-4">
              <button
                onClick={() => setVehicleToDelete(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteVehicle(vehicleToDelete._id);
                  setVehicleToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Vehicle Modal */}
      {vehicleToUpdate && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl relative border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Vehicle
              </h3>
              <button onClick={() => setVehicleToUpdate(null)}>
                <X size={22} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateVehicle(vehicleToUpdate._id, updatedVehicle);
                setVehicleToUpdate(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={updatedVehicle.name}
                  onChange={handleUpdateChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={updatedVehicle.type}
                  onChange={handleUpdateChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={updatedVehicle.capacity}
                  onChange={handleUpdateChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={updatedVehicle.price}
                  onChange={handleUpdateChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setVehicleToUpdate(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-medium"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {vehicleToCreate && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] border border-gray-200">
            {/* Form Card */}
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Add Vehicle
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Vehicle Name */}
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Vehicle Name
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                    <Car className="text-gray-400 mr-2" size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter vehicle name"
                      value={vehicle.name}
                      onChange={handleChange}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Vehicle Type
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                    <Tag className="text-gray-400 mr-2" size={18} />
                    <input
                      type="text"
                      name="type"
                      placeholder="Enter vehicle type (e.g., Sedan, SUV, Bus)"
                      value={vehicle.type}
                      onChange={handleChange}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Capacity
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                    <Users className="text-gray-400 mr-2" size={18} />
                    <input
                      type="number"
                      name="capacity"
                      placeholder="Enter passenger capacity"
                      value={vehicle.capacity}
                      onChange={handleChange}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Price
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                    <DollarSign className="text-gray-400 mr-2" size={18} />
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price per day"
                      value={vehicle.price}
                      onChange={handleChange}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Add Vehicle
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                    onClick={() => handleCancel()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
