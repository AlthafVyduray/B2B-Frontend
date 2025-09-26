"use client"

import { AlertCircle } from "lucide-react";

import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ClockIcon, PlusIcon, MinusIcon, CarIcon, BuildingIcon, PackageIcon, EyeIcon, Car } from "lucide-react"
import useBookingStore from "@/stores/useBookingStore"
import Header from "../components/admin/Hearder";
import useAuthStore from "@/stores/useAuthStore";
import PackagePreview from "./PackagePreview";
import HotelPreview from "./HotelPreview";
import VehiclePreview from "./VehiclePreview";
import HotelBooking from "./HotelBooking";
import PackageBooking from "./PackageBooking";
import VehicleBooking from "./VehicleBooking";


export default function TravelBookingApp() {

  //heght issue fixing leftcard content have the height of right card content
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const left = card.querySelector(".left");
    const right = card.querySelector(".right");

    // Set left height same as right
    left.style.height = `${right.offsetHeight}px`;
  });

  //all fuctions and variables from zustand
  const { getPackages, packages, getHotelsByRating, hotels, getVehicles, vehicles, getPricing, pricing, createBooking, createDefaultBooking, defaultPackages } = useBookingStore();

  //for storing star rating for filtering hotel
  const [starRating, setStarRating] = useState("2")

  //state for identifying package is default or normal
  const [defaultPackage, setDefaultPackage] = useState(false);
  
  //state for identifying selected package
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  //state for identifying selected hotel
  const [selectedHotel, setSelectedHotel] = useState(null)
  
  //state for identifying selected vehicle
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  //validating errors in package tab
  const [errors, setErrors] = useState({});
  
  //Default package form
  const [defaultPackageForm, setDefaultPackageForm] = useState({
    package_name: "",
    package_id: "",
    pickup_date: "",
    drop_date: "",
    adults_total: 1,
    children_with_bed: 0,
    children_without_bed: 0,
    infants: 0,
    agent_commission: 0,
    base_total: 0,
    total_amount: 0
  })

  //normal package form
  const [form, setForm] = useState({

    package_name: "",
    package_id: "",

    vehicle_name: "",
    vehicle_id: "",

    pickup_date: "",
    pickup_time: "",
    pickup_location: "",
    pickup_location_other: "",

    drop_date: "",
    drop_time: "",
    drop_location: "",
    drop_location_other: "",

    adults_total: 1,
    children: 0,
    infants: 0,

    entry_ticket_needed: false,
    snow_world_needed: false,
    food_plan: "EP",
    extra_food: { breakfast: false, lunchVeg: false, lunchNonVeg: false },

    hotel_name: "",
    hotel_id: "",
    rooms: 1,
    extra_beds: 0,

    guideNeeded: false,
    
    agent_commission: 0,
    base_total: 0,
    total_amount: 0
  });


  
  //All api callls
  useEffect(() => {
    getPackages()
    getHotelsByRating(starRating)
    getVehicles()
    getPricing()
  }, [starRating, getPackages, getHotelsByRating, getVehicles, getPricing])
  

  // pick first default package if exists for select 
  const firstDefault = defaultPackages?.[0] || null;
  // for setting up the defaultPackageForm and other variables if deafault package selected first
  useEffect(() => {
    if (firstDefault) {
      setDefaultPackage(true);
      setSelectedPackage(firstDefault);
      setDefaultPackageForm((prev) => ({
        ...prev,
        package_name: firstDefault.package_name,
        package_id: firstDefault._id,
      }));
    }
  }, [firstDefault]);


  //state for vehicle type if suv is selected store suv in this state variable for dispalying suv's in VehiclePreview 
  const [vehicleType, setVehicleType] = useState("")

  //filtering all vehicle types available in the vehicle array
  const vehicleTypes = useMemo(() => {
      if (!Array.isArray(vehicles)) return [];
      const set = new Set();
      vehicles.forEach((v) => {
        const t = v?.type;
        if (t) set.add(String(t));
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    }, [vehicles]);
  
  //Filtering vehicle array by vehicle type if vehicletype is suv only suv's are stored in it
  const filteredVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    if (!vehicleType) return vehicles;
    return vehicles.filter((v) => {
      if (!v) return false;
      const t = v.type ?? v.vehicle_type ?? "";
      return String(t).trim().toLowerCase() === String(vehicleType).trim().toLowerCase();
    });
  }, [vehicles, vehicleType]);
  
  
  
  // Preview
  const [splitMode, setSplitMode] = useState("all"); // "all" | "adults"
  const [showAgentMarkup, setShowAgentMarkup] = useState(false);
  const [markupPercent, setMarkupPercent] = useState(""); // keep as string so placeholder shows
  const [submitting, setSubmitting] = useState(false);

  if (!form) return null;



  // Defensive numeric helpers
  const safeNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Keep a base total (before markup) from form; fallback to 0
  const baseTotal = safeNum(form.base_total);
  const baseTotalDefaultPackage = safeNum(defaultPackageForm.base_total);

  const totalPeople = safeNum(form.adults_total) + safeNum(form.children);
  const perHeadAll = totalPeople > 0 ? safeNum(form.total_amount) / totalPeople : safeNum(form.total_amount);
  const perHeadAdults = safeNum(form.adults_total) > 0 ? safeNum(form.total_amount) / safeNum(form.adults_total) : safeNum(form.total_amount);


  //normal package booking submit functions
  const handleSubmit = async () => {
    
    try {
      const validationErrors = validatePackage(form);
      setErrors(validationErrors);

      const hasErrors = Object.values(validationErrors).some(error => error !== "");
      if (hasErrors) {
        alert("Selecet All Package details for submit")
        setTab("package")
        return;
      }

      setSubmitting(true);

      if (typeof createBooking !== "function") {
        throw new Error("createBooking is not available");
      }

      // prepare payload copy; apply "Other" overrides if present
      const payload = { ...form };
      console.log(payload)
      if (payload.pickup_location === "Other" && (payload.pickup_location_other ?? "").trim()) {
        payload.pickup_location = payload.pickup_location_other.trim();
      }
      if (payload.drop_location === "Other" && (payload.drop_location_other ?? "").trim()) {
        payload.drop_location = payload.drop_location_other.trim();
      }
      
      await createBooking(payload);

      // success
      resetForm();
      setTab("package")
    } catch (error) {
      console.error("Failed to create booking:", error);
      // show user-friendly error UI here if you have one
    } finally {
      setSubmitting(false);
    }
  };

  //function for resetting the form and other states after normal package booking submission
  const resetForm = () => {
    setForm({
      package_name: "",
      package_id: "",

      vehicle_name: "",
      vehicle_id: "",

      pickup_date: "",
      pickup_time: "",
      pickup_location: "",
      pickup_location_other: "",

      drop_date: "",
      drop_time: "",
      drop_location: "",
      drop_location_other: "",

      adults_total: 1,
      children: 0,
      infants: 0,

      entry_ticket_needed: false,
      snow_world_needed: false,
      food_plan: "EP",
      extra_food: { breakfast: false, lunchVeg: false, lunchNonVeg: false },

      hotel_name: "",
      hotel_id: "",
      rooms: 1,
      extra_beds: 0,

      guideNeeded: false,
      
      agent_commission: 0,
      base_total: 0,
      total_amount: 0
    });
    setMarkupPercent("");
    setShowAgentMarkup(false);
    setSelectedHotel(null);
    setSelectedVehicle(null);
    setVehicleType(null)
    setSelectedPackage(null)
  };

  //function for validating the booking normal package form. only validating the package details only because other fields are optional like vehicle and hotel ....
  const validatePackage = (values) => {
    const e = {};
    if(!values.package_id) e.package = "Pacakege selection is required"
    if (!values.pickup_location) e.pickup_location = "Pickup spot is required.";
    if (values.pickup_location === "Other" && !values.pickup_location_other) {
      e.pickup_location_other = "Please enter pickup location.";
    }
    if (!values.pickup_date) e.pickup_date = "Pickup date is required.";
    else {
      const p = new Date(values.pickup_date);
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      if (p < t) e.pickup_date = "Pickup date cannot be in the past.";
    }
    if (!values.pickup_time) e.pickup_time = "Pickup time is required.";
    if (!values.drop_date) e.drop_date = "Drop date is required.";
    if (!values.drop_time) e.drop_time = "Drop time is required.";
    if (!values.drop_location) e.drop_location = "Drop location is required.";
    if (values.drop_location === "Other" && !values.drop_location_other) {
      e.drop_location_other = "Please enter drop location.";
    }
    if (Number(values.adults_total) < 1) e.adults_total = "At least 1 adult required.";
    return e;
  };

  



  const handleAgentMarkupChange = (value) => {
    // keep raw string so placeholder displays when empty
    setMarkupPercent(value);

    // parse numeric percent
    const parsed = parseFloat(value);
    const percent = Number.isFinite(parsed) ? parsed : null;

    const base = safeNum(form.base_total);

    if (percent === null) {
      // empty or invalid -> reset commission & total to base
      setForm((prev) => ({
        ...prev,
        agent_commission: 0,
        total_amount: base,
        base_total: base,
      }));
      return;
    }

    const commission = (base * percent) / 100;
    const newTotal = base + commission;

    setForm((prev) => ({
      ...prev,
      agent_commission: commission,
      base_total: base,
      total_amount: newTotal,
    }));
  };





  const handleDefaultPackageAgentMarkupChange = (value) => {
    // keep raw string so placeholder displays when empty
    setMarkupPercent(value);

    // parse numeric percent
    const parsed = parseFloat(value);
    const percent = Number.isFinite(parsed) ? parsed : null;

    const base = safeNum(defaultPackageForm.base_total);

    if (percent === null) {
      // empty or invalid -> reset commission & total to base
      setDefaultPackageForm((prev) => ({
        ...prev,
        agent_commission: 0,
        total_amount: base,
        base_total: base,
      }));
      return;
    }

    const commission = (base * percent) / 100;
    const newTotal = base + commission;

    setDefaultPackageForm((prev) => ({
      ...prev,
      agent_commission: commission,
      base_total: base,
      total_amount: newTotal,
    }));
  };

  
  //default package booking submit functions
  const handleSubmitDefault = async () => {
    
    try {
      const validationErrors = validateDefaultPackage(defaultPackageForm);
      setErrors(validationErrors);

      const hasErrors = Object.values(validationErrors).some(error => error !== "");
      if (hasErrors) {
        alert("Selecet All Package details for submit")
        setTab("package")
        return;
      }

      setSubmitting(true);

      if (typeof createDefaultBooking !== "function") {
        throw new Error("createDefaultBooking is not available");
      }

      // prepare payload copy; apply "Other" overrides if present
      const payload = { ...defaultPackageForm };
      
      
      await createDefaultBooking(payload);

      // success
      resetDefaultForm()
      setTab("package")
    } catch (error) {
      console.error("Failed to create booking:", error);
      // show user-friendly error UI here if you have one
    } finally {
      setSubmitting(false);
    }
  };


