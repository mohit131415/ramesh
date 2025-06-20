"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HeritageSectionHeader from "../ui/heritage-section-header"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

// Premium testimonial data with high-quality profile images
const testimonials = [
  {
    id: 1,
    name: "Rajesh Sharma",
    location: "Mumbai",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "The sweets from Ramesh Sweets are absolutely divine! The Kaju Katli melts in your mouth and the Motichoor Ladoo is perfectly sweet. I've been ordering for all family celebrations for years.",
    date: "15 March 2023",
    verified: true,
    title: "Exceptional Quality and Taste",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Delhi",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "I ordered a gift box for Diwali and was amazed by the presentation and freshness. Every sweet was perfectly crafted and tasted authentic. The packaging was elegant and perfect for gifting.",
    date: "22 October 2022",
    verified: true,
    title: "Perfect for Special Occasions",
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    location: "Bangalore",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    rating: 5,
    text: "As someone who appreciates traditional sweets, I can confidently say that Ramesh Sweets maintains the authentic recipes and flavors. Their attention to detail and quality ingredients are evident in every bite.",
    date: "7 January 2023",
    verified: true,
    title: "Authentic Traditional Flavors",
  },
  {
    id: 4,
    name: "Ananya Desai",
    location: "Jaipur",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    rating: 4,
    text: "The Milk Cake and Gulab Jamun are simply outstanding. I've tried many sweet shops, but Ramesh Sweets has a special touch that makes their sweets exceptional. The delivery was prompt and packaging was secure.",
    date: "3 April 2023",
    verified: true,
    title: "Consistently Excellent",
  },
  {
    id: 5,
    name: "Arjun Kapoor",
    location: "Chennai",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    rating: 5,
    text: "I ordered sweets for my parents' anniversary and they were thrilled with the quality. The sweets were fresh, not too sweet, and had that homemade taste that's hard to find these days. Will definitely order again!",
    date: "19 February 2023",
    verified: true,
    title: "Impressed with Every Order",
  },
]

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-gold" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return

    const interval = setInterval(() => {
      setDirection(1)
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isPaused, activeIndex])

  const nextTestimonial = () => {
    setIsAutoPlaying(false)
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setIsAutoPlaying(false)
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 60 : -60,
      opacity: 0,
    }),
  }

  return (
    <section className="py-20 md:py-28 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d4af37' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heritage Section Header */}
        <HeritageSectionHeader
          title="What Our Customers Say"
          subtitle="Discover why our patrons have cherished our heritage sweets for generations"
          preTitle="TESTIMONIALS"
          topSymbol="❖"
          bottomSymbol="✦"
        />

        {/* Main testimonial showcase */}
        <div className="relative mx-auto max-w-5xl mt-16 mb-16">
          {/* Outer decorative border */}
          <div className="absolute -inset-4 border border-gold/30"></div>

          {/* Main content container with double border */}
          <div
            className="relative border-2 border-gold/40 p-8 md:p-12 shadow-lg min-h-[400px] flex items-center"
            style={{ backgroundColor: "#FFF9FB" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60 -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60 translate-x-1/2 translate-y-1/2"></div>

            {/* Inner decorative border */}
            <div className="absolute inset-4 border border-dashed border-gold/30"></div>

            {/* Quote mark decoration */}
            <svg className="absolute top-8 left-8 w-12 h-12 text-gold/10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Testimonial slider */}
            <div className="w-full relative z-10">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  }}
                  className="w-full"
                >
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Customer image and info */}
                    <div className="flex flex-col items-center md:items-start">
                      <div className="relative w-24 h-24 mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-gold/30"></div>
                        <img
                          src={testimonials[activeIndex].image || "/placeholder.svg"}
                          alt={testimonials[activeIndex].name}
                          className="w-full h-full object-cover rounded-full p-1"
                        />
                        {testimonials[activeIndex].verified && (
                          <div className="absolute -bottom-2 -right-2 bg-gold text-white rounded-full p-1">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-cinzel text-lg font-bold text-center uppercase mb-1">
                        {testimonials[activeIndex].name}
                      </h3>

                      <p className="text-gray-600 text-sm mb-2">{testimonials[activeIndex].location}</p>
                      <StarRating rating={testimonials[activeIndex].rating} />
                    </div>

                    {/* Testimonial content */}
                    <div className="flex-1 border-l-2 border-gold/10 pl-6">
                      <p className="text-gray-700 font-eb-garamond text-lg italic leading-relaxed mb-4">
                        "{testimonials[activeIndex].text}"
                      </p>
                      <div className="text-sm text-gray-500 font-medium">{testimonials[activeIndex].date}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation dots and arrows */}
              <div className="flex justify-center items-center mt-10 space-x-4">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full bg-gold/20 hover:bg-gold flex items-center justify-center text-gold hover:text-white transition-colors duration-300"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex space-x-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsAutoPlaying(false)
                        setDirection(index > activeIndex ? 1 : -1)
                        setActiveIndex(index)
                      }}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === activeIndex ? "bg-gold" : "bg-gray-300 hover:bg-gold/50"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full bg-gold/20 hover:bg-gold flex items-center justify-center text-gold hover:text-white transition-colors duration-300"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
