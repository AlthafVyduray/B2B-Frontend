import React from 'react'
import BookingCardComponent from './components/Booking'
import Link from 'next/link'
import { Bell, User } from 'lucide-react'
import Hyderabad from './components/Hyderabad'
import ScrollGallery from './components/Discover'
import BookLayout from './components/Book'
import ArticleSlider from './components/Book'
import TravelArticles from './components/Book'
import NatureFooter from './components/Footer'
import Picture from './components/Picture'
import JourneyMap from './components/Picture'
import WhyChooseUs from './components/WhyChooseUs'
import Travel from './components/Travel'

export default function TravelHeroComponent() {
  return (
    <>
      {/* Hero Section */}
      <section className='relative bg-[url("/images/3.jpg")] bg-cover bg-center h-screen border rounded-4xl lg:m-10 m-4'>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-4xl"></div>
        <div className='w-full h-full grid lg:grid-cols-2 px-4 sm:px-6 md:px-10 lg:px-20 relative'>
          
          {/* User Icon */}
          <div className='absolute top-4 right-4 lg:top-0 lg:right-0 flex'>
            <Link href={"/signup"} className="px-3 py-2 flex justify-center items-center">
              <Bell className='text-black w-6 h-6' />
            </Link>
            <Link href={"/signup"} className="px-3 py-2 flex justify-center items-center">
              <User className='text-black w-6 h-6' />
            </Link>
          </div>

          {/* Empty grid cell for lg layout */}
          <div></div>

          {/* Content */}
          <div className='absolute  bottom-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-2/3 lg:right-20 lg:top-1/2 w-[90%] sm:w-[80%] lg:w-auto flex justify-center lg:justify-end'>
            <div className="bg-white/90 lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-xl lg:rounded-none shadow-lg lg:shadow-none text-white text-center lg:text-left">
              
              <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight">
                EXPLORE WITH
              </h3>
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mt-1">
                B2B HYDERABAD
              </h2>

              <p className="mt-4 text-xs sm:text-sm md:text-base text-white max-w-xl mx-auto lg:mx-0">
                B2B Hyderabad Travel Agency – your one-stop portal for seamless bookings, tours, and travel solutions in the City of Pearls.
              </p>

              <button className="mt-6 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-wide border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
                <Link href={"/booking"} className="px-4 py-2 rounded-md">
                  Get Started
                </Link>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Accessibility helper */}
        <span className="sr-only">Hero section with background image and travel CTA</span>
      </section>

      {/* Booking Section */}
      <section className="px-0 sm:px-2 md:px-10 lg:px-20">
        <BookingCardComponent />
      </section>

      {/* Hyderabad Section */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20">
        <Hyderabad />
      </section>
      <section className="px-0 sm:px-6 md:px-10 lg:px-30">
        <Travel/>
      </section>
            <section className="px-4 sm:px-6 md:px-10 lg:px-20 mb-10">
        <WhyChooseUs/>
      </section>
      <section className="px-4 sm:px-6 md:px-10 lg:px-20">
        <ScrollGallery/>
      </section>

      <section className="px-4 sm:px-6 md:px-10 lg:px-20">
        <TravelArticles/>
      </section>
      <section className="">
       <NatureFooter/>
      </section>
      {/* <section className="px-4 sm:px-6 md:px-10 lg:px-20">
        <BookLayout/>
      </section> */}
    </>
  )
}
