import { CardContent } from "@/components/ui/card"
import { X, MapPin } from "lucide-react";

const ViewPackage = ({ selectedPackage, setSelectedPackage, packages }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-gray-200 flex flex-col max-h-[90vh]">
        <CardContent className="px-10 p-6 overflow-y-auto">
          <div className="flex justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {selectedPackage?.package_name ?? "N/A"}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedPackage(null)}
              className="p-1 self-end text-red-500"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                {selectedPackage?.place ?? "N/A"}
              </p>
              <p>Departure: {selectedPackage?.departure ?? "N/A"}</p>
            </div>

            <div className="text-right">
              {packages?.some(pkg => pkg?._id === selectedPackage?._id) ? (
                <p className="text-2xl font-extrabold text-blue-600">
                  ${selectedPackage?.price?.toLocaleString() ?? "N/A"}
                </p>
              ) : (
                <div className="text-small text-blue-600">
                  <p>Adult: ${selectedPackage?.pricing?.adult?.toLocaleString() ?? "N/A"}</p>
                  <p>Child With Bed: ${selectedPackage?.pricing?.childWithBed?.toLocaleString() ?? "N/A"}</p>
                  <p>Child Without Bed: ${selectedPackage?.pricing?.childWithoutBed?.toLocaleString() ?? "N/A"}</p>
                  <p>Infant: ${selectedPackage?.pricing?.infant?.toLocaleString() ?? "N/A"}</p>
                </div>
              )}

              <p className="text-sm text-gray-500">
                {selectedPackage?.days ?? "N/A"} Days
              </p>
            </div>
          </div>

          {/* Itinerary Preview */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Itinerary Highlights
            </h4>
            <div className="space-y-2">
              {selectedPackage?.itineraries?.map((it) => (
                <div
                  key={it?._id}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {it?.day_number ?? "-"}
                  </div>
                  <img
                    src={it?.image || "/placeholder.svg"}
                    alt={String(it?.day_number ?? "")}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div>
                    <p className="text-xs text-gray-600">
                      {it?.description ?? "No description"}
                    </p>
                  </div>
                </div>
              )) ?? null}
            </div>
          </div>

          {selectedPackage?.inclusions?.length > 0 && (
            <div className="border rounded-lg shadow-sm p-5 mt-4 bg-white">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Inclusions</h3>
              <ul className="space-y-3">
                {selectedPackage?.inclusions?.map((item, idx) => (
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
                    <span className="text-gray-700">{item ?? "N/A"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end p-4 border-t">
            <button
              type="button"
              onClick={() => setSelectedPackage(null)}
              className="px-4 py-2 rounded bg-red-500 text-white"
            >
              Cancel
            </button>
          </div>
        </CardContent>
      </div>
    </div>
  )
}

export default ViewPackage
