// app/page.tsx (Next.js 13+ with App Router)
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Travel() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".fade-up",
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          ".image-left",
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex lg:flex-row flex-col items-center justify-center bg-white overflow-hidden LG:px-6"
    >




      {/* Right side content */}
      <div className="relative z-20 max-w-xl ml-auto fade-up  p-8 rounded-2xl  backdrop-blur">
        <h3 className="uppercase tracking-widest text-gray-400 text-sm">
          HYDERABAD
        </h3>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          EXPLORE
        </h1>
        <p className="mt-6 text-gray-600 leading-relaxed">
          Visit the island Alden and hike up to the top side called{" "}
          <span className="font-semibold">the Norwegian horse</span>. The
          mountain rises straight out of the ocean, 481 m above sea level. This
          is one of the most significant sailing marks on the west coast of
          Norway and is visible from more than 100 km away. From the top you can
          enjoy a spectacular 360 degree view.
        </p>

        <p className="mt-4 text-gray-600 leading-relaxed">
          The island is most notable for its 460-metre (1500 ft) tall mountain
          called Neshornet. The mountain dominates the island, giving it very
          steep coastlines.
        </p>

        {/* Info Row */}
        <div className="flex items-center gap-6 mt-8">
          <div>
            <p className="text-2xl font-bold">78 km</p>
            <p className="text-sm text-gray-500">46.4 miles</p>
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-sm text-gray-500">Days</p>
          </div>
          <button className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
            More Info
          </button>
        </div>
      </div>

            {/* Floating cabin image */}
      <div className="relative z-10 w-full fade-up">
        <img
          src="/images/b2b.png" // your cabin image
          alt="Cabin"
   
          className="object-contain "
        />
      </div>
    </div>
  );
}
