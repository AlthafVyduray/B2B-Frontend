import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const useBookingStore = create((set, get) => ({
  vehicles: [],
  packages: [],
  defaultPackages: [],

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
      set({
        packages: res.data.packages,
        defaultPackages: res.data.defaultPackages,
      });
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
      const res = await axiosInstance.post("/booking/hotels-by-rating", {
        starRating: rating,
      });
      set({ hotels: res.data.hotels });
    } catch (error) {
      set({ hotels: [] });
      toast.error(error.response?.data?.message || "Failed to fetch hotels");
    }
  },

  createBooking: async (form) => {
    try {
      const res = await axiosInstance.post("/booking/book-package", form);
      toast.success("Booking Completed You Can Check on Notifications");
    } catch (error) {
      set({ packages: [] });
      toast.error(error.response?.data?.message || "Failed to Book Package");
    }
  },

  createDefaultBooking: async (form) => {
    try {
      const res = await axiosInstance.post(
        "/booking/book-default-package",
        form
      );
      toast.success("Booking Completed You Can Check on Notifications");
    } catch (error) {
      set({ packages: [] });
      toast.error(error.response?.data?.message || "Failed to Book Package");
    }
    },
  
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

  changeState: async (id, status) => {
    try {
      const res = await axiosInstance.put(`/booking/bookings/status/${id}`, {
        status,
      });
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking._id === id ? { ...booking, status: status } : booking
        ),
      }));
      toast.success(res.data.message || `status changed to ${status}`);
    } catch (error) {
        set({ packages: [] });
        console.log(error.response)
      toast.error(error.response?.data?.message || "Failed change status");
    }
  },

  //Notifications

  notifications: [],
  getAdminNotifications: async () => {
    try {
      const res = await axiosInstance.get("/booking/notifications");
      set({ notifications: res.data.notifications });
    } catch (error) {
      set({ notifications: [] });
      toast.error(
        error.response?.data?.message || "Failed to fetch Notifications"
      );
    }
  },

  total_amount: 0,
  getAmount: async (form) => {
    try {
      const res = await axiosInstance.post("/booking/amount", form);
      set({ total_amount: res.data });
    } catch (error) {
      set({ total_amount: 0 });
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
}));

export default useBookingStore;
