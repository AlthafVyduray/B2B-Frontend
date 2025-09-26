"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, PlusIcon, MinusIcon } from "lucide-react"
import { useState } from "react"

const HotelBooking = ({ starRating, setStarRating, selectedHotel, form, setForm, goPrev, goNext }) => {
    
    const [errors, setErrors] = useState({})
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


    const decRooms = () =>
        setForm((p) => {
        const rooms = Math.max(1, p.rooms - 1);
        return { ...p, rooms, extra_beds: Math.min(p.extra_beds, rooms) };
        });

    const incRooms = () =>
        setForm((p) => {
        const rooms = Math.min(p.adults_total, p.rooms + 1);
        return { ...p, rooms, extra_beds: Math.min(p.extra_beds, rooms) };
        });

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
    return (
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
                    {/* {errors.rooms && (
                    <div className="text-red-600 mb-3">{errors.rooms}</div>
                    )} */}

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
    )
}

export default HotelBooking