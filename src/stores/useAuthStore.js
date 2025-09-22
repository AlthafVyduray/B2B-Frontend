import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "@/lib/axios"
// import ForgotPassword from "../pages/ForgotPassword"

const useAuthStore = create((set, get) => ({

    user: null,
    isCheckingAuth: true,
    loading: false,


    signup: async ({ fullName, email, password, companyName, gstNumber, mobileNumber, alternateMobile, area, state, fullAddress }) => {
        set({ loading: true })
        try {
            const res = await axiosInstance.post("/auth/register", { fullName, email, password, companyName, gstNumber, mobileNumber, alternateMobile, area, state, fullAddress });
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({loading: false})
        }
    },

    login: async ({ email, password }) => {
        set({ loading: true })
        try {
            const res = await axiosInstance.post("/auth/login", { email, password});
            set({user: res.data.user})
            toast.success("Login successfully");
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({loading: false})
        }
    },

    checkAuth: async () => {
        set({isCheckingAuth: true})
        try {
            const res = await axiosInstance.get("/auth/profile");
            set({user: res.data.user})
        } catch (error) {
            set({user: null})
        } finally {
            set({isCheckingAuth: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ user: null });
            toast.success("Logged out successfully");

        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    },

    forgotPassword: async (email) => {
        try {
            await axiosInstance.post("/auth/forgot-password", { email });
            toast.success("Password reset link sent! Please check your email.")
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    },

    updateProfile: async (form) => {
        try {
            const res = await axiosInstance.put("/auth/edit-profile", form);
            // set({ user: res.data.user })
            toast.success("Profile updated successfully")
        } catch (error) {
            set({user: null})
            toast.error(error.response?.data?.message)
        }
    },

    


}))

export default useAuthStore;