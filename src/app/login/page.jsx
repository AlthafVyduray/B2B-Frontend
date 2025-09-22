"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";

export default function AuthPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [isLogin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuthStore()
    
    const handleSubmit = async (e) => {
        e.preventDefault()


        let newErrors = {};

        if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        }
        if (!formData.password.trim()) {
        newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                setIsLogin(true);
                await login(formData);
                setFormData({ email: "", password: "" });
                setErrors({});
            } catch (error) {
                setIsLogin(false)
            } finally {
                setIsLogin(false)
            }   
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex lg:m-10 m-3 border rounded-2xl">

            {/* Right Section */}
            <div className="hidden lg:flex w-1/2 relative">
                <img
                    src="/images/1.jpg"
                    alt="Travel"
                    className="w-full h-full object-cover"
                />
                {/* Overlay Text */}
                <div className="absolute bottom-12 left-12 text-white max-w-sm">
                    
                    <h3 className="text-3xl font-bold mb-2">
                        Explore the World, Beyond Boundaries!
                    </h3>
                    <p className="text-sm">Start your adventure today</p>
                </div>
            </div>
            {/* Left Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-16 lg:px-24">
                {/* Logo + Toggle */}
                <div className="mb-8">
                                        <div>
                        <img src="/images/logo.jpg" alt="" className="h-18   object-contain"/>
                    </div>
                    <h1 className=" font-bold text-black text-3xl font-serif">WELCOME BACK</h1>
                    <p className="text-sm text-gray-500">Login to continue your travel journey.</p>
                </div>


                {/* Heading */}
                <h2 className="text-xl text-[#00000053] font-semibold mb-4">
                    Begin Your Adventure                </h2>




                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="flex flex-col gap-5">
                        <div>

                            <input type="email" name="email" id="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                ${errors.email ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mb-4">{errors.email}</p>}
                        </div>
                        <div>

                            <input type="password" name="password" id="password" placeholder="Password" value={formData.password} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                    ${errors.password ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm mb-4">{errors.password}</p>}
                        </div>
                    </div>


                    <button
                        disabled={isLogin}
                        type="submit"
                        className={`w-full text-white py-3 mt-3 rounded-lg font-medium hover:bg-gray-800 transition
                            ${isLogin ? "bg-gray-400" : "bg-black"}`}
                    >
                        {isLogin ? "Submitting..." : "Login"}
                    </button>
                    <div className="text-center mb-2">
                      <Link href={"/forgot-password"} className="text-[#0f558e] ">Forgot Your Password</Link>
                        
                    </div>
                    <div className="text-center">
                        <p className="text-black text-center">Dont't have an account? <Link href={"/signup"} className="text-[#0f558e] ">Sign Up</Link>
                        </p>
                    </div>


                </form>
            </div>


        </div>
    );
}
