import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageIcon } from "lucide-react"

const PackagePreview = ({selectedPackage}) => {
  return (
    <Card className="max-h-[750px]">
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
  )
}

export default PackagePreview