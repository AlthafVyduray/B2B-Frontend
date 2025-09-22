"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BookingCardComponent({ imageUrl = "/images/3.png" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal with scale + clip effect
      gsap.fromTo(
        ".booking-image",
        { scale: 1.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );

      // Text animation
      gsap.from(".animate-story", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full mx-auto lg:p-6">
      <div className="rounded-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT: image */}
        <div className="lg:w-1/2 w-full relative flex-shrink-0">
          <svg viewBox="0 0 800 600" className="w-full h-full block booking-image">
            {/* <defs>
              <clipPath id="brushMask">
                <path d="M40,50 C140,20 260,0 380,20 C520,50 720,30 760,140 C780,200 740,320 660,360 C560,420 420,500 320,480 C200,460 80,420 40,320 Z" />
              </clipPath>
            </defs> */}

            <image
              href={imageUrl}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#brushMask)"
            />
          </svg>
        </div>

        {/* RIGHT: text */}
        <div className="lg:w-1/2 w-full p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-2xl">
            <h3 className="animate-story text-[#827966] text-lg tracking-widest mb-4 font-light">
              {/* Optional sub-heading */}
            </h3>
            <h2 className="animate-story text-5xl md:text-6xl font-light text-[#d1c4a9] mb-8 font-serif">
              About B2B Hyderabad
            </h2>
            <p className="animate-story text-[#302e2b] text-lg leading-relaxed mb-6 font-light">
              At B2B Hyderabad, we believe that every journey tells a story. Since our inception, we've been crafting unforgettable travel experiences for adventurers worldwide. Our dedication to excellence and passion for exploration sets us apart in the travel industry
            </p>
            <p className="animate-story text-[#302e2b] text-lg leading-relaxed font-light">
              Every grain of basmati rice, every carefully selected spice, and
              every tender piece of meat is prepared with the same passion and
              dedication that has made our biryani legendary across generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
