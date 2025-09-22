"use client"

import { Mountain, Binoculars, Clock, Briefcase } from "lucide-react"

const features = [
  {
    id: 1,
    icon: <Briefcase className="w-10 h-10 text-gray-800 relative z-10" />,
    title: "Memorable Experiences",
    desc: "Browse and book tours and activities curated for businesses and groups.",
    bg: "bg-pink-100",
  },
  {
    id: 2,
    icon: <Mountain className="w-10 h-10 text-gray-800 relative z-10" />,
    title: "Ultimate Flexibility",
    desc: "You’re in control, with free cancellation and easy rescheduling options.",
    bg: "bg-green-100",
  },
  {
    id: 3,
    icon: <Binoculars className="w-10 h-10 text-gray-800 relative z-10" />,
    title: "Extended Customization",
    desc: "Handpick tours until it fits your corporate travel needs.",
    bg: "bg-blue-100",
  },
  {
    id: 4,
    icon: <Clock className="w-10 h-10 text-gray-800 relative z-10" />,
    title: "Customer Satisfaction",
    desc: "We deliver reliable services trusted by Hyderabad’s top businesses.",
    bg: "bg-purple-100",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-light text-[#d1c4a9] mb-12">
          Why Choose Us
        </h2>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {features.map((feature) => (
            <div key={feature.id} className="relative flex flex-col items-center text-center">
              {/* Background circle */}
              <div
                className={`absolute w-16 h-16 rounded-full ${feature.bg} -top-3 left-1/2 -translate-x-1/2`}
              ></div>

              {/* Icon */}
              <div className="mb-4">{feature.icon}</div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mt-2">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
