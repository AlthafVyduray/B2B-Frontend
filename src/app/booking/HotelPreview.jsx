import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BuildingIcon } from "lucide-react"

const HotelPreview = ({hotels, selectedHotel, setSelectedHotel, setForm}) => {
  return (
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
  )
}

export default HotelPreview