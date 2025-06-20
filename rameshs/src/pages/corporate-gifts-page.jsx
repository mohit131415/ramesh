"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Gift,
  Award,
  Users,
  Package,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  FileText,
  Building,
  CreditCard,
  Truck,
} from "lucide-react"

import CollectionHeader from "../components/collection-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { UniversalButton } from "../components/ui/universal-button"
import HeritageSectionHeader from "../components/ui/heritage-section-header"

// Luxury Corner SVG Component
const LuxuryCorner = ({ className, rotate = 0 }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    className={className}
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <path
      d="M1 1V16C1 25.9411 9.05887 34 19 34H34V39"
      stroke="url(#gold-gradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="34" cy="34" r="3" fill="url(#gold-circle)" />
    <circle cx="1" cy="1" r="1" fill="#D4AF37" />
    <defs>
      <linearGradient id="gold-gradient" x1="1" y1="1" x2="34" y2="39" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D3AE6E" />
        <stop offset="0.5" stopColor="#D3AE6E" />
        <stop offset="1" stopColor="#B18C50" />
      </linearGradient>
      <radialGradient id="gold-circle" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E5C992" />
        <stop offset="1" stopColor="#D3AE6E" />
      </radialGradient>
    </defs>
  </svg>
)

// Decorative Divider Component
const DecorativeDivider = ({ className }) => (
  <div className={`flex items-center justify-center w-full my-8 ${className}`}>
    <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
    <div className="mx-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.5 9H9.5L12 2Z" fill="#D3AE6E" />
        <path d="M12 22L9.5 15H14.5L12 22Z" fill="#D3AE6E" />
        <path d="M2 12L9 9.5V14.5L2 12Z" fill="#D3AE6E" />
        <path d="M22 12L15 14.5V9.5L22 12Z" fill="#D3AE6E" />
        <circle cx="12" cy="12" r="4" fill="#D3AE6E" />
        <circle cx="12" cy="12" r="2" fill="#F5EBD7" />
      </svg>
    </div>
    <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
  </div>
)

// Gift Package Card Component
const GiftPackageCard = ({ title, price, description, features, imageSrc, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.15,
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative"
    >
      <div className="relative overflow-hidden h-full z-0 p-3 bg-white transition-transform duration-300 hover:scale-[1.02]">
        {/* Luxury Border */}
        <div className="absolute inset-0 border border-gold/30"></div>
        <div className="absolute inset-[3px] border border-gold/10"></div>

        {/* Luxury Corners */}
        <LuxuryCorner className="absolute -top-2 -left-2 scale-100" rotate={0} />
        <LuxuryCorner className="absolute -top-2 -right-2 scale-100" rotate={90} />
        <LuxuryCorner className="absolute -bottom-2 -left-2 scale-100" rotate={270} />
        <LuxuryCorner className="absolute -bottom-2 -right-2 scale-100" rotate={180} />

        {/* Package Image */}
        <div className="relative aspect-[4/3] overflow-hidden mb-4 shadow-lg">
          <div className="absolute inset-0 border-2 border-gold"></div>
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </div>

        {/* Package Content */}
        <div className="relative px-2 py-4 text-center">
          {/* Decorative Element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
          </div>

          {/* Package Name */}
          <h3 className="font-cinzel text-xl font-bold text-black mb-2 tracking-wide">{title}</h3>

          {/* Price */}
          <p className="text-gold-dark font-eb-garamond text-xl font-semibold mb-3">{price}</p>

          <p className="text-black/70 text-sm mb-4 font-eb-garamond italic">{description}</p>

          {/* Features */}
          <ul className="text-left mb-6 space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <span className="text-gold mr-2 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.3334 4L6.00002 11.3333L2.66669 8"
                      stroke="#D3AE6E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Inquire Button */}
          <UniversalButton
            as="a"
            href="#contact"
            variant="primary"
            className="bg-gold border-gold/50 hover:bg-gold-dark w-full"
          >
            Inquire Now
          </UniversalButton>
        </div>
      </div>
    </motion.div>
  )
}

// Testimonial Card Component
const TestimonialCard = ({ quote, author, company, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.15,
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative"
    >
      <Card className="relative overflow-hidden border-gold/20 bg-white">
        <CardContent className="pt-6">
          {/* Quote mark */}
          <div className="absolute top-4 left-4 text-gold/20 text-6xl font-serif">"</div>
          <div className="relative z-10">
            <p className="font-eb-garamond text-lg italic text-gray-700 mb-4">{quote}</p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <Users size={16} />
              </div>
              <div className="ml-3">
                <p className="font-cinzel text-sm font-semibold">{author}</p>
                <p className="text-xs text-gray-500">{company}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.1,
      },
    },
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="border-b border-gold/20 py-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-cinzel font-medium text-lg"
      >
        <span>{question}</span>
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronRight className="transform rotate-90" />
        </span>
      </button>
      {isOpen && (
        <div className="mt-2 font-eb-garamond text-gray-700">
          <p>{answer}</p>
        </div>
      )}
    </motion.div>
  )
}

