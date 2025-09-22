import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"



const useBookingStore = create((set, get) => ({

    vehicles: [],
    packages: [],

    getVehicles: async () => {
        try {
            const res = await axiosInstance.get("/booking/all-vehicles");
            set({ vehicles: res.data.data });
        } catch (error) {
            set({ agents: [] });
            toast.error(error.response?.data?.message || "Failed to fetch vehicles");
        }
    },

    getPackages: async () => {
        try {
            const res = await axiosInstance.get("/booking/all-packages");
            set({ packages: res.data.data });
        } catch (error) {
            set({ packages: [] });
            toast.error(error.response?.data?.message || "Failed to fetch Packages");
        }
    },
    
    hotels: [],

   // useBookingStore.js
    getHotelsByRating: async (starRating) => {
        const rating = Number(starRating);
        if (Number.isNaN(rating)) {
            set({ hotels: [] });
            return;
        }
        try {
            const res = await axiosInstance.post("/booking/hotels-by-rating", { starRating: rating });
            set({ hotels: res.data.hotels });
        } catch (error) {
            set({ hotels: [] });
            toast.error(error.response?.data?.message || "Failed to fetch hotels");
        }
    },

    createBooking: async (form) => {
        try{
            const res = await axiosInstance.post("/booking/book-package", form);
            toast.success("Booking Completed You Can Check on Notifications")
        } catch (error) {
            set({ packages: [] });
            toast.error(error.response?.data?.message || "Failed to fetch Packages");
        }
    },

    //Notifications

    bookings: [],

    getBookings: async () => {
        try {
            const res = await axiosInstance.get("/booking/bookings");
            set({ bookings: res.data.bookings });
        } catch (error) {
            set({ bookings: [] });
            toast.error(error.response?.data?.message || "Failed to fetch bookings");
        }
    },

    notifications: [],
    getAdminNotifications: async () => {
        try {
            const res = await axiosInstance.get("/booking/notifications");
            set({ notifications: res.data.notifications });
        } catch (error) {
            set({ notifications: [] });
            toast.error(error.response?.data?.message || "Failed to fetch Notifications");
        }
    },

    total_amount: 0,
    getAmount: async (form) => {
        try {
            const res = await axiosInstance.post("/booking/amount", form);
            set({total_amount: res.data})
        } catch (error) {
            set({total_amount: 0})
            toast.error(error.response?.data?.message || "Failed to fetch Amount");
        }
    },
    
    pricing: [],

    getPricing: async () => {
        try {
            const res = await axiosInstance.get("/booking/pricing");
            set({ pricing: res.data.pricing });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load prices");
        }
    },



    


}))

export default useBookingStore;