"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon, Download } from 'lucide-react';
import useBookingStore from '@/stores/useBookingStore';
import Header from '../components/agent/Header';
import { DisplayBooking, DisplayDefaultBooking } from "../components/agent/utils";


const page = () => {

   const {
    bookings,
    getBookings,
    getPackages,
    getHotelsByRating,
    packages,
    defaultPackages, 
    hotels
  } = useBookingStore();
  

    
  useEffect(() => {
    getBookings();
    getPackages();
    getHotelsByRating?.(0);
  }, [ getBookings, getPackages, getHotelsByRating]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-white shadow-sm py-8 px-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-primary" />
                Booking Details
                </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {bookings?.map((booking) => {
                return ((booking?.source || "").toString().toLowerCase() === "booking") ? (
                    DisplayBooking(booking, packages, hotels)
                ) : (
                    DisplayDefaultBooking(booking, defaultPackages, hotels)
                );
                })}

                {(!bookings || bookings.length === 0) && (
                <div className="col-span-1 md:col-span-2">
                    <CardContent className="p-12 text-center">
                    <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600">When users make bookings, they will appear here with a downloadable PDF.</p>
                    </CardContent>
                </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  )
}

export default page