import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, CarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const VehiclePreview = ({vehicleType, filteredVehicles, selectedVehicle, setSelectedVehicle, setForm}) => {
  return (
    <Card className="max-h-[700px]">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CarIcon className="w-5 h-5 text-primary" />
                Choose Your Vehicle
            </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
            <div className="grid grid-rows-1 gap-6">
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

                        <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="h-12 w-12 text-gray-400" />
                        </div>
                       
                        </div>
                        <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{vehicle.name}</h3>
                        <Badge variant="secondary" className="mb-3">
                            {vehicle.type}
                        </Badge>
                        <Badge variant="secondary" className="mb-3 ml-2">
                            capacity: {vehicle.capacity}
                        </Badge>
                        
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
  )
}

export default VehiclePreview