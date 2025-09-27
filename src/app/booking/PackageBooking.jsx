import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ClockIcon, MinusIcon, PlusIcon } from 'lucide-react'


const PackageBooking = ({ selectedPackage, setSelectedPackage, defaultPackage, setDefaultPackage, form, setForm, defaultPackageForm, setDefaultPackageForm, handleNext, packages, defaultPackages, errors }) => {
    
    //To know the current date
    const todayISO = new Date().toISOString().slice(0, 10);

  //Package
  const inc = (field) => changeField(field, Number(form[field] || 0) + 1);
  const dec = (field, min = 0) =>
    changeField(field, Math.max(min, Number(form[field] || 0) - 1));
  const changeField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  //default Package
  const incdefault = (field) => changeDefaultField(field, Number(defaultPackageForm[field] || 0) + 1);
  const decdefault = (field, min = 0) =>
    changeDefaultField(field, Math.max(min, Number(defaultPackageForm[field] || 0) - 1));
  const changeDefaultField = (name, value) => setDefaultPackageForm((p) => ({ ...p, [name]: value }));
  
    
    
    //For automatic drop_date selection
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
    
    
    
 //handle the dates in defaultPackege only friday select and set drop_date
  const handlePickupChange = (e) => {
    const value = e.target.value;
    const date = new Date(value);

   
    let dropStr = "";
    if (selectedPackage?.days) {
      const drop = new Date(date);
      drop.setDate(drop.getDate() + (selectedPackage.days - 1));
      dropStr = drop.toISOString().split("T")[0];
    }

    // Update form state
    setDefaultPackageForm((prev) => ({
      ...prev,
      pickup_date: value,
      drop_date: dropStr,
    }));
  };
  
    
    // combine packages into one list and remove duplicates (by _id)
    const allPackagesMap = new Map();
    (defaultPackages || []).forEach((p) => allPackagesMap.set(p._id, { ...p, __group: "default" }));
    (packages || []).forEach((p) => {
    if (!allPackagesMap.has(p._id)) allPackagesMap.set(p._id, { ...p, __group: "regular" });
    });
    const allPackages = Array.from(allPackagesMap.values());
  
    
  return (
    <Card>
        <CardHeader>
            <CardTitle>Travel Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

            <div className="space-y-2 w-full">
            <Label htmlFor="package">Select Package</Label>
            {console.log(defaultPackage)}
            <Select
                value={defaultPackage ? defaultPackageForm.package_id : form.package_id}
                onValueChange={(value) => {
                const pkg = allPackages.find((p) => p._id === value);
                setSelectedPackage(pkg || null);

                if (pkg?.__group === "default") {
                    setDefaultPackage(true);
                    setDefaultPackageForm((prev) => ({
                    ...prev,
                    package_name: pkg?.package_name ?? "",
                    package_id: pkg?._id ?? "",
                    }));
                } else {
                    setDefaultPackage(false);
                    setForm((prev) => ({
                    ...prev,
                    package_name: pkg?.package_name ?? "",
                    package_id: pkg?._id ?? "",
                    }));
                }
                }}
            >


            <SelectTrigger className="w-full">
                {defaultPackage ? <SelectValue /> : <SelectValue placeholder="Select Package" />}
            </SelectTrigger>

            <SelectContent>
                {/* Optional group header for default packages */}
                {defaultPackages?.length > 0 && (
                <div className="px-2 py-1 text-xs font-medium text-gray-500">Default Packages</div>
                )}
                {defaultPackages?.map((pkg) => (
                <SelectItem key={`default-${pkg._id}`} value={pkg._id}>
                    {pkg.package_name}
                </SelectItem>
                ))}

                {/* Optional divider */}
                {defaultPackages?.length > 0 && packages?.length > 0 && (
                <div className="my-1 border-t" />
                )}

                {/* Regular packages */}
                {packages?.length > 0 && (
                <div className="px-2 py-1 text-xs font-medium text-gray-500">Other Packages</div>
                )}
                {packages?.map((pkg) => (
                // key prefixed to avoid accidental duplicate key collisions
                <SelectItem key={`pkg-${pkg._id}`} value={pkg._id}>
                    {pkg.package_name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
            {errors.package && (
                <div className="text-xs text-red-600 mt-1">{errors.package}</div>
            )}
            </div>

            {! defaultPackage ? (
            <>
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

            </>
            ) : (
            <>
                <div className="space-y-4">
                {/* Pickup Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">Pickup Date (Friday only)</label>
                    <input
                    type="date"
                    min={todayISO}      
                    value={defaultPackageForm.pickup_date}
                    onChange={handlePickupChange}
                    className="border rounded px-2 py-1"
                    />
                    
                </div>
                {errors.pickup_date && (
                <div className="text-xs text-red-600 mt-1">{errors.pickup_date}</div>
                )}
                

                {/* Drop Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">Drop Date</label>
                    <input
                    type="date"
                    value={defaultPackageForm.drop_date}
                    readOnly
                    className="border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                    />
                </div>
                {errors.drop_date && (
                <div className="text-xs text-red-600 mt-1">{errors.drop_date}</div>
                )}
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
                    onClick={() => decdefault("adults_total", 1)}
                    // disabled={count === 0}
                    >
                    <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{defaultPackageForm.adults_total}</span>
                    <Button variant="outline"
                    size="sm" 
                    onClick={() => incdefault("adults_total")}>
                    <PlusIcon className="w-4 h-4" />
                    </Button>
                </div>
                {errors.adults_total && (
                    <div className="text-xs text-red-600 mt-1">{errors.adults_total}</div>
                )}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="capitalize font-medium">
                    Children With Bed (6-12)
                </span>
                <div className="flex items-center gap-3">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => decdefault("children_with_bed", 0)}
                    // disabled={count === 0}
                    >
                    <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{defaultPackageForm.children_with_bed}</span>
                    <Button variant="outline"
                    size="sm" 
                    onClick={() => incdefault("children_with_bed")}>
                    <PlusIcon className="w-4 h-4" />
                    </Button>
                </div>
                </div>
                
                    
                <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="capitalize font-medium">
                    Children Without Bed (2-5)
                </span>
                <div className="flex items-center gap-3">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => decdefault("children_without_bed", 0)}
                    // disabled={count === 0}
                    >
                    <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{defaultPackageForm.children_without_bed}</span>
                    <Button variant="outline"
                    size="sm" 
                    onClick={() => incdefault("children_without_bed")}>
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
                    onClick={() => decdefault("infants", 0)}
                    // disabled={count === 0}
                    >
                    <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{defaultPackageForm.infants}</span>
                    <Button variant="outline"
                    size="sm" 
                    onClick={() => incdefault("infants")}>
                    <PlusIcon className="w-4 h-4" />
                    </Button>
                </div>
                </div>
            
            </div>

            </>
            
            )}
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
  )
}

export default PackageBooking