"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronRight, Gift, Heart, Calendar, Users, MessageSquare, Star } from "lucide-react"
import {
  HeritageCornerDecoration,
  HeritageHeaderDecorationFull,
  HeritageDivider,
} from "../components/ui/heritage-decorations"
import { UniversalButton } from "../components/ui/universal-button"

// Wedding Gift Packages
const weddingPackages = [
  {
    id: 1,
    title: "Royal Wedding Collection",
    description:
      "Our most luxurious assortment of premium sweets and dry fruits, elegantly packaged for royal weddings.",
    price: "₹15,000 onwards",
    image: "/royal-wedding-collection.png",
    features: ["Premium gift box", "Customized packaging", "Handcrafted sweets", "Premium dry fruits"],
    popular: true,
  },
  {
    id: 2,
    title: "Bridal Bliss Package",
    description:
      "A delightful selection of traditional sweets perfect for bridal showers and pre-wedding celebrations.",
    price: "₹8,000 onwards",
    image: "/bridal-bliss-package.png",
    features: ["Elegant packaging", "Assorted sweets", "Customized message card", "Express delivery"],
    popular: false,
  },
  {
    id: 3,
    title: "Wedding Favor Collection",
    description: "Individually packaged sweets perfect as wedding favors for your guests to take home.",
    price: "₹350 per piece (Min. 50)",
    image: "/wedding-favor-collection.png",
    features: ["Individual packaging", "Personalized tags", "Multiple sweet options", "Bulk discounts"],
    popular: false,
  },
  {
    id: 4,
    title: "Engagement Celebration Box",
    description: "Celebrate your engagement with our specially curated box of premium sweets and savories.",
    price: "₹5,000 onwards",
    image: "/engagement-celebration-box.png",
    features: ["Elegant gift box", "Mix of sweets & savories", "Customized packaging", "Premium presentation"],
    popular: false,
  },
]

// Testimonials
const testimonials = [
  {
    id: 1,
    name: "Priya & Rahul Sharma",
    role: "Wedding in Mumbai",
    content:
      "The customized sweet boxes for our wedding were absolutely stunning! Our guests couldn't stop talking about the beautiful packaging and delicious sweets. Thank you for making our special day even sweeter!",
    rating: 5,
    image: "/wedding-couple-testimonial-1.png",
  },
  {
    id: 2,
    name: "Ananya & Vikram Mehta",
    role: "Destination Wedding in Udaipur",
    content:
      "We ordered 500 favor boxes for our destination wedding, and Ramesh Sweets delivered perfection! The personalized touch with our names and wedding date made them extra special. Highly recommend!",
    rating: 5,
    image: "/wedding-couple-testimonial-2.png",
  },
  {
    id: 3,
    name: "Meera & Arjun Patel",
    role: "Traditional Wedding in Delhi",
    content:
      "The Royal Wedding Collection exceeded our expectations! The presentation was exquisite and the sweets were fresh and delicious. Our families were impressed with the quality and elegance.",
    rating: 5,
    image: "/wedding-couple-testimonial-3.png",
  },
]

// FAQ Items
const faqItems = [
  {
    question: "How far in advance should we place our wedding order?",
    answer:
      "We recommend placing your order at least 4-6 weeks before your wedding date to ensure we can accommodate all customizations and deliver on time. For peak wedding season (October-February), we suggest booking 2-3 months in advance.",
  },
  {
    question: "Can we customize the packaging with our wedding theme colors?",
    answer:
      "We offer fully customizable packaging to match your wedding theme and colors. Our design team will work with you to create packaging that complements your wedding aesthetic perfectly.",
  },
  {
    question: "Do you offer tasting sessions before we place a large order?",
    answer:
      "Yes, we offer tasting sessions for couples planning to place large wedding orders. You can sample our various sweets and discuss customization options with our wedding specialists. Tasting sessions can be scheduled by appointment.",
  },
  {
    question: "What is the minimum order quantity for wedding favors?",
    answer:
      "Our minimum order for wedding favors is 50 pieces. We offer bulk discounts for orders of 100+ pieces, with significant savings for orders of 250+ and 500+ pieces.",
  },
  {
    question: "Do you deliver to wedding venues directly?",
    answer:
      "Yes, we offer direct delivery to wedding venues across the city. For destination weddings, we can arrange for special shipping to ensure your sweets arrive fresh and in perfect condition.",
  },
]

