"use client"

import { AlertCircle } from "lucide-react";

import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, PlusIcon, MinusIcon, CarIcon, BuildingIcon, PackageIcon, EyeIcon, Car } from "lucide-react"
import useBookingStore from "@/stores/useBookingStore"
import Header from "../components/admin/Hearder";
import useAuthStore from "@/stores/useAuthStore";


export default function TravelBookingApp() {

  const todayISO = new Date().toISOString().slice(0, 10);
  
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


  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const [hotelPrice, setHotelPrice] = useState(0)

  const [errors, setErrors] = useState({});

  const [starRating, setStarRating] = useState("2")

 

  const { getPackages, packages, getHotelsByRating, hotels, getVehicles, vehicles, getPricing, pricing, createBooking } = useBookingStore();

  //Package
  const inc = (field) => changeField(field, Number(form[field] || 0) + 1);
  const dec = (field, min = 0) =>
    changeField(field, Math.max(min, Number(form[field] || 0) - 1));
  const changeField = (name, value) => setForm((p) => ({ ...p, [name]: value }));


//Hotel
  const change = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "rooms" && next.extra_beds > value) {
        next.extra_beds = value;
      }
      return next;
    });
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const incRooms = () =>
    setForm((p) => {
      const rooms = Math.min(p.adults_total, p.rooms + 1);
      return { ...p, rooms, extra_beds: Math.min(p.extra_beds, rooms) };
    });
  const decRooms = () =>
    setForm((p) => {
      const rooms = Math.max(1, p.rooms - 1);
      return { ...p, rooms, extra_beds: Math.min(p.extra_beds, rooms) };
    });

  // extra_beds counter handlers (0..rooms)
  const incextra_beds = () =>
    setForm((p) => ({ ...p, extra_beds: Math.min(p.rooms, p.extra_beds + 1) }));
  const decextra_beds = () =>
    setForm((p) => ({ ...p, extra_beds: Math.max(0, p.extra_beds - 1) }));


  const validateBeforeNext = () => {
    const e = {};
    if (form.hotel_name && form.rooms < 1) e.rooms = "At least one room required";
    if (FormDataEvent.hotel_name && (form.extra_beds < 0 || form.extra_beds > form.rooms))
      e.extra_beds = `Extra beds must be between 0 and ${form.rooms}`;
    return e;
  };


  //Vehicles
  const [vehicleType, setVehicleType] = useState("")
  const vehicleTypes = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    const set = new Set();
    vehicles.forEach((v) => {
      const t = v?.type;
      if (t) set.add(String(t));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [vehicles]);
  
  const toggleextra_food = (key) =>
    setForm((p) => ({
      ...p,
      extra_food: { ...(p.extra_food || {}), [key]: !((p.extra_food || {})[key]) },
    }));
  
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

  const totalPeople = safeNum(form.adults_total) + safeNum(form.children);
  const perHeadAll = totalPeople > 0 ? safeNum(form.total_amount) / totalPeople : safeNum(form.total_amount);
  const perHeadAdults = safeNum(form.adults_total) > 0 ? safeNum(form.total_amount) / safeNum(form.adults_total) : safeNum(form.total_amount);

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

  const handleSubmit = async () => {
    
    try {
      const validationErrors = validatePackage(form);
      setErrors(validationErrors);

      const hasErrors = Object.values(validationErrors).some(error => error !== "");
      if (hasErrors) {
        alert("Selecet All Package details for submit")
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

  //heght issue fixing leftcard content have the height of right card content
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const left = card.querySelector(".left");
    const right = card.querySelector(".right");

    // Set left height same as right
    left.style.height = `${right.offsetHeight}px`;
  });

  

  useEffect(() => {
    const { pickup_date } = form || {};
    if (pickup_date && selectedPackage?.days) {
      const p = new Date(pickup_date);
      const d = new Date(p);
      d.setDate(p.getDate() + selectedPackage.days - 1);
      const dropISO = d.toISOString().slice(0, 10);
      setForm((prev) => ({
        ...prev,
        drop_date: dropISO,
      }));
    }
  }, [form?.pickup_date, selectedPackage?.days, setForm]);

  useEffect(() => {
    if (!form.package_id) return;

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
    vehicles
  ]);

  const {user} = useAuthStore()

  useEffect(() => {
    if(!user) return
    getPackages()
    getHotelsByRating(starRating)
    getVehicles()
    getPricing()
  }, [starRating, getPackages, getHotelsByRating, getVehicles, getPricing])
  

  // const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const [tab, setTab] = useState("package");
  // Define order of tabs
  const tabOrder = ["package", "hotel", "vehicle", "preview"];

  // Handle next
  const goNext = () => {
    const currentIndex = tabOrder.indexOf(tab);
    if (currentIndex < tabOrder.length - 1) {
      setTab(tabOrder[currentIndex + 1]);
    }
  };
  
  const goPrev = () => {
    const currentIndex = tabOrder.indexOf(tab);
    if (currentIndex > 0) {
      setTab(tabOrder[currentIndex - 1]);
    }
  }

  const handleNext = () => {
  const validationErrors = validatePackage(form);
  setErrors(validationErrors);

  const hasErrors = Object.values(validationErrors).some(error => error !== "");
  if (hasErrors) return;

  goNext();
};

  
  const getVehicleIcon = (type) => {
    switch (type.toLowerCase()) {
      case "suv":
      case "sedan":
        return <Car className="h-5 w-5" />
      case "bus":
      case "van":
        return <Bus className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

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
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <BuildingIcon className="w-4 h-4" />
              Hotel
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center gap-2">
              <CarIcon className="w-4 h-4" />
              Vehicle
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
                  <Card className="max-h-[800px]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PackageIcon className="w-5 h-5 text-primary" />
                        Choose Your Adventure Package
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto">
                      {!selectedPackage ? (
                        <p className="text-muted-foreground">Select a package to view itineraries</p>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">{selectedPackage.package_name}</h3>
                            {/* {selectedPackage.itineraries.map((item, index) => (
                              <div className="grid grid-cols-2 items-center bg-[#eeececd0] rounded-md  gap-4 w-full" key={index}>
                                <div>
                                  <img src={item.image} alt="" className="h-40 rounded-md w-full object-cover"/>
                                </div>
                                <div>
                                  <p>{item.description}</p>
                                </div>
                              </div>
                            ))} */}
                            {selectedPackage?.itineraries?.map((item, index) => (
                              <div
                                key={item.id ?? index}
                                className="relative w-full h-80 rounded-md overflow-hidden shadow-sm"
                                // set background image (use placeholder when missing)
                                style={{
                                  backgroundImage: `url(${item.image || PLACEHOLDER})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  backgroundRepeat: "no-repeat",
                                }}
                                role="img"
                                aria-label={item.description ? item.description.slice(0, 100) : "Itinerary image"}
                              >
                                {/* overlay to darken image for readable text */}
                                <div className="absolute inset-0 bg-black/40" />

                                {/* text content — positioned at bottom */}
                                <div className="absolute inset-0 flex items-end p-4">
                                  <div className="bg-gradient-to-t from-black/70 to-transparent px-3 py-2 rounded w-full">
                                    <p className="text-sm text-white leading-snug line-clamp-3">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>

                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Travel Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                      <div className="space-y-2 w-full">
                        <Label htmlFor="package">Select Package</Label>
                        <Select
                          value={form.package_id}
                          onValueChange={(value) => {
                            const pkg = packages.find(p => p._id === value);
                            setSelectedPackage(pkg);
                            setForm(prev => ({
                              ...prev,
                              package_name: pkg?.package_name,
                              package_id: pkg?._id
                            }));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages.map((pkg) => (
                              <SelectItem key={pkg._id} value={pkg._id}>
                                {pkg.package_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.package && (
                          <div className="text-xs text-red-600 mt-1">{errors.package}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="pickup_location">Pickup Spot</Label>
                            <Select
                              id="pickup_location" placeholder="Select Pickup Spot" name="pickup_location"
                              value={form.pickup_location}
                              onValueChange={(value) => {
                                changeField("pickup_location", value)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Airport">Airport</SelectItem>
                                <SelectItem value="Railway Station">Railway Station</SelectItem>
                                <SelectItem value="Bus Stop">Bus Stop</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.pickup_location && (
                              <div className="text-xs text-red-600 mt-1">{errors.pickup_location}</div>
                            )}
                            {form.pickup_location === "Other" && (
                              <div className="space-y-2">
                                <div>
                                  <Input type="text" id="pickup_location_other" name="pickup_location_other" value={form.pickup_location_other}
                                    onChange={(e) => changeField("pickup_location_other", e.target.value)} />
                                </div>
                                {errors.pickup_location_other && (
                                  <div className="text-xs text-red-600 mt-1">{errors.pickup_location_other}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="drop_location">Drop Location</Label>
                            <Select
                              id="drop_location" placeholder="Select Drop Location" name="drop_location"
                              value={form.drop_location}
                              onValueChange={(value) => {
                                changeField("drop_location", value)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Airport">Airport</SelectItem>
                                <SelectItem value="Railway Station">Railway Station</SelectItem>
                                <SelectItem value="Bus Stop">Bus Stop</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.drop_location && (
                              <div className="text-xs text-red-600 mt-1">{errors.drop_location}</div>
                            )}
                            {form.drop_location === "Other" && (
                              <div className="space-y-2">
                                <div>
                                  <Input type="text" id="drop_location_other" name="drop_location_other" value={form.drop_location_other}
                                    onChange={(e) => changeField("drop_location_other", e.target.value)} />
                                </div>
                                {errors.pickup_location_other && (
                                  <div className="text-xs text-red-600 mt-1">{errors.drop_location_other}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_date">Pick Up Date</Label>
                          <div className="relative">
                            <Input type="date" id="pickup_date" name="pickup_date" min={todayISO} value={form.pickup_date}
                              onChange={(e) => changeField("pickup_date", e.target.value)} />
                            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                          {errors.pickup_date && (
                            <div className="text-xs text-red-600 mt-1">{errors.pickup_date}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickup_time">Pick Up Time</Label>
                          <div className="relative">
                            <Input type="time" id="pickup_time" name="pickup_time" value={form.pickup_time}
                            onChange={(e) => changeField("pickup_time", e.target.value)}/>
                            <ClockIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                          {errors.pickup_time && (
                            <div className="text-xs text-red-600 mt-1">{errors.pickup_time}</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="drop_date">Drop Date</Label>
                          <div className="relative">
                            <Input type="date" id="drop_date" name="drop_date" value={form.drop_date} readOnly disabled/>
                            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                          {errors.drop_date && (
                            <div className="text-xs text-red-600 mt-1">{errors.drop_date}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="drop_time">Drop Time</Label>
                          <div className="relative">
                            <Input type="time" id="drop_time" name="drop_time" value={form.drop_time}
                              onChange={(e) => changeField("drop_time", e.target.value)} />
                            <ClockIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                          {errors.drop_time && (
                            <div className="text-xs text-red-600 mt-1">{errors.drop_time}</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Travelers</Label>
                        
                      
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize font-medium">
                            Adults(12+)
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => dec("adults_total", 1)}
                              // disabled={count === 0}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{form.adults_total}</span>
                            <Button variant="outline"
                              size="sm" 
                              onClick={() => inc("adults_total")}>
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          {errors.adults_total && (
                            <div className="text-xs text-red-600 mt-1">{errors.adults_total}</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize font-medium">
                            Children (4-12)
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => dec("children", 0)}
                              // disabled={count === 0}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{form.children}</span>
                            <Button variant="outline"
                              size="sm" 
                              onClick={() => inc("children")}>
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize font-medium">
                            Infants (0-3)
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => dec("infants", 0)}
                              // disabled={count === 0}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{form.infants}</span>
                            <Button variant="outline"
                              size="sm" 
                              onClick={() => inc("infants")}>
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                      </div>

                      {/*Amount */}
                      {/* <div className="rounded-lg p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md mt-3">
                        <div className="text-lg">Amount</div>
                        <div className="text-2xl font-extrabold">{form.base_total}</div>
                        <div className="text-xs mt-1 opacity-90">This is an estimated amount</div>
                      </div> */}

                      <div className="mt-3 flex justify-between">
                        <span></span>
                        <button onClick={handleNext} className="px-4 py-2 bg-teal-600 text-white rounded ">
                          Next →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>


              <TabsContent value="hotel" className="space-y-6 grid lg:grid-cols-2 gap-6">
                <Card className="max-h-[800px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BuildingIcon className="w-5 h-5 text-primary" />
                      Select Your Hotel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    <div className="grid grid-rows-1 md:grid-rows-3 gap-6">
                      {hotels.map((hotel) => (
                        <Card
                          key={hotel._id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedHotel?._id === hotel._id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            if (selectedHotel && selectedHotel._id === hotel._id) {
                              setSelectedHotel(null)
                              return
                            }
                            setSelectedHotel(hotel);
                            setForm(prev => ({
                              ...prev,
                              hotel_name: hotel?.name,
                              hotel_id: hotel?._id,
                            }));
                          }}
                        >

                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <img
                              src={hotel.imageUrl || "/placeholder.svg"}
                              alt={hotel.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{hotel.name}</h3>
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(hotel.starRating)].map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                  ★
                                </span>
                              ))}
                            </div>
                            {/* <div className="flex flex-wrap gap-1 mb-3">
                              {hotel.amenities.map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div> */}
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">per night</span>
                              <span className="font-bold text-primary">₹{hotel.pricing.roomPrice}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="star_rating">Rating</Label>
                      <Select
                        id="star_rating" name="satr_rating" placeholder="Select Star"
                        value={starRating}
                        onValueChange={(value) => setStarRating(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select hotel rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Star</SelectItem>
                          <SelectItem value="3">3 Star</SelectItem>
                          <SelectItem value="4">4 Star</SelectItem>
                          <SelectItem value="5">5 Star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hotel Rooms Card — placed right after Hotel Type */}
                    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                      {!selectedHotel && <p className="flex items-center text-red-500 gap-2">Select a hotel to update these fields <AlertCircle className="w-4 h-4" /></p>}
                      <span className="capitalize font-medium mb-4">
                        Hotel Rooms
                      </span>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="capitalize font-medium">
                          Rooms
                        </span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={decRooms}
                            disabled={form.rooms <=1 || !selectedHotel}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{form.rooms}</span>
                          <Button variant="outline"
                            disabled={!selectedHotel}
                            size="sm" 
                            onClick={incRooms}>
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors.rooms && (
                          <div className="text-red-600 mb-3">{errors.rooms}</div>
                        )}
                      </div>
                    
                      <p className="text-lg md:text-base text-gray-600 mt-2">
                        Rooms limited to number of adults ({form.adults_total}).
                      </p>
                      {errors.rooms && (
                        <div className="text-red-600 mb-3">{errors.rooms}</div>
                      )}

                      <div className="mt-4">
                        <span className="capitalize font-medium mb-3">Need Extra Bed?</span>

                        <div className="flex items-center gap-8 mb-4">
                          <Label className="flex items-center gap-2">
                            <Input
                              disabled={!selectedHotel}
                              type="radio"
                              name="extra_bedsToggle"
                              checked={form.extra_beds > 0}
                              onChange={() => {
                                setForm((p) => ({
                                  ...p,
                                  extra_beds: p.extra_beds > 0 ? 0 : 1,
                                }));
                              }}
                            />
                            <span>Yes</span>
                          </Label>
                          <Label className="flex items-center gap-2">
                            <Input
                              disabled={!selectedHotel}
                              type="radio"
                              name="extra_bedsToggle"
                              checked={form.extra_beds === 0}
                              onChange={() => setForm((p) => ({ ...p, extra_beds: 0 }))}
                            />
                            <span>No</span>
                          </Label>
                        </div>
                        
                        {/* Extra bed counter shown only when extra_beds > 0 */}
                        {form.extra_beds > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="capitalize font-medium">
                              Extra Beds
                            </span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={decextra_beds}
                                disabled={form.extra_beds <= 1 && !selectedHotel}
                              >
                                <MinusIcon className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{form.extra_beds}</span>
                              <Button variant="outline"
                                size="sm" 
                                onClick={incextra_beds}
                                disabled={form.extra_beds >= form.rooms && !selectedHotel}
                              >
                                <PlusIcon className="w-4 h-4" />
                              </Button>
                            </div>
                            {errors.extra_beds && (
                              <div className="text-red-600 mb-3">{errors.extra_beds}</div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-lg md:text-base text-gray-600 mt-2">
                          Extra beds limited to number of rooms ({form.rooms}).
                        </p>
                      </div>

                      <div>
                        <div className="span capitalize font-medium mb-3">
                          Food Plan
                        </div>
                        <div className="space-y-3">
                          <Label className="flex items-center gap-3 text-lg">
                            <input
                              disabled={!selectedHotel}
                              type="radio"
                              name="food_plan"
                              value="EP"
                              checked={form.food_plan === "EP"}
                              onChange={() => change("food_plan", "EP")}
                            />
                            <span className="leading-snug">EP (Room only - without breakfast)</span>
                          </Label>
                          <Label className="flex items-center gap-3 text-lg">
                            <input
                              disabled={!selectedHotel}
                              type="radio"
                              name="food_plan"
                              value="CB"
                              checked={form.food_plan === "CB"}
                              onChange={() => change("food_plan", "CB")}
                            />
                            <span className="leading-snug">Continental Breakfast (CB)</span>
                          </Label>
                          <Label className="flex items-center gap-3 text-lg">
                            <input
                              disabled={!selectedHotel}
                              type="radio"
                              name="food_plan"
                              value="MAP"
                              checked={form.food_plan === "MAP"}
                              onChange={() => change("food_plan", "MAP")}
                            />
                            <span className="leading-snug">Modified American Plan (MAP)</span>
                          </Label>
                          <Label className="flex items-center gap-3 text-lg">
                            <input
                              disabled={!selectedHotel}
                              type="radio"
                              name="food_plan"
                              value="AD"
                              checked={form.food_plan === "AP"}
                              onChange={() => change("food_plan", "AP")}
                            />
                            <span className="leading-snug">American Plan (AP)</span>
                          </Label>
                        </div>
                      </div>

                    </div>

                    {/*Amount */}
                    <div className="rounded-lg p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md mt-3">
                      <div className="text-lg">Amount</div>
                      <div className="text-2xl font-extrabold">{form.base_total}</div>
                      <div className="text-xs mt-1 opacity-90">This is an estimated amount</div>
                    </div>

                     <div className="mt-auto flex justify-between">
                        <button onClick={goPrev} className="px-4 py-2 bg-teal-600 text-white rounded ">
                          ← Prev
                        </button>
                        <button onClick={() => {
                            const v = validateBeforeNext();
                            setErrors(v);
                            if (Object.keys(v).length) return;
                            goNext()
                          }}
                        className="px-4 py-2 bg-teal-600 text-white rounded ">
                          Next →
                        </button>
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicle" className="space-y-6 grid lg:grid-cols-2 gap-6">
                <Card className="max-h-[700px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CarIcon className="w-5 h-5 text-primary" />
                      Choose Your Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    <div className="grid grid-rows-1 gap-6 mt-5">
                      {
                        !vehicleType ? (
                          <div className="p-6 text-center text-gray-600">
                            Select a vehicle type to view .
                          </div>) : (
                          filteredVehicles.map((vehicle) => (
                            <Card
                              key={vehicle._id}
                              className={`cursor-pointer transition-all hover:shadow-lg ${selectedVehicle?._id === vehicle._id ? "ring-2 ring-primary" : ""
                                }`}
                              onClick={() => {
                                if (selectedVehicle && selectedVehicle._id === vehicle._id) {
                                  setSelectedVehicle(null)
                                  return
                                }
                                setSelectedVehicle(vehicle);
                                setForm(prev => ({
                                  ...prev,
                                  vehicle_name: vehicle.name,
                                  vehicle_id: vehicle._id,
                                }));
                              }}
                            >
                              <div className="mt-5 h-32 relative overflow-hidden rounded-t-lg flex items-center justify-center ">
                                <img
                                  src={"/images/car.png"}
                                  alt={vehicle.name}
                                  className="w-full h-full object-contain bg-gray-100"
                                />
                                {/* <Car className="size-20"/> */}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-lg mb-2">{vehicle.name}</h3>
                                <Badge variant="secondary" className="mb-3">
                                  {vehicle.type}
                                </Badge>
                                <Badge variant="secondary" className="mb-3 ml-2">
                                  capacity: {vehicle.capacity}
                                </Badge>
                                {/* <div className="flex flex-wrap gap-1 mb-3">
                              {vehicle.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div> */}
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">per day</span>
                                  <span className="font-bold text-primary">₹{vehicle.price}</span>
                                </div>
                              </CardContent>
                            </Card>
                          )))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle and Extras Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex flex-col">
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Select Vehicle Type</Label>
                      <Select value={vehicleType} onValueChange={(value) => setVehicleType(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.vehicle_type && (
                        <div className="text-xs md:text-sm text-red-600 mt-1">{errors.vehicle_type}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-lg md:text-lg font-medium mb-2">Extra Food</div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(form.extra_food && form.extra_food.breakfast) || false}
                            onChange={() => toggleextra_food("breakfast")}
                            className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-lg">Breakfast Cost</span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(form.extra_food && form.extra_food.lunchVeg) || false}
                            onChange={() => toggleextra_food("lunchVeg")}
                            className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-lg">Lunch Cost - Veg</span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(form.extra_food && form.extra_food.lunchNonVeg) || false}
                            onChange={() => toggleextra_food("lunchNonVeg")}
                            className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-lg">Lunch Cost - Non-Veg</span>
                        </label>
                      </div>
                    </div>

                    {/* Extra Tickets */}
                    <div className="mb-4">
                      <div className="mb-2 text-lg font-medium">Extra Tickets</div>
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!form.entry_ticket_needed}
                            onChange={(e) => changeField("entry_ticket_needed", e.target.checked)}
                            className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-lg">Entry ticket needed</span>
                        </label>
                        <label className="inline-flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!form.snow_world_needed}
                            onChange={(e) => changeField("snow_world_needed", e.target.checked)}
                            className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo"
                          />
                          <span className="text-lg">Snow World ticket needed</span>
                        </label>
                      </div>
                    </div>


                    {/* Guide Service */}
                    <div className="mb-6">
                      <div className="text-sm md:text-lg font-medium mb-2">Guide Service</div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!form.guideNeeded}
                          onChange={(e) => changeField("guideNeeded", e.target.checked)}
                          className="w-6 h-6 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-lg">Request a Guide</span>
                      </label>
                    </div>

                    {/*Amount */}
                    <div className="rounded-lg p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md mt-3">
                      <div className="text-lg">Amount</div>
                      <div className="text-2xl font-extrabold">{form.base_total}</div>
                      <div className="text-xs mt-1 opacity-90">This is an estimated amount</div>
                    </div>

                    <div className="mt-auto flex justify-between">
                      <button onClick={goPrev} className="px-4 py-2 bg-teal-600 text-white rounded ">
                        ← Prev
                      </button>
                      <button onClick={goNext} className="px-4 py-2 bg-teal-600 text-white rounded ">
                        Next →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <EyeIcon className="w-5 h-5 text-primary" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPackage ? (
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
