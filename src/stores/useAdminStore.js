import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const useAdminStore = create((set, get) => ({
  //Home

  counts: { Bookings: 0, Agents: 0, Revenue: 0 },
  loadCounts: false,

  getCounts: async () => {
    set({ loadCounts: true });
    try {
      const res = await axiosInstance.get("/admin/home");
      set({ counts: res.data.counts });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch counts");
    } finally {
      set({ loadCounts: false });
    }
  },

  // Agents state
  loadAgents: false,
  agents: [],
  agentCounts: {},
  agentPagination: { page: 1, totalPages: 1, limit: 25, total: 0 },

  // Fetch all agents
  getAgents: async ({ searchField, searchValue, page = 1, limit = 25 }) => {
    set({ loadAgents: true });
    try {
      const res = await axiosInstance.get("/admin/agents", {
        params: { searchField, searchValue, page, limit },
      });

      set({
        agents: res.data.agents,
        agentCounts: res.data.counts,
        agentPagination: res.data.pagination, // renamed
      });
    } catch (error) {
      set({ agents: [] });
      toast.error(error.response?.data?.message || "Failed to fetch agents");
    } finally {
      set({ loadAgents: false });
    }
  },

  // Approve agent
  approveAgent: async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/agents/approve/${id}`);
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent._id === id ? { ...agent, isApproved: "approved" } : agent
        ),
      }));
      toast.success(res.data?.message || "Agent approved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve agent");
    }
  },

  // Reject agent
  rejectAgent: async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/agents/reject/${id}`);
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent._id === id ? { ...agent, isApproved: "rejected" } : agent
        ),
      }));
      toast.success(res.data?.message || "Agent rejected successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject agent");
    }
  },

  //Bookings

  bookings: [],
  bookingStats: {
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
  },
  loadBookings: false,
  bookingPagination: { page: 1, totalPages: 1, limit: 10, total: 0 },

  getBookings: async ({
    stateFilter = "",
    searchTerm = "",
    page = 1,
    limit = 10,
  } = {}) => {
    set({ loadBookings: true });
    try {
      const res = await axiosInstance.get("/admin/booking-details", {
        params: { stateFilter, searchTerm, page, limit },
      });

      set({
        bookings: res.data.bookings || [],
        bookingStats: res.data.stats || {
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
        },
        bookingPagination: res.data.pagination || {
          page,
          totalPages: 1,
          limit,
          total: 0,
        },
        loadBookings: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
      set({
        bookings: [],
        bookingStats: {
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
        },
        bookingPagination: { page: 1, totalPages: 1, limit, total: 0 },
        loadBookings: false,
      });
    }
  },

  updateBooking: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/booking-details/${id}`, data);
      await get().getBookings();

      toast.success("Booking Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Booking");
    }
  },

  updateDefaultBooking: async (id, data) => {
    try {
      const res = await axiosInstance.put(
        `/admin/booking-details/default/${id}`,
        data
      );

      await get().getBookings();

      toast.success("Booking Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Booking");
    }
  },

  deleteBooking: async (id) => {
    try {
      await axiosInstance.delete(`/admin/booking-details/${id}`);
      set((state) => ({
        bookings: state.bookings.filter((b) => b._id !== id),
      }));
      toast.success("Booking deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete booking");
    }
  },

  confirmBooking: async (id) => {
    try {
      const res = await axiosInstance.put(
        `/admin/booking-details/confirm/${id}`
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking._id === id ? { ...booking, status: "confirmed" } : booking
        ),
      }));
      toast.success(res.data.message || "Booking confirmed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    }
  },

  cancelBooking: async (id) => {
    try {
      const res = await axiosInstance.put(
        `/admin/booking-details/cancel/${id}`
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking._id === id ? { ...booking, status: "cancelled" } : booking
        ),
      }));
      toast.success(res.data.message || "Booking cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  },

  changeState: async (id, status) => {
    try {
      const res = await axiosInstance.put(
        `/admin/booking-details/status/${id}`,
        { status }
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking._id === id ? { ...booking, status: status } : booking
        ),
      }));
      toast.success(res.data.message || `status changed to ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change status");
    }
  },

  //Users
  users: [],
  loadUsers: false,

  getUsers: async () => {
    set({ loadUsers: true });
    try {
      const res = await axiosInstance.get("/admin/users");
      set({ users: res.data.users });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ loadUsers: false });
    }
  },

  createUser: async ({ email, password, role }) => {
    try {
      const res = await axiosInstance.post("/admin/users", {
        email,
        password,
        role,
      });
      await get().getUsers();

      toast.success("User created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  },

  editUser: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}`, data);
      set((state) => ({
        users: state.users.map((user) =>
          user._id == id ? res.data.user : user
        ),
      }));
      toast.success("User Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit user");
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== id),
      }));
      toast.success("User Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete user");
    }
  },

  //Notification

  notifications: [],
  notificationStats: {
    total: 0,
    system: 0,
    booking: 0,
    success: 0,
    activeSystem: 0,
    inactiveSystem: 0,
  },
  notificationPagination: {
    page: 1,
    totalPages: 1,
    limit: 10,
    totalRecords: 0,
  },
  loadNotifications: false,

  // Setter for pagination page
  setNotificationPage: (page) => {
    set((state) => ({
      notificationPagination: {
        ...state.notificationPagination,
        page,
      },
    }));
  },

  // Fetch notifications
  getNotifications: async ({
    filterType = "",
    filterStatus = "",
    page = 1,
    limit = 10,
  } = {}) => {
    set({ loadNotifications: true });
    try {
      const res = await axiosInstance.get("/admin/notifications", {
        params: { filterType, filterStatus, page, limit },
      });

      // Expecting res.data = { notifications, stats, pagination }
      set({
        notifications: res.data.notifications || [],
        notificationStats: res.data.stats || {
          total: 0,
          system: 0,
          booking: 0,
          success: 0,
          activeSystem: 0,
          inactiveSystem: 0,
        },
        notificationPagination: res.data.pagination || {
          page: page,
          totalPages: 1,
          limit,
          totalRecords: 0,
        },
        loadNotifications: false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load notifications"
      );
      set({ loadNotifications: false });
    }
  },

  createNotification: async (notification) => {
    try {
      await axiosInstance.post("/admin/notifications", { notification });
      toast.success("Notification created successfully");

      // After creating, reload notifications (use current filters & page from store)
      const { notificationPagination } = get();
      await get().getNotifications({
        page: notificationPagination.page,
        limit: notificationPagination.limit,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create Notification"
      );
    }
  },

  deleteNotification: async (id) => {
    try {
      await axiosInstance.delete(`/admin/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
      toast.success("Notification Deleted Successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to Delete Notification"
      );
    }
  },

  //Vehicles

  vehicles: [],
  loadVehicles: false,

  getVehicles: async () => {
    set({ loadVehicles: true });
    try {
      const res = await axiosInstance.get("/admin/vehicles");
      set({ vehicles: res.data.vehicles });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      set({ loadVehicles: false });
    }
  },

  createVehicle: async (vehicle) => {
    try {
      const res = await axiosInstance.post("/admin/vehicles", vehicle);
      await get().getVehicles();

      toast.success("vehicle created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create vehicle");
    }
  },

  deleteVehicle: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/vehicles/${id}`);
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle._id !== id),
      }));
      toast.success("Vehicle Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Vehicle");
    }
  },

  updateVehicle: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/vehicles/${id}`, data);
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle._id == id ? res.data.vehicle : vehicle
        ),
      }));
      toast.success("Vehicle Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Vehicle");
    }
  },

  //Pricing

  pricing: [],
  loadPricing: false,

  getPricing: async () => {
    set({ loadPricing: true });
    try {
      const res = await axiosInstance.get("/admin/pricing");
      set({ pricing: res.data.pricing });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load prices");
    } finally {
      set({ loadPricing: false });
    }
  },

  createPricing: async (pricing) => {
    try {
      const res = await axiosInstance.post("/admin/pricing", pricing);
      await get().getPricing();

      toast.success("prices created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create prices");
    }
  },

  deletePricing: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/pricing/${id}`);
      set((state) => ({
        pricing: state.pricing.filter((price) => price._id !== id),
      }));
      toast.success("Pricing Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Pricing");
    }
  },

  updatePricing: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/pricing/${id}`, data);
      set((state) => ({
        pricing: state.pricing.map((price) =>
          price._id == id ? res.data.pricing : price
        ),
      }));
      toast.success("Price Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Price");
    }
  },

  hotels: [],
  loadHotels: false,

  getHotels: async () => {
    set({ loadHotels: true });
    try {
      const res = await axiosInstance.get("/admin/hotels");
      set({ hotels: res.data.hotels });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load Hotels");
    } finally {
      set({ loadHotels: false });
    }
  },

  createHotel: async (hotel) => {
    try {
      const res = await axiosInstance.post("/admin/hotels", hotel);
      await get().getHotels();

      toast.success("hotel created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create hotel");
    }
  },

  deleteHotel: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/hotels/${id}`);
      set((state) => ({
        hotels: state.hotels.filter((hotel) => hotel._id !== id),
      }));
      toast.success("Hotel Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Hotel");
    }
  },

  updateHotel: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/hotels/${id}`, data);
      set((state) => ({
        hotels: state.hotels.map((hotel) =>
          hotel._id == id ? res.data.hotel : hotel
        ),
      }));
      toast.success("Hotel Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Hotel");
    }
  },

  //Packages

  packages: [],
  defaultPackages: [],
  loadPackages: false,

  getPackages: async () => {
    set({ loadPackages: true });
    try {
      const res = await axiosInstance.get("/admin/packages");
      set({
        packages: res.data.packages,
        defaultPackages: res.data.defaultPackages,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load Packages");
    } finally {
      set({ loadPackages: false });
    }
  },

  createPackage: async (data) => {
    try {
      const res = await axiosInstance.post("/admin/packages", data);
      await get().getPackages();

      toast.success("package created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create package");
    }
  },

  deletePackage: async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/packages/${id}`);
      await get().getPackages();
      toast.success("Package Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Delete Package");
    }
  },

  updatePackage: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/admin/packages/${id}`, data);
      // set((state) => ({
      //     packages: state.packages.map((pkg) =>
      //     pkg._id == id ? res.data.package : pkg)
      // }));
      await get().getPackages();
      toast.success("Package Edited Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Edit Package");
    }
  },

  createDefaultPackages: async (fd) => {
    try {
      const res = await axiosInstance.post(
        "/admin/packages/default-package",
        fd
      );
      // set((state) => ({
      //     packages: state.packages.map((pkg) =>
      //     pkg._id == id ? res.data.package : pkg)
      // }));
      await get().getPackages();
      toast.success("Default Package created Successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to Create Default Package"
      );
    }
  },

  updateDefaultPackage: async (id, fd) => {
    try {
      const res = await axiosInstance.put(
        `/admin/packages/default-package/${id}`,
        fd
      );
      await get().getPackages();
      toast.success("Default Package created Successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update Default Package"
      );
    }
  },

  updatePassword: async (password) => {
    try {
      const res = await axiosInstance.put(`/admin/password`, { password });
      toast.success("Password Changed Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Update Password");
    }
  },
}));

export default useAdminStore;