// Wedding Gifts Page Component
export default function WeddingGiftsPage() {
  const [activeTab, setActiveTab] = useState("packages")
  const [activeAccordion, setActiveAccordion] = useState(null)

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="bg-light-pink">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-lighter to-white">
        <div className="absolute inset-0 bg-heritage-pattern opacity-10"></div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/30 rounded-tl-sm"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/30 rounded-tr-sm"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/30 rounded-bl-sm"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/30 rounded-br-sm"></div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0 md:pr-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-2 px-3 py-1 bg-pink-lighter border border-pink/20 rounded-sm">
                <span className="text-pink-darker font-cinzel text-sm tracking-wider">CELEBRATE LOVE</span>
              </div>

              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
                Exquisite Wedding <br />
                <span className="text-pink-darker">Gift Collections</span>
              </h1>

              <HeritageHeaderDecorationFull className="my-4" />

              <p className="font-eb-garamond text-lg md:text-xl mb-6 text-gray-700">
                Celebrate the union of two souls with our handcrafted sweet collections, designed to add a touch of
                tradition and elegance to your special day.
              </p>

              <div className="flex flex-wrap gap-4">
                <UniversalButton
                  as={Link}
                  to="#wedding-packages"
                  className="bg-pink-dark hover:bg-pink-darker border-pink-dark"
                  onClick={() => {
                    document.getElementById("wedding-packages").scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  EXPLORE COLLECTIONS
                </UniversalButton>

                <UniversalButton
                  as={Link}
                  to="#consultation"
                  variant="secondary"
                  className="border-pink-dark text-pink-darker hover:bg-pink-lighter/50"
                  onClick={() => {
                    document.getElementById("consultation").scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  REQUEST CONSULTATION
                </UniversalButton>
              </div>
            </motion.div>

            <motion.div
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeritageCornerDecoration className="absolute inset-0" variant="full" />
              <div className="relative overflow-hidden rounded-sm shadow-lg border-2 border-gold/30">
                <img
                  src="/wedding-gift-hero.png"
                  alt="Luxury Wedding Gift Collection"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-sm shadow-md border border-gold/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span className="font-cinzel text-sm text-pink-darker flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-pink" /> Handcrafted with Love
                </span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-sm shadow-md border border-gold/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span className="font-cinzel text-sm text-pink-darker flex items-center">
                  <Gift className="w-4 h-4 mr-1 text-pink" /> Customized Packaging
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wedding Packages Section */}
      <section id="wedding-packages" className="py-16 relative">
        <div className="absolute inset-0 bg-heritage-pattern opacity-5"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 px-3 py-1 bg-pink-lighter border border-pink/20 rounded-sm">
              <span className="text-pink-darker font-cinzel text-sm tracking-wider">OUR OFFERINGS</span>
            </span>

            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Wedding Gift Collections</h2>
            <HeritageHeaderDecorationFull className="my-4" />

            <p className="font-eb-garamond text-lg max-w-3xl mx-auto text-gray-700">
              From intimate gatherings to grand celebrations, our wedding collections are designed to add sweetness to
              every moment of your special journey.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {weddingPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={fadeIn}
                className="relative bg-white rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group"
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-4 right-4 z-10 bg-pink-dark text-white px-3 py-1 rounded-sm text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                {/* Package image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pkg.image || "/placeholder.svg"}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Package content */}
                <div className="p-6 relative">
                  <HeritageCornerDecoration className="absolute inset-0" variant="corners" />

                  <h3 className="font-cinzel text-xl font-bold mb-2">{pkg.title}</h3>
                  <HeritageDivider className="my-3" />

                  <p className="font-eb-garamond text-gray-600 mb-4">{pkg.description}</p>

                  <div className="mb-4">
                    <span className="font-cinzel text-lg font-bold text-pink-darker">{pkg.price}</span>
                  </div>

                  <ul className="mb-5 space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gold mr-2">✦</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <UniversalButton
                    as={Link}
                    to="#consultation"
                    className="w-full bg-pink-dark hover:bg-pink-darker border-pink-dark"
                    onClick={() => {
                      document.getElementById("consultation").scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    INQUIRE NOW
                  </UniversalButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-heritage-pattern opacity-5"></div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/30 rounded-tl-sm"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/30 rounded-tr-sm"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/30 rounded-bl-sm"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/30 rounded-br-sm"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 px-3 py-1 bg-pink-lighter border border-pink/20 rounded-sm">
              <span className="text-pink-darker font-cinzel text-sm tracking-wider">PERSONALIZATION</span>
            </span>

            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Customization Options</h2>
            <HeritageHeaderDecorationFull className="my-4" />

            <p className="font-eb-garamond text-lg max-w-3xl mx-auto text-gray-700">
              Make your wedding gifts truly unique with our range of customization options, designed to reflect your
              personal style and wedding theme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <HeritageCornerDecoration className="absolute inset-0" variant="full" />
              <div className="relative overflow-hidden rounded-sm shadow-lg border-2 border-gold/30">
                <img src="/wedding-gift-customization.png" alt="Customized Wedding Gifts" className="w-full h-auto" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="font-cinzel text-2xl font-bold mb-6">Make It Uniquely Yours</h3>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-lighter rounded-full flex items-center justify-center mr-4">
                    <Gift className="w-6 h-6 text-pink-dark" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold mb-2">Custom Packaging</h4>
                    <p className="text-gray-600">
                      Choose from our range of elegant boxes, or customize with your wedding colors and theme.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-lighter rounded-full flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-pink-dark" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold mb-2">Personalized Messaging</h4>
                    <p className="text-gray-600">
                      Add your names, wedding date, or a special message to make your gifts memorable.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-lighter rounded-full flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-pink-dark" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold mb-2">Occasion-Specific Selections</h4>
                    <p className="text-gray-600">
                      Curate different sweet collections for various wedding events from engagement to reception.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-lighter rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-pink-dark" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold mb-2">Guest Preferences</h4>
                    <p className="text-gray-600">
                      Accommodate dietary restrictions with sugar-free, vegan, or nut-free options for your guests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <UniversalButton
                  as={Link}
                  to="#consultation"
                  className="bg-pink-dark hover:bg-pink-darker border-pink-dark"
                  onClick={() => {
                    document.getElementById("consultation").scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  DISCUSS CUSTOMIZATION
                </UniversalButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-pink-lighter/50 relative">
        <div className="absolute inset-0 bg-heritage-pattern opacity-5"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 px-3 py-1 bg-white border border-pink/20 rounded-sm">
              <span className="text-pink-darker font-cinzel text-sm tracking-wider">HAPPY COUPLES</span>
            </span>

            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">What Couples Say</h2>
            <HeritageHeaderDecorationFull className="my-4" />

            <p className="font-eb-garamond text-lg max-w-3xl mx-auto text-gray-700">
              Hear from couples who made their special day even sweeter with our wedding gift collections.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.id} variants={fadeIn} className="bg-white rounded-sm p-6 shadow-md relative">
                <HeritageCornerDecoration className="absolute inset-0" variant="corners" />

                {/* Quote icon */}
                <div className="absolute -top-4 -left-4 bg-pink-lighter w-8 h-8 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-pink-dark" />
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? "text-gold fill-gold" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                {/* Testimonial content */}
                <p className="font-eb-garamond italic text-gray-600 mb-6">"{testimonial.content}"</p>

                {/* Testimonial author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gold/30">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-heritage-pattern opacity-5"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 px-3 py-1 bg-pink-lighter border border-pink/20 rounded-sm">
              <span className="text-pink-darker font-cinzel text-sm tracking-wider">QUESTIONS</span>
            </span>

            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <HeritageHeaderDecorationFull className="my-4" />

            <p className="font-eb-garamond text-lg max-w-3xl mx-auto text-gray-700">
              Find answers to common questions about our wedding gift services.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="mb-4 border border-gold/20 rounded-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left bg-pink-lighter/30 hover:bg-pink-lighter/50 transition-colors flex justify-between items-center"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="font-cinzel font-bold">{item.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-pink-dark transition-transform ${activeAccordion === index ? "rotate-90" : ""}`}
                  />
                </button>

                <div
                  className={`px-6 py-4 bg-white transition-all duration-300 ${
                    activeAccordion === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA Section */}
      <section id="consultation" className="py-16 bg-gradient-to-b from-pink-lighter/70 to-white relative">
        <div className="absolute inset-0 bg-heritage-pattern opacity-5"></div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/30 rounded-tl-sm"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/30 rounded-tr-sm"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/30 rounded-bl-sm"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/30 rounded-br-sm"></div>

        <div className="container mx-auto px-4">
          <div className="bg-white p-8 md:p-12 rounded-sm shadow-lg relative max-w-5xl mx-auto">
            <HeritageCornerDecoration className="absolute inset-0" variant="full" />

            <div className="text-center mb-8">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Request a Wedding Consultation</h2>
              <HeritageHeaderDecorationFull className="my-4" />

              <p className="font-eb-garamond text-lg max-w-3xl mx-auto text-gray-700">
                Our wedding specialists are ready to help you create the perfect sweet gifts for your special day. Fill
                out the form below to schedule a consultation.
              </p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner's Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                  placeholder="Enter your partner's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Guest Count</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30"
                  placeholder="Enter approximate number of guests"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your requirements</label>
                <textarea
                  className="w-full px-4 py-2 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-pink-dark/30 h-32"
                  placeholder="Please share details about your wedding theme, color preferences, and any specific requirements for your wedding gifts"
                ></textarea>
              </div>

              <div className="md:col-span-2 text-center">
                <UniversalButton type="submit" className="bg-pink-dark hover:bg-pink-darker border-pink-dark px-8">
                  SUBMIT REQUEST
                </UniversalButton>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
