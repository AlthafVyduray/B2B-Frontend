"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    id: 1,
    title: "Северное сияние",
    desc: "Наблюдайте удивительное явление природы как настоящий путешественник.",
    img: "/images/northern-lights.jpg",
    pinColor: "red",
    position: "top-10 left-10",
  },
  {
    id: 2,
    title: "Эксклюзивные экспедиции",
    desc: "Погружение в уникальные локации и приключения.",
    img: "/images/diving.jpg",
    pinColor: "red",
    position: "top-40 right-20",
  },
  {
    id: 3,
    title: "Комфортное проживание",
    desc: "Лучшие отели и уютные номера для вашего отдыха.",
    img: "/images/hotel.jpg",
    pinColor: "yellow",
    position: "top-72 left-1/4",
  },
]

export default function JourneyMap() {
  const pathRef = useRef(null)

  useEffect(() => {
    if (!pathRef.current) return
    const pathLength = pathRef.current.getTotalLength()

    gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength })

    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 3,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: pathRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })
  }, [])

  return (
    <section className="relative bg-[#e6ebef] py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-serif text-gray-800 text-center mb-16">
          Идеальный выбор для тех, кто ищет особенный опыт
        </h2>

        {/* SVG path (dotted line) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            d="M100 100 C 300 200, 500 50, 700 250 S 1100 400, 1200 200"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="6 10"
            fill="none"
          />
        </svg>

        {/* Steps */}
        {steps.map((step) => (
          <div
            key={step.id}
            className={`absolute ${step.position} w-48`}
          >
            {/* Pin */}
            <div
              className={`w-4 h-4 rounded-full mb-2`}
              style={{ backgroundColor: step.pinColor }}
            ></div>

            {/* Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden transform rotate-[-2deg]">
              <div className="relative h-28 w-full">
                <Image
                  src={step.img}
                  alt={step.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
