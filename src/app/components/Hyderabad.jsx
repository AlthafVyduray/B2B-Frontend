"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hyderabad() {
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      const ctx = gsap.context(() => {
        // shutter effect - reveal image
        gsap.fromTo(
          imgRef.current.querySelector(".img-mask"),
          { scaleX: 1 },
          {
            scaleX: 0,
            transformOrigin: "left center",
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: imgRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            duration: 1.5,
          }
        );
      }, imgRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center lg:px-4">
      <div className="lg:px-20 w-full bg-white shadow-lg overflow-hidden">
        {/* Navbar */}
        {/* <header className="flex items-center justify-between py-6 px-8 border-b">
          <h1 className="text-xl font-semibold">WONDER</h1>
          <nav className="hidden md:flex gap-8 text-gray-600">
            <a href="#" className="hover:text-black">Destinations</a>
            <a href="#" className="hover:text-black">Travel Guides</a>
            <a href="#" className="hover:text-black">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2">🔍</button>
            <button className="p-2">☰</button>
          </div>
        </header> */}

        {/* Hero Section */}
        <section className="grid md:grid-cols-2">
          {/* Left Content */}
          <div className="flex flex-col justify-center lg:px-8 px-3 py-12">
            <h2 className="lg:text-6xl text-5xl font-bold mb-6 text-[#d1c4a9]">HYDERABAD</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              The green countryside, lively pubs, and friendly residents make Ireland a
              popular escape for visitors. From fresh cuisine and Guinness from the source
              only Ireland can offer.
            </p>
            <button className="px-6 py-3 bg-[#d1c4a9] text-black font-semibold rounded hover:bg-[#c5b99f] transition">
              Explore
            </button>
          </div>

          {/* Right Content (Image + GSAP Shutter Animation) */}
          <div ref={imgRef} className="relative overflow-hidden">
            <img
              src="https://hblimg.mmtcdn.com/content/hubble/img/dest_img/mmt/activities/m_Hyderabad_dest_landscape_l_852_1195.jpg" // your image path
              alt="Ireland"
              width={800}
              height={600}
              className="object-cover w-full h-full"
            />
            {/* Shutter mask */}
            <div className="img-mask absolute inset-0 bg-white z-10"></div>

            {/* Play button */}
            <div className="absolute bottom-6 left-6 z-20">
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#d1c4a9] text-black shadow-lg hover:bg-[#c5b99f]">
                ▶
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <footer className="flex items-center justify-between py-6 px-8 border-t text-gray-600 text-sm">
          {/* Slider indicator */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-400">01</span>
            <span className="text-lg font-semibold">03</span>
            <span className="text-gray-400">05</span>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