// Function for validating the booking of default package
const validateDefaultPackage = (values) => {
  const e = {};

  if (!values.pickup_date) {
    e.pickup_date = "Pickup date is required.";
  } else {
    const p = new Date(values.pickup_date);
    const t = new Date();
    t.setHours(0, 0, 0, 0);

    if (p < t) {
      e.pickup_date = "Pickup date cannot be in the past.";
    } else if (p.getDay() !== 5) { // 5 = Friday
      e.pickup_date = "Pickup date must be on a Friday.";
    }
  }

  if (!values.drop_date) e.drop_date = "Drop date is required.";
  if (Number(values.adults_total) < 1) e.adults_total = "At least 1 adult required.";

  return e;
};


  //function for resetting the form and other states after normal package booking submission
  const resetDefaultForm = () => {
    setDefaultPackageForm({
      package_name: "",
      package_id: "",
      pickup_date: "",
      drop_date: "",
      adults_total: 1,
      children_with_bed: 0,
      children_without_bed: 0,
      infants: 0,
      agent_commission: 0,
      base_total: 0,
      total_amount: 0
    })
    setMarkupPercent("");
    setShowAgentMarkup(false);
    if (firstDefault) {
      setDefaultPackage(true);
      setSelectedPackage(firstDefault);
      setDefaultPackageForm((prev) => ({
        ...prev,
        package_name: firstDefault.package_name,
        package_id: firstDefault._id,
      }));
    }
  }



  const [hotelPrice, setHotelPrice] = useState(0)
