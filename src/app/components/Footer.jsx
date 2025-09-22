"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#d1c4a9] text-white py-12">
      {/* Top section */}
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-12 items-center">
        {/* Left - Text */}
        <div>
          <h2 className="text-2xl font-light leading-snug">
            Committed to{" "}
            <span className="italic font-medium">comprehensive care</span> in
            addiction and mental health
          </h2>
        </div>

        {/* Middle - CTA Button */}
        <div className="flex justify-center">
          <button className="bg-white text-[#5b7463] px-6 py-3 rounded-full font-medium shadow hover:bg-gray-100 transition">
            Schedule free assessment
          </button>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-12 container mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-12">
        {/* Links */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <ul className="space-y-2">
            <li><Link href="#">Home</Link></li>
            <li><Link href="#">Residential Programme</Link></li>
            <li><Link href="#">For families</Link></li>
            <li><Link href="#">Aftercare Support</Link></li>
            <li><Link href="#">Admission Process</Link></li>
          </ul>
          <ul className="space-y-2">
            <li><Link href="#">About</Link></li>
            <li><Link href="#">Team</Link></li>
            <li><Link href="#">Accommodation</Link></li>
            <li><Link href="#">Gallery</Link></li>
            <li><Link href="#">Contact</Link></li>
          </ul>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border border-white/40 flex items-center justify-center rounded-full">
            <img src="/images/logo.jpg" alt="" />
          </div>
          <p className="mt-4 tracking-widest font-semibold">B2B HYDERABAD</p>
          <div className="flex space-x-4 mt-4 text-sm">
            <Link href="#"><i className="fab fa-facebook"></i></Link>
            <Link href="#"><i className="fab fa-instagram"></i></Link>
            <Link href="#"><i className="fab fa-twitter"></i></Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <p className="mb-4 text-sm">Stay updated with our latest news and updates.</p>
          <div className="flex items-center bg-white rounded-full px-4 py-2">
            <Mail className="text-[#5b7463] w-4 h-4" />
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 ml-2 text-sm text-gray-700 outline-none bg-transparent"
            />
            <button className="ml-2 bg-[#5b7463] text-white px-4 py-1 rounded-full text-sm hover:bg-[#4b6152] transition">
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-200 container mx-auto px-6 md:px-12">
        <p>Copyright 2021 © Anker Huis — All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="#">Terms & Conditions</Link>
          <Link href="#">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