// Form Step Component
const FormStep = ({ step, currentStep, children }) => {
  return <div className={`transition-all duration-500 ${currentStep === step ? "block" : "hidden"}`}>{children}</div>
}

// Main Corporate Gifts Page Component
export default function CorporateGiftsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    packageType: "",
    quantity: "",
    budget: "",
    requirements: "",
    deliveryDate: "",
    customization: false,
    branding: false,
    specialInstructions: "",
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    // Show success message or redirect
    alert("Thank you for your inquiry. Our corporate team will contact you shortly.")
  }

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0)
  }, [])

  // Sample gift packages data
  const giftPackages = [
    {
      title: "Executive Collection",
      price: "Starting at ₹5,000",
      description: "Premium sweets and dry fruits in elegant packaging for senior executives.",
      features: [
        "Handcrafted luxury box",
        "Premium assorted sweets (500g)",
        "Dry fruit selection (250g)",
        "Personalized message card",
        "Corporate branding options",
      ],
      imageSrc: "/executive-collection-sweets.png",
    },
    {
      title: "Celebration Hamper",
      price: "Starting at ₹8,500",
      description: "Comprehensive gift hamper for special corporate celebrations and milestones.",
      features: [
        "Luxury gift basket presentation",
        "Assorted sweets selection (750g)",
        "Premium dry fruits (500g)",
        "Signature Kaju Katli box (250g)",
        "Custom branding on packaging",
      ],
      imageSrc: "/indian-sweets-dry-fruits-hamper.png",
    },
    {
      title: "Client Appreciation Box",
      price: "Starting at ₹3,000",
      description: "Elegant gift boxes perfect for client appreciation and relationship building.",
      features: [
        "Elegant presentation box",
        "Signature sweets assortment (400g)",
        "Customized thank you card",
        "Corporate color-themed packaging",
        "Bulk order discounts available",
      ],
      imageSrc: "/corporate-indian-sweets-gift.png",
    },
    {
      title: "Festival Special",
      price: "Starting at ₹10,000",
      description: "Elaborate festival-themed gift packages for Diwali, New Year and other occasions.",
      features: [
        "Traditional festival-themed packaging",
        "Premium sweets assortment (1kg)",
        "Dry fruits and nuts selection (500g)",
        "Decorative diyas or festival items",
        "Custom corporate message",
      ],
      imageSrc: "/diwali-gift-hamper.png",
    },
  ]

  // Sample testimonials data
  const testimonials = [
    {
      quote:
        "Ramesh Sweets provided exceptional corporate gift packages for our Diwali celebrations. The quality of sweets and presentation was outstanding, and our clients were thoroughly impressed.",
      author: "Rajiv Mehta",
      company: "TechSolutions India Ltd.",
    },
    {
      quote:
        "We've been ordering our corporate gifts from Ramesh Sweets for three years now. Their attention to detail and willingness to customize packages to our needs sets them apart.",
      author: "Priya Sharma",
      company: "Global Finance Corp.",
    },
    {
      quote:
        "The festival hampers we ordered were delivered on time and exceeded our expectations in terms of quality and presentation. Our employees were delighted with the thoughtful gifts.",
      author: "Vikram Singh",
      company: "Horizon Innovations",
    },
  ]

  // Sample FAQ data
  const faqs = [
    {
      question: "What is the minimum order quantity for corporate gifts?",
      answer:
        "Our minimum order quantity for corporate gifts is 10 packages. However, for larger quantities of 50 or more, we offer special pricing and additional customization options.",
    },
    {
      question: "Can we include our company logo on the gift packaging?",
      answer:
        "Yes, we offer various branding options including your company logo on gift boxes, custom ribbon printing, personalized message cards, and even custom-colored packaging to match your brand colors.",
    },
    {
      question: "How far in advance should we place our order?",
      answer:
        "For standard corporate gift packages, we recommend placing your order at least 2 weeks in advance. For custom packages or large orders (100+ units), please allow 3-4 weeks for preparation.",
    },
    {
      question: "Do you offer delivery services for corporate orders?",
      answer:
        "Yes, we provide delivery services across India for corporate orders. For bulk deliveries to multiple locations, we can arrange special logistics solutions to ensure timely delivery.",
    },
    {
      question: "What payment options are available for corporate clients?",
      answer:
        "We offer various payment options for our corporate clients including bank transfer, corporate credit cards, and for established clients, we can arrange for payment terms with proper documentation.",
    },
  ]

  // Benefits data
  const benefits = [
    {
      icon: <Gift className="h-8 w-8 text-gold" />,
      title: "Premium Quality",
      description:
        "Handcrafted sweets made with finest ingredients that reflect your company's commitment to excellence.",
    },
    {
      icon: <Package className="h-8 w-8 text-gold" />,
      title: "Custom Packaging",
      description: "Elegant packaging options with your corporate branding to create a lasting impression.",
    },
    {
      icon: <Users className="h-8 w-8 text-gold" />,
      title: "Relationship Building",
      description: "Strengthen business relationships with thoughtful, premium gifts that show your appreciation.",
    },
    {
      icon: <Award className="h-8 w-8 text-gold" />,
      title: "Cultural Relevance",
      description: "Traditional sweets that respect Indian culture and customs for appropriate corporate gifting.",
    },
  ]

  return (
    <div className="bg-[#fff9fb] min-h-screen">
      {/* Page Header */}
      <CollectionHeader
        title="Corporate Gifting Solutions"
        subtitle="Elevate your corporate relationships with premium sweet collections"
      />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-pattern-background-with-golden-details_1017-30805.jpg')] opacity-5"></div>

        {/* Large Decorative Corners */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/30 rounded-tl-sm"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/30 rounded-tr-sm"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/30 rounded-bl-sm"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/30 rounded-br-sm"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="inline-block mb-4 px-4 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <p className="text-gold-dark font-medium text-sm tracking-wider">PREMIUM CORPORATE GIFTS</p>
              </div>

              <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Exquisite Gifts for <br />
                <span className="text-gold-dark">Corporate Excellence</span>
              </h1>

              <p className="font-eb-garamond text-lg md:text-xl mb-8 text-gray-700 max-w-xl">
                Elevate your corporate relationships with our premium sweet collections, thoughtfully crafted and
                elegantly presented to reflect your company's commitment to excellence and appreciation.
              </p>

              <div className="flex flex-wrap gap-4">
                <UniversalButton
                  as="a"
                  href="#packages"
                  variant="primary"
                  className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
                >
                  EXPLORE PACKAGES
                </UniversalButton>

                <UniversalButton
                  as="a"
                  href="#contact"
                  variant="secondary"
                  className="border-gold text-gold hover:bg-gold/10 px-8 py-3 text-base"
                >
                  REQUEST QUOTE
                </UniversalButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Decorative frame */}
                <div className="absolute inset-0 border-2 border-gold"></div>
                <div className="absolute inset-[8px] border border-gold/30"></div>

                {/* Corners */}
                <div className="absolute top-[-4px] left-[-4px] w-12 h-12 border-t-2 border-l-2 border-gold"></div>
                <div className="absolute top-[-4px] right-[-4px] w-12 h-12 border-t-2 border-r-2 border-gold"></div>
                <div className="absolute bottom-[-4px] left-[-4px] w-12 h-12 border-b-2 border-l-2 border-gold"></div>
                <div className="absolute bottom-[-4px] right-[-4px] w-12 h-12 border-b-2 border-r-2 border-gold"></div>

                {/* Image */}
                <img
                  src="/premium-corporate-gift-box.png"
                  alt="Premium Corporate Gift Box"
                  className="w-full h-full object-cover"
                />

                {/* Floating decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-lighter rounded-full opacity-50 mix-blend-multiply"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gold/10 rounded-full opacity-50 mix-blend-multiply"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-pattern-background_23-2148431731.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4">
          <HeritageSectionHeader
            title="Why Choose Our Corporate Gifts"
            subtitle="Discover the advantages of our premium corporate gifting solutions"
            preTitle="BENEFITS"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative p-6 bg-white border border-gold/20 rounded-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                </div>

                <div className="pt-10 text-center">
                  <h3 className="font-cinzel text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="font-eb-garamond text-gray-700">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Packages Section */}
      <section id="packages" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-pink-lighter/30"></div>
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-background-with-shiny-lines_1017-17580.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <HeritageSectionHeader
            title="Corporate Gift Collections"
            subtitle="Explore our premium gift packages designed for corporate excellence"
            preTitle="LUXURY PACKAGES"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />

          <div className="relative p-8 border border-gold/20 bg-white/80 backdrop-blur-sm shadow-lg">
            {/* Luxury Corners for Grid Container */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/40"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold/40"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/40"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/40"></div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {giftPackages.map((pkg, index) => (
                <GiftPackageCard key={index} {...pkg} index={index} />
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <p className="font-eb-garamond text-lg italic mb-6">
              Looking for something more specific? We offer fully customized corporate gift solutions.
            </p>
            <UniversalButton
              as="a"
              href="#contact"
              variant="primary"
              className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
            >
              REQUEST CUSTOM PACKAGE
            </UniversalButton>
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-background-with-shiny-lines_1017-17580.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden shadow-xl">
                {/* Decorative frame */}
                <div className="absolute inset-0 border-2 border-gold"></div>
                <div className="absolute inset-[8px] border border-gold/30"></div>

                {/* Image */}
                <img
                  src="/customized-indian-sweets-gift-box.png"
                  alt="Customized Corporate Gifts"
                  className="w-full h-full object-cover"
                />

                {/* Floating decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gold/10 rounded-full opacity-50 mix-blend-multiply"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block mb-4 px-4 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <p className="text-gold-dark font-medium text-sm tracking-wider">PERSONALIZATION OPTIONS</p>
              </div>

              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">
                Tailored to Your <br />
                <span className="text-gold-dark">Corporate Identity</span>
              </h2>

              <p className="font-eb-garamond text-lg mb-6 text-gray-700">
                We understand that each company has unique requirements. Our corporate gifts can be fully customized to
                align with your brand identity and specific needs.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold mr-4">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold mb-1">Custom Branding</h3>
                    <p className="font-eb-garamond text-gray-700">
                      Add your company logo and colors to gift boxes and packaging materials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold mr-4">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold mb-1">Personalized Selection</h3>
                    <p className="font-eb-garamond text-gray-700">
                      Curate specific sweet varieties and quantities based on your preferences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold mr-4">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold mb-1">Custom Messaging</h3>
                    <p className="font-eb-garamond text-gray-700">
                      Include personalized messages or greeting cards with your corporate branding.
                    </p>
                  </div>
                </div>
              </div>

              <UniversalButton
                as="a"
                href="#contact"
                variant="primary"
                className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
              >
                DISCUSS CUSTOMIZATION
              </UniversalButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5"></div>
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-pattern-background-with-golden-details_1017-30805.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <HeritageSectionHeader
            title="Client Testimonials"
            subtitle="What our corporate clients say about our gifting solutions"
            preTitle="TESTIMONIALS"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Enhanced Request a Quote */}
      <section id="contact" className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-pattern-background_23-2148431731.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4">
          <HeritageSectionHeader
            title="Request a Quote"
            subtitle="Get in touch with our corporate gifting specialists"
            preTitle="CONTACT US"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Luxury Corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/40"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/40"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/40"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/40"></div>

              <div className="bg-[#fff9fb] p-8 border border-gold/20 shadow-lg relative z-10">
                {/* Form Steps Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between max-w-md mx-auto">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 
                            ${currentStep >= step ? "bg-gold text-white" : "bg-gray-100 text-gray-400 border border-gold/20"}`}
                        >
                          {step}
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          {step === 1 ? "Company Info" : step === 2 ? "Gift Details" : "Finalize"}
                        </div>
                      </div>
                    ))}

                    {/* Connecting lines */}
                    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gray-200 -z-10"></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Company Information */}
                  <FormStep step={1} currentStep={currentStep}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Building className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Company Name*</label>
                        </div>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Your company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Users className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Contact Person*</label>
                        </div>
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Mail className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Email Address*</label>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Phone className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Phone Number*</label>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <UniversalButton
                        type="button"
                        onClick={nextStep}
                        variant="primary"
                        className="bg-gold hover:bg-gold-dark text-white font-cinzel py-3 px-8 rounded-sm"
                      >
                        Next Step
                      </UniversalButton>
                    </div>
                  </FormStep>

                  {/* Step 2: Gift Details */}
                  <FormStep step={2} currentStep={currentStep}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Gift className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Gift Package Interest*</label>
                        </div>
                        <select
                          name="packageType"
                          value={formData.packageType}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                        >
                          <option value="">Select a package</option>
                          <option value="executive">Executive Collection</option>
                          <option value="celebration">Celebration Hamper</option>
                          <option value="client">Client Appreciation Box</option>
                          <option value="festival">Festival Special</option>
                          <option value="custom">Custom Package</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Package className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Quantity Required*</label>
                        </div>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                          min="10"
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Estimated quantity"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <CreditCard className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Budget Range</label>
                        </div>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                        >
                          <option value="">Select Budget Range</option>
                          <option value="Under ₹50,000">Under ₹50,000</option>
                          <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                          <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000</option>
                          <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Required Delivery Date</label>
                        </div>
                        <input
                          type="date"
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center mb-1">
                          <FileText className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Additional Requirements*</label>
                        </div>
                        <textarea
                          name="requirements"
                          value={formData.requirements}
                          onChange={handleInputChange}
                          required
                          rows="4"
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Tell us about any specific requirements or customizations needed"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <UniversalButton
                        type="button"
                        onClick={prevStep}
                        variant="secondary"
                        className="border-gold text-gold hover:bg-gold/10 font-cinzel py-3 px-8 rounded-sm"
                      >
                        Previous
                      </UniversalButton>
                      <UniversalButton
                        type="button"
                        onClick={nextStep}
                        variant="primary"
                        className="bg-gold hover:bg-gold-dark text-white font-cinzel py-3 px-8 rounded-sm"
                      >
                        Next Step
                      </UniversalButton>
                    </div>
                  </FormStep>

                  {/* Step 3: Finalize */}
                  <FormStep step={3} currentStep={currentStep}>
                    <div className="space-y-6">
                      <div className="bg-gold/5 p-6 border border-gold/20 rounded-sm">
                        <h3 className="font-cinzel text-xl font-bold mb-4">Additional Options</h3>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="customization"
                              name="customization"
                              checked={formData.customization}
                              onChange={handleInputChange}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <label htmlFor="customization" className="font-cinzel font-medium">
                                Custom Packaging
                              </label>
                              <p className="text-sm text-gray-600 font-eb-garamond">
                                I'm interested in custom packaging options for my corporate gifts
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="branding"
                              name="branding"
                              checked={formData.branding}
                              onChange={handleInputChange}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <label htmlFor="branding" className="font-cinzel font-medium">
                                Corporate Branding
                              </label>
                              <p className="text-sm text-gray-600 font-eb-garamond">
                                I would like to include my company logo on the gift packaging
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center mb-1">
                          <FileText className="w-4 h-4 text-gold mr-2" />
                          <label className="block font-cinzel text-sm font-medium">Special Instructions</label>
                        </div>
                        <textarea
                          name="specialInstructions"
                          value={formData.specialInstructions}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-3 border border-gold/30 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/30 bg-white/80"
                          placeholder="Any additional information or special instructions"
                        ></textarea>
                      </div>

                      <div className="bg-white p-6 border border-gold/20 rounded-sm">
                        <h3 className="font-cinzel text-xl font-bold mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-gold mr-2" />
                          What Happens Next?
                        </h3>

                        <ol className="space-y-3 list-decimal list-inside text-gray-700 font-eb-garamond">
                          <li>Our corporate team will review your inquiry within 24 hours</li>
                          <li>We'll prepare a detailed quote based on your requirements</li>
                          <li>A dedicated account manager will contact you to discuss your needs</li>
                          <li>Upon approval, we'll begin preparing your custom corporate gifts</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <UniversalButton
                        type="button"
                        onClick={prevStep}
                        variant="secondary"
                        className="border-gold text-gold hover:bg-gold/10 font-cinzel py-3 px-8 rounded-sm"
                      >
                        Previous
                      </UniversalButton>
                      <UniversalButton
                        type="submit"
                        variant="primary"
                        className="bg-gold hover:bg-gold-dark text-white font-cinzel py-3 px-8 rounded-sm"
                      >
                        Submit Inquiry
                      </UniversalButton>
                    </div>
                  </FormStep>
                </form>
              </div>
            </div>

            {/* Contact Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="border-gold/20 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2">
                    <Phone className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-cinzel text-lg">Call Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-eb-garamond text-gray-700">Corporate Sales Team</p>
                  <p className="font-medium text-lg">+91 98765 43210</p>
                  <p className="text-sm text-gray-500 mt-2">Monday - Saturday: 9AM - 6PM</p>
                </CardContent>
              </Card>

              <Card className="border-gold/20 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-cinzel text-lg">Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-eb-garamond text-gray-700">Corporate Inquiries</p>
                  <p className="font-medium text-lg">corporate@rameshsweets.com</p>
                  <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-gold/20 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2">
                    <Truck className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-cinzel text-lg">Bulk Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-eb-garamond text-gray-700">Special Discounts</p>
                  <ul className="text-sm text-gray-700 space-y-1 mt-2">
                    <li>• 50-99 units: 5% discount</li>
                    <li>• 100-499 units: 10% discount</li>
                    <li>• 500+ units: 15% discount</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-pink-lighter/30"></div>
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-background-with-shiny-lines_1017-17580.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <HeritageSectionHeader
            title="Frequently Asked Questions"
            subtitle="Common questions about our corporate gifting services"
            preTitle="FAQs"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />

          <div className="max-w-3xl mx-auto bg-white p-8 border border-gold/20 shadow-lg">
            {/* Luxury Corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/40"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold/40"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/40"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/40"></div>

            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <FAQItem key={index} {...faq} index={index} />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="font-eb-garamond text-lg italic mb-6">
              Have more questions? Our corporate team is here to help.
            </p>
            <UniversalButton
              as="a"
              href="#contact"
              variant="primary"
              className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
            >
              CONTACT US
            </UniversalButton>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/elegant-white-pattern-background_23-2148431731.jpg')] opacity-5"></div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-6">
              Ready to Elevate Your Corporate Gifting?
            </h2>

            <p className="font-eb-garamond text-lg mb-8 text-gray-700 max-w-2xl mx-auto">
              Partner with Ramesh Sweets for premium corporate gift solutions that reflect your company's values and
              strengthen your business relationships.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <UniversalButton
                as="a"
                href="#packages"
                variant="primary"
                className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
              >
                EXPLORE PACKAGES
              </UniversalButton>

              <UniversalButton
                as="a"
                href="#contact"
                variant="secondary"
                className="border-gold text-gold hover:bg-gold/10 px-8 py-3 text-base"
              >
                REQUEST QUOTE
              </UniversalButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
