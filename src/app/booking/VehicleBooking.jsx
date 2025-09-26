import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



const VehicleBooking = ({vehicleType, setVehicleType, vehicleTypes, form, setForm, goPrev, goNext}) => {


  
    
    const toggleextra_food = (key) =>
      setForm((p) => ({
        ...p,
        extra_food: { ...(p.extra_food || {}), [key]: !((p.extra_food || {})[key]) },
      }));
    
    const changeField = (name, value) => setForm((p) => ({ ...p, [name]: value }));


  return (
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
  )
}

export default VehicleBooking