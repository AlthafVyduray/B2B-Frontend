"use client";

import { useState } from "react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { indianStates } from "@/constants/indianStates";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      companyName: "",
      gstNumber: "",
      mobileNumber: "",
      alternateMobile: "",
      area: "",
      state: "",
      fullAddress: "",
      password: ""
    });

    const {signup} = useAuthStore()

    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        // Check if email is empty
        if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        }

        // Check if fullName is empty
        if (!formData.fullName.trim()) {
        newErrors.fullName = "fullName is required";
        }


        // Check if password is greater than 6 charectors
        if (formData.password.trim().length < 6) {
        newErrors.password = "password must greater than 6 charectors";
        }

        // Check if password is empty
        if (!formData.password.trim()) {
        newErrors.password = "password is required";
        }
        

        // Check if mobile number is empty
        if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = "Mobile number is required";
        }

        setErrors(newErrors);

        // If no errors, submit the form
        if (Object.keys(newErrors).length === 0) {
        try {
            setIsSignUp(true)
            await signup(formData)
            setFormData({
            fullName: "", email: "", companyName: "", gstNumber: "", mobileNumber: "", alternateMobile: "", area: "",
            state: "", fullAddress: "", password: ""
            });
            setErrors({});
            router.push("/signin");

        }catch (error) {
            setIsSignUp(false);
        } finally {
            setIsSignUp(false);
        }
        }
    };

    return (
        <div className="min-h-screen flex lg:m-10 m-3 border rounded-2xl">

            {/* Right Section */}
            <div className="hidden lg:flex w-1/2 relative">
                <img
                    src="/images/3.jpg"
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
                    <h1 className=" font-bold text-black text-2xl font-serif">CREATE YOUR ACCOUNT</h1>
                    <p className="text-sm text-gray-500">Join us to start your travel journey</p>
                </div>


                {/* Heading */}
                <h2 className="text-xl text-[#00000053] font-semibold mb-4">
                    Begin Your Adventure                </h2>




                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>

                    <div className="grid grid-cols-2 gap-5">
                        <div>

                            <input type="text" name="fullName" id="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                    ${errors.fullName ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-2 mb-4">{errors.fullName}</p>}
                        </div>
                        <div>

                            <input type="email" name="email" id="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                    ${errors.email ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.email && <p className="text-red-500 mt-2 text-sm mb-4">{errors.email}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>

                            <input type="text" name="companyName" id="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange}
                                className="w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>

                            <input type="text" name="gstNumber" id="gstNumber" placeholder="GST Number" value={formData.gstNumber} onChange={handleChange}
                                className="w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>

                            <input type="text" name="mobileNumber" id="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                    ${errors.mobileNumber ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.mobileNumber && <p className="text-red-500 mt-2 text-sm mb-4">{errors.mobileNumber}</p>}
                        </div>
                        <div>

                            <input type="text" name="alternateMobile" id="alternateMobile" placeholder="Alternate Mobile" value={formData.alternateMobile} onChange={handleChange}
                                className="w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <select
                                name="state"
                                id="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full text-black px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="" disabled>Select State</option>
                                {indianStates.map((state, index) => (
                                <option key={index} value={state}>
                                    {state}
                                </option>
                                ))}
                            </select>
                        </div>
                        <div>

                            <input type="text" name="area" id="area" placeholder="Area" value={formData.area} onChange={handleChange}
                                className="w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>

                            <input type="text" name="fullAddress" id="fullAddress" placeholder="Full Address" value={formData.fullAddress} onChange={handleChange}
                                className="w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>

                            <input type="password" name="password" id="password" placeholder="Password" value={formData.password} onChange={handleChange}
                                className={`w-full text-black placeholder:text-[#000000b8] px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black
                                    ${errors.password ? "ring-2 ring-red-500 border-red-500" : ""}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-2 mb-4">{errors.password}</p>}
                        </div>
                    </div>

                    <button
                        disabled={isSignUp}
                        type="submit"
                        className={`w-full text-white py-3 mt-3 rounded-lg font-medium hover:bg-gray-800 transition
                            ${isSignUp ? "bg-gray-400" : "bg-black"}`}
                    >
                        {isSignUp ? "Submitting..." : "Create Account"}
                    </button>
                    <div className="text-center">
                        <p className="text-black text-center">Already have an account? <Link href={"/login"} className="text-[#0f558e] ">Sign In</Link>
                        </p>
                    </div>


                </form>
            </div>


        </div>
    );
}
