"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TravelArticles() {
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card, i) => {
      let img = card.querySelector("img");

      // shutter reveal effect
      gsap.fromTo(
        img,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "power2.out",
          duration: 1.2,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });
  }, []);

  const articles = [
    {
      title: "Three Ways to Get Travel Discounts",
      author: "Angela Lockwood & Crew",
      img: "https://www.lasociedadgeografica.com/blog/uploads/2021/03/hyderabad-tour-package-charminar-1024x512.jpg",
    },
    {
      title: "Exploring the Great Outdoors",
      author: "John Smith",
      img: "https://s3.india.com/wp-content/uploads/2024/07/7-Tourist-Attractions-You-Shouldnt-Miss-In-Hyderabad.jpg##image/jpg",
    },
    {
      title: "Van Life Adventures",
      author: "Emily Johnson",
      img: "https://media.easemytrip.com/media/Blog/India/637045878100143683/637045878100143683fiQVxm.jpg",
    },
    {
      title: "Lakeside Escapes",
      author: "Michael Brown",
      img: "https://www.fabhotels.com/blog/wp-content/uploads/2019/02/Mecca-Masjid-1.jpg",
    },
  ];

  return (
    <section className="w-full py-40 px-2 lg:px-20 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl lg:text-5xl font-light tracking-tight max-w-lg text-[#d1c4a9]">
          Become a Travel Pro in One Easy Lesson
        </h2>
        <button className="px-5 py-2 border border-[#d1c4a9] text-black rounded-full text-sm hover:bg-gray-100 transition">
          More Articles
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className="relative rounded-md overflow-hidden shadow-lg group"
          >
            <img
              src={article.img}
              alt={article.title}
              width={500}
              height={600}
              className="w-full h-[420px] object-cover"
            />
            {/* Overlay text */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="font-semibold text-lg">{article.title}</h3>
              <p className="text-[#d1c4a9] text-sm mt-2">{article.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
