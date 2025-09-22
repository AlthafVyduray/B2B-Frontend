"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const images = [
    { id: 1, src: "https://images.herzindagi.info/image/2022/Oct/places-to-visit.jpg", title: "01 Saksun, Faroe Islands", distance: "1692 km away" },
    { id: 2, src: "http://www.liveenhanced.com/wp-content/uploads/2018/01/2.Golconda-Fort-Images.jpg", title: "02 Mooloolaba, Australia", distance: "2516 km away" },
    { id: 3, src: "https://hyderabadboss.com/wp-content/uploads/2018/02/ramoji-film-city-shooting.jpg", title: "03 Santorini, Greece", distance: "3120 km away" },
];

export default function ScrollGallery() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Shutter effect on scroll
            gsap.utils.toArray(".gallery-image").forEach((image, i) => {
                gsap.fromTo(
                    image,
                    { clipPath: "inset(0 100% 0 0)" },
                    {
                        clipPath: "inset(0 0% 0 0)",
                        duration: 1.2,
                        ease: "power4.out",
                        scrollTrigger: {
                            trigger: image,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full  flex flex-col lg:flex-row items-stretch bg-[#f9f8f4]"
        >
            {/* LEFT TEXT SECTION */}
            <div className="lg:w-1/2 w-full flex flex-col p-5 lg:p-20">
                <h1 className="text-4xl lg:text-5xl font-light text-[#d1c4a9] mb-6">
                    Explore Hyderabad with Trusted Travel Partners
                </h1>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    B2B Hyderabad Travel Agency is your one-stop destination for seamless
                    bookings, curated tours, and corporate travel solutions in the City of Pearls.
                    From heritage walks to modern experiences, we help you uncover Hyderabad
                    like never before.
                </p>
                <button className="px-6 py-3 bg-[#d1c4a9] text-black font-semibold rounded hover:bg-[#c5b99f] transition">
                    Get Started
                </button>

                <div className="mt-10 space-y-4 text-gray-700 text-sm">
                    <p> <b>Corporate & Group Bookings</b> – Hassle-free arrangements for business and leisure.</p>
                    <p> <b>Custom Tours</b> – Heritage, cultural, and modern city experiences tailored for you.</p>
                    <p> <b>24/7 Travel Support</b> – Dedicated assistance for smooth journeys.</p>
                </div>
            </div>


            {/* RIGHT IMAGES SECTION */}
            <div className="lg:w-1/2 w-full flex overflow-x-scroll lg:overflow-hidden space-x-6 p-6">
                {images.map((item) => (
                    <div
                        key={item.id}
                        className="gallery-image relative min-w-[280px] lg:min-w-[320px] h-[420px] lg:h-full rounded-lg overflow-hidden shadow-lg bg-gray-200"
                    >
                        <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm">{item.distance}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