//This is for price calculation for both normal and default packages
  useEffect(() => {
    if (!form.package_id && !defaultPackageForm.package_id) return;
    if (defaultPackage) {
      let total = 0;
      console.log(total)
      const pkg = defaultPackages.find(p => p._id === defaultPackageForm.package_id);
      if (pkg) {
        if (defaultPackageForm.adults_total) {
          total += pkg.pricing.adult * defaultPackageForm.adults_total
        }
        if (defaultPackageForm.children_with_bed) {
          total += pkg.pricing.childWithBed * defaultPackageForm.children_with_bed
        }
        if (defaultPackageForm.children_without_bed) {
          total += pkg.pricing.childWithoutBed * defaultPackageForm.children_without_bed
        }
        if (defaultPackageForm.infants) {
          total += pkg.pricing.infant * defaultPackageForm.infants
        }
      }
      console.log(total)


      setDefaultPackageForm(prev => {
        if (prev.base_total === total) return prev; // avoid infinite loop
        return { ...prev, base_total: total, total_amount: total };
      });

    }

    else {
      let total = 0;

    const pkg = packages.find(p => p._id === form.package_id);
    const nights = pkg?.nights || 1;
    
    if (pkg) {
      total += pkg.price * (form.adults_total + form.children);
    }

    const price = Array.isArray(pricing)
      ? pricing.find(p => p.package_id === form.package_id)
      : null;

    if (price) {
      if (form.entry_ticket_needed) {
        total += price.entryAdult * form.adults_total + price.entryChild * form.children;
      }
      if (form.snow_world_needed) {
        total += price.snowAdult * form.adults_total + price.snowChild * form.children;
      }
      if (form.extra_food?.breakfast) {
        total += price.breakfast;
      }
      if (form.extra_food?.lunchVeg) {
        total += price.lunchVeg;
      }
      if (form.extra_food?.lunchNonVeg) {
        total += price.lunchNonVeg;
      }
      if (form.guideNeeded) {
        total += price.guide;
      }
    }

    if (form.hotel_id) {
      const hotel = Array.isArray(hotels)
        ? hotels.find(h => h._id === form.hotel_id)
        : null;

      if (hotel) {
        setHotelPrice(0)
        if (form.rooms) {
          setHotelPrice(prev => prev + hotel.pricing.roomPrice * form.rooms * nights)
          total += hotel.pricing.roomPrice * form.rooms * nights;
        }
        if (form.extra_beds) {
          setHotelPrice(prev => prev + hotel.pricing.extraBedPrice * form.extra_beds * nights)
          total += hotel.pricing.extraBedPrice * form.extra_beds * nights;
        }
        if (form.food_plan) {
          if (form.food_plan === "AP") {
            setHotelPrice(prev => prev + hotel.pricing.apPrice * nights)
            total += hotel.pricing.apPrice * nights;
          } else if (form.food_plan === "MAP") {
            setHotelPrice(prev => prev + hotel.pricing.mapPrice * nights)
            total += hotel.pricing.mapPrice * nights;
          } else if (form.food_plan === "CB") {
            setHotelPrice(prev => prev + hotel.pricing.cpPrice * nights)
            total += hotel.pricing.cpPrice * nights;
          }
        }
      }
    }
    console.log(hotelPrice)
    if (form.vehicle_id) {
      const vehicle = Array.isArray(vehicles)
        ? vehicles.find(v => v._id === form.vehicle_id)
        : null;

      if (vehicle) {
        total += vehicle.price * (pkg?.days || 1);
      }
      }
      console.log(total)

    setForm(prev => {
      if (prev.base_total === total) return prev; // avoid infinite loop
      return { ...prev, base_total: total, total_amount: total };
    });
    }
    
  }, [
    form.package_id,
    form.adults_total,
    form.children,
    form.entry_ticket_needed,
    form.snow_world_needed,
    form.hotel_id,
    form.rooms,
    form.extra_beds,
    form.food_plan,
    form.vehicle_id,
    form.extra_food,
    form.guideNeeded,
    packages,
    pricing,
    hotels,
    vehicles,
    defaultPackage,
    defaultPackageForm.package_id,
    defaultPackageForm.adults_total,
    defaultPackageForm.children_without_bed,
    defaultPackageForm.infants,
    defaultPackageForm.children_with_bed
  ]);



  
  

// this state for tab switching when next and prev button click
const [tab, setTab] = useState("package");

// tab order for identifying next and prev tabs
const tabOrder = ["package", "vehicle", "hotel", "preview"];

// Handle next when clicking next button 
const goNext = () => {
  const currentIndex = tabOrder.indexOf(tab);
  let nextIndex = currentIndex + 1;

  while (
    nextIndex < tabOrder.length &&
    defaultPackage &&
    (tabOrder[nextIndex] === "vehicle" || tabOrder[nextIndex] === "hotel")
  ) {
    nextIndex++; // skip vehicle & hotel if defaultPackage
  }

  if (nextIndex < tabOrder.length) {
    setTab(tabOrder[nextIndex]);
  }
};

  
// Handle Prev when clicking prev button 
const goPrev = () => {
  const currentIndex = tabOrder.indexOf(tab);
  let prevIndex = currentIndex - 1;

  while (
    prevIndex >= 0 &&
    defaultPackage &&
    (tabOrder[prevIndex] === "vehicle" || tabOrder[prevIndex] === "hotel")
  ) {
    prevIndex--; // skip vehicle & hotel if defaultPackage
  }

  if (prevIndex >= 0) {
    setTab(tabOrder[prevIndex]);
  }
};

//If validation error is there in package tab cant go to the next tab it is only for next button in package tab
const handleNext = () => {
  if (defaultPackage) {
    const validationErrors = validateDefaultPackage(defaultPackageForm);
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );
    if (hasErrors) return;

    goNext();
    return;
  }


  const validationErrors = validatePackage(form);
  setErrors(validationErrors);

  const hasErrors = Object.values(validationErrors).some(
    (error) => error !== ""
  );
  if (hasErrors) return;

  goNext();
};



  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto lg:px-4 px-3 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center">
            <img src="/images/logo.jpg" alt="" className="h-18   object-contain" />
          </div>
          <h1 className="text-4xl font-light text-foreground mb-2">Book Your Adventure</h1>
          <p className="text-muted-foreground text-lg">
            Create unforgettable memories with our curated travel experiences
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="package" className="flex items-center gap-2">
              <PackageIcon className="w-4 h-4" />
              Package
            </TabsTrigger>

            <TabsTrigger
              value="vehicle"
              className="flex items-center gap-2"
              disabled={defaultPackage} // disable if defaultPackage is true
            >
              <CarIcon className="w-4 h-4" />
              Vehicle
            </TabsTrigger>

            <TabsTrigger
              value="hotel"
              className="flex items-center gap-2"
              disabled={defaultPackage} // disable if defaultPackage is true
            >
              <BuildingIcon className="w-4 h-4" />
              Hotel
            </TabsTrigger>

            <TabsTrigger value="preview" className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>



          <div >
            <div className="lg:col-span-3">

              <div >
                <TabsContent value="package" className="space-y-6 grid lg:grid-cols-2 gap-6 ">
                  <PackagePreview selectedPackage={selectedPackage}/>

                  <PackageBooking selectedPackage={selectedPackage} setSelectedPackage={setSelectedPackage} defaultPackage={defaultPackage} setDefaultPackage={setDefaultPackage} defaultPackages={defaultPackages} packages={packages} form={form} setForm={setForm} defaultPackageForm={defaultPackageForm} setDefaultPackageForm={setDefaultPackageForm} errors={errors} handleNext={handleNext} />
                  
                </TabsContent>
              </div>

              
              <TabsContent value="hotel" className="space-y-6 grid lg:grid-cols-2 gap-6">
                <HotelPreview hotels={hotels} selectedHotel={selectedHotel} setSelectedHotel={setSelectedHotel} setForm={setForm} />
                <HotelBooking starRating={starRating} setStarRating={setStarRating} selectedHotel={selectedHotel}  form={form} setForm={setForm} goPrev={goPrev} goNext={goNext}/>
              </TabsContent>

              
              <TabsContent value="vehicle" className="space-y-6 grid lg:grid-cols-2 gap-6">
                <VehiclePreview vehicleType={vehicleType} filteredVehicles={filteredVehicles} selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} setForm={setForm} />
                <VehicleBooking vehicleType={vehicleType} setVehicleType={setVehicleType} vehicleTypes={vehicleTypes} form={form} setForm={setForm} goPrev={goPrev} goNext={goNext} />
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <EyeIcon className="w-5 h-5 text-primary" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  {!defaultPackage ? (
                    <CardContent className="space-y-6">
                    {selectedPackage ? (
                      <>
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Package</h3>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium mb-3">{form.package_name}</p>
                              <div className="mb-3">
                                <p>Pickup:</p>
                                <p className="font-medium">pickup date: {form.pickup_date ? form.pickup_date : "--Not Selected--"}</p>
                                <p className="font-medium">pickup time: {form.pickup_time ? form.pickup_time : "--Not Selected--"}</p>
                                <p className="font-medium">pickup location: {(form.pickup_location && form.pickup_location === "Other") ? form.pickup_location_other : form.pickup_location}</p>
                              </div>
                              <div className="mb-3">
                                <p>Drop:</p>
                                <p className="font-medium">drop date: {form.drop_date ? form.drop_date : "--Not Selected--"}</p>
                                <p className="font-medium">drop time: {form.drop_time ? form.drop_time : "--Not Selected--"}</p>
                                <p className="font-medium">drop location: {(form.drop_location && form.drop_location === "Other") ? form.drop_location_other : form.drop_location}</p>
                              </div>

                            </div>
                            <span className="font-bold text-primary">₹{selectedPackage.price * (form.adults_total + form.children)}</span>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-4">Itineraries</h3>
                          <div className="flex flex-col gap-4">
                            {selectedPackage?.itineraries?.map((item, index) => (
                              <div
                                key={item.id ?? index}
                                className="flex flex-col md:flex-row items-start gap-4 w-full rounded-md overflow-hidden shadow-sm"
                              >
                                {/* Left: image */}
                                <div className="relative w-full md:w-1/3 h-48 rounded-md flex-shrink-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${item.image || PLACEHOLDER})` }}
                                    role="img"
                                    aria-label={item.description ? item.description.slice(0, 100) : "Itinerary image"}>
                                  
                                  {/* Day number badge */}
                                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                                    Day {item.day_number}
                                  </div>
                                </div>

                                {/* Right: description */}
                                <div className="flex-1 flex items-center">
                                  <div className="rounded w-full">
                                    <p className="text-sm text-black leading-snug line-clamp-6">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </>
                      
                    ) : (
                      <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Package</h3>
                          <span>You are not selected any packages</span>
                      </div>
                    )}

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Travelers</h3>
                      <div className="space-y-1">
                        {form.adults_total > 0 && <p>Adults: {form.adults_total}</p>}
                        {form.children > 0 && <p>Children: {form.children}</p>}
                        {form.infants > 0 && <p>Infants: {form.infants}</p>}
                      </div>
                    </div>

                    {(selectedHotel && form.hotel_name) ? (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Hotel</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{form.hotel_name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(selectedHotel.starRating)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="font-medium">Rooms: {form.rooms}</p>
                            <p className="font-medium">Extra Beds: {form.extra_beds ? form.extra_beds : "0"}</p>
                            <p className="font-medium">Food Plan: {form.food_plan && form.food_plan}</p>
                            
                          </div>
                          <span className="font-bold text-primary">₹{hotelPrice}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Hotel</h3>
                        <span>You are not selected any hotels</span>
                      </div>
                    )}

                    {(selectedVehicle && form.vehicle_name) ? (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Vehicle</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{form.vehicle_name ? form.vehicle_name : "--Not Selected--"}</p>
                            <p className="text-sm text-muted-foreground">{(form.vehicle_name && selectedVehicle) ? selectedVehicle.type : "--Not Selected--"}</p>
                          </div>
                          <span className="font-bold text-primary">{(form.vehicle_name && selectedVehicle && selectedPackage) && `₹${selectedVehicle.price* selectedPackage.days}`}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Vehicle</h3>
                        <span>You are not selected any vehicles</span>
                      </div>
                    )}

                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Extras</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Extra Food: <span>{form.extra_food.breakfast && "Breakfast,"}</span> <span>{form.extra_food.lunchNonVeg && "lunchNonVeg,"}</span> <span>{form.extra_food.lunchVeg && "lunchVeg"}</span> </p>
                          <p className="text-sm">Guide Needed: {form.guideNeeded ? "Yes" : "No"}</p>
                          <p className="text-sm">Entry ticket : {form.entry_ticket_needed  ? "Yes" : "No"}</p>
                          <p className="text-sm">Snow world ticket : {form.snow_world_needed  ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                
                    

                    <div className="border-t pt-4">
                      <div className="flex-1 space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showAgentMarkup}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowAgentMarkup(checked);
                              if (!checked) {
                                // reset totals
                                setForm((prev) => ({
                                  ...prev,
                                  total_amount: prev.base_total ?? 0,
                                  base_total: prev.base_total ?? 0,
                                  agent_commission: 0,
                                }));
                                setMarkupPercent("");
                              }
                            }}
                            className="w-5 h-5"
                          />
                          <span>Add Agent Markup</span>
                        </label>

                        {showAgentMarkup && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={markupPercent}
                              onChange={(e) => handleAgentMarkupChange(e.target.value)}
                              placeholder="Enter %"
                              min="0"
                              step="0.01"
                              className="border p-2 rounded w-28"
                            />
                            <span className="text-sm">%</span>
                          </div>
                        )}

                        {showAgentMarkup && (
                          <p className="text-gray-700">
                            Agent Commission: ₹{(form.agent_commission ?? 0).toFixed(2)}
                          </p>
                        )}

                        <p className="font-bold text-lg text-gray-900">
                          Total Amount: ₹{(form.total_amount ?? 0).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="splitMode"
                              value="all"
                              checked={splitMode === "all"}
                              onChange={() => setSplitMode("all")}
                              className="w-4 h-4"
                            />
                            <span>Split among Adults + Children</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="splitMode"
                              value="adults"
                              checked={splitMode === "adults"}
                              onChange={() => setSplitMode("adults")}
                              className="w-4 h-4"
                            />
                            <span>Split among Adults Only</span>
                          </label>
                        </div>

                        {splitMode === "all" ? (
                          <p className="font-bold text-lg text-gray-900">
                            Per Head Amount: ₹{Number(perHeadAll ?? 0).toFixed(2)}
                          </p>
                        ) : (
                          <p className="font-bold text-lg text-gray-900">
                            Per Head Amount (Adults Only): ₹{Number(perHeadAdults ?? 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        *Final price may vary based on availability and additional services
                      </p>
                    </div>

                    <div className="mt-3 flex justify-between">
                      <button onClick={goPrev} className="px-4 py-2 bg-teal-600 text-white rounded ">
                        ← Prev
                      </button>
                      <span></span>
                    </div>

                    <Button className="w-full" size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}>
                      Confirm Booking
                    </Button>
                  </CardContent>
                  ) : (
                    <CardContent className="space-y-6">
                    {selectedPackage ? (
                      <>
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Package</h3>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium mb-3">{defaultPackageForm.package_name}</p>
        
                            </div>
                            <span className="font-bold text-primary">₹{defaultPackageForm.base_total}</span>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-4">Itineraries</h3>
                          <div className="flex flex-col gap-4">
                            {selectedPackage?.itineraries?.map((item, index) => (
                              <div
                                key={item.id ?? index}
                                className="flex flex-col md:flex-row items-start gap-4 w-full rounded-md overflow-hidden shadow-sm"
                              >
                                {/* Left: image */}
                                <div className="relative w-full md:w-1/3 h-48 rounded-md flex-shrink-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${item.image || PLACEHOLDER})` }}
                                    role="img"
                                    aria-label={item.description ? item.description.slice(0, 100) : "Itinerary image"}>
                                  
                                  {/* Day number badge */}
                                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                                    Day {item.day_number}
                                  </div>
                                </div>

                                {/* Right: description */}
                                <div className="flex-1 flex items-center">
                                  <div className="rounded w-full">
                                    <p className="text-sm text-black leading-snug line-clamp-6">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </>
                      
                    ) : (
                      <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Package</h3>
                          <span>You are not selected any packages</span>
                      </div>
                    )}

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Travelers</h3>
                      <div className="space-y-1">
                        {defaultPackageForm.adults_total > 0 && <p>Adults: {defaultPackageForm.adults_total}</p>}
                        {defaultPackageForm.children_with_bed > 0 && <p>Child With Bed: {defaultPackageForm.children_with_bed}</p>}
                        {defaultPackageForm.children_without_bed > 0 && <p>Child Without Bed: {defaultPackageForm.children_without_bed}</p>}
                        {defaultPackageForm.infants > 0 && <p>Infants: {defaultPackageForm.infants}</p>}
                        
                            
                      </div>
                    </div>


                    {selectedPackage?.inclusions && selectedPackage.inclusions.length > 0 && (
                      <div className="border rounded-lg shadow-sm p-5 mt-4 bg-white">
                        <h3 className="font-semibold text-lg text-gray-800 mb-4">Inclusions</h3>
                        <ul className="space-y-3">
                          {selectedPackage.inclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              {/* Checkmark icon */}
                              <svg
                                className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L9 12.086l6.793-6.793a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

              <div className="border rounded-lg shadow-sm p-5 mt-4 bg-white">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Price Details</h3>
                {selectedPackage?.pricing && (
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-2xl shadow bg-white border">
                    <p className="text-gray-500 text-sm">Per Adult</p>
                    <p className="text-xl font-bold">
                      ₹{selectedPackage.pricing.adult.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl shadow bg-white border">
                    <p className="text-gray-500 text-sm">Child with Bed (6–12 yrs)</p>
                    <p className="text-xl font-bold">
                      ₹{selectedPackage.pricing.childWithBed.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl shadow bg-white border">
                    <p className="text-gray-500 text-sm">Child without Bed (2–5 yrs)</p>
                    <p className="text-xl font-bold">
                      ₹{selectedPackage.pricing.childWithoutBed.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl shadow bg-white border">
                    <p className="text-gray-500 text-sm">Infant</p>
                    <p className="text-xl font-bold">
                      ₹{selectedPackage.pricing.infant.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

                <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-700">Traveler Breakdown</h3>
                <div className="space-y-2">
                  {defaultPackageForm.adults_total > 0 && (
                    <div className="grid grid-cols-3 text-sm">
                      <span>Adults</span>
                      <span className="text-center">
                        {defaultPackageForm.adults_total} × {selectedPackage?.pricing?.adult}
                      </span>
                      <span className="text-right font-medium">
                        {defaultPackageForm.adults_total * selectedPackage?.pricing?.adult}
                      </span>
                    </div>
                  )}

                  {defaultPackageForm.children_with_bed > 0 && (
                    <div className="grid grid-cols-3 text-sm">
                      <span>Child With Bed</span>
                      <span className="text-center">
                        {defaultPackageForm.children_with_bed} × {selectedPackage?.pricing?.childWithBed}
                      </span>
                      <span className="text-right font-medium">
                        {defaultPackageForm.children_with_bed * selectedPackage?.pricing?.childWithBed}
                      </span>
                    </div>
                  )}

                  {defaultPackageForm.children_without_bed > 0 && (
                    <div className="grid grid-cols-3 text-sm">
                      <span>Child Without Bed</span>
                      <span className="text-center">
                        {defaultPackageForm.children_without_bed} × {selectedPackage?.pricing?.childWithoutBed}
                      </span>
                      <span className="text-right font-medium">
                        {defaultPackageForm.children_without_bed * selectedPackage?.pricing?.childWithoutBed}
                      </span>
                    </div>
                  )}

                  {defaultPackageForm.infants > 0 && (
                    <div className="grid grid-cols-3 text-sm">
                      <span>Infants</span>
                      <span className="text-center">
                        {defaultPackageForm.infants} × {selectedPackage?.pricing?.infant}
                      </span>
                      <span className="text-right font-medium">
                        {defaultPackageForm.infants * selectedPackage?.pricing?.infant}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="grid grid-cols-3 text-sm font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span></span>
                    <span className="text-right">{defaultPackageForm.base_total}</span>
                  </div>
                </div>
              </div>

              </div>         
    

                    <div className="border-t pt-4">
                      <div className="flex-1 space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showAgentMarkup}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowAgentMarkup(checked);
                              if (!checked) {
                                // reset totals
                                setDefaultPackageForm((prev) => ({
                                  ...prev,
                                  total_amount: prev.base_total ?? 0,
                                  base_total: prev.base_total ?? 0,
                                  agent_commission: 0,
                                }));
                                setMarkupPercent("");
                              }
                            }}
                            className="w-5 h-5"
                          />
                          <span>Add Agent Markup</span>
                        </label>

                        {showAgentMarkup && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={markupPercent}
                              onChange={(e) => handleDefaultPackageAgentMarkupChange(e.target.value)}
                              placeholder="Enter %"
                              min="0"
                              step="0.01"
                              className="border p-2 rounded w-28"
                            />
                            <span className="text-sm">%</span>
                          </div>
                        )}

                        {showAgentMarkup && (
                          <p className="text-gray-700">
                            Agent Commission: ₹{(defaultPackageForm.agent_commission ?? 0).toFixed(2)}
                          </p>
                        )}

                        <p className="font-bold text-lg text-gray-900">
                          Total Amount: ₹{(defaultPackageForm.total_amount ?? 0).toFixed(2)}
                        </p>

                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        *Final price may vary based on availability and additional services
                      </p>
                    </div>

                    <div className="mt-3 flex justify-between">
                      <button onClick={goPrev} className="px-4 py-2 bg-teal-600 text-white rounded ">
                        ← Prev
                      </button>
                      <span></span>
                    </div>

                    <Button className="w-full" size="lg"
                      onClick={handleSubmitDefault}
                      disabled={submitting}>
                      Complete Booking
                    </Button>
                  </CardContent>
                  )}
                </Card>
              </TabsContent>
            </div>

            {/* <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-lg p-4 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        $
                        {(selectedPackage?.price || 0) +
                          (selectedHotel?.price || 0) * 3 +
                          (selectedVehicle?.price || 0) * 3}
                      </span>
                      <p className="text-sm text-muted-foreground">Total Estimated</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package:</span>
                      <span>{selectedPackage ? selectedPackage.name : "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel:</span>
                      <span>{selectedHotel ? selectedHotel.name : "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{selectedVehicle ? selectedVehicle.name : "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travelers:</span>
                      <span>{travelers.adults + travelers.children + travelers.infants}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-transparent" variant="outline">
                    Continue to Book
                  </Button>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
