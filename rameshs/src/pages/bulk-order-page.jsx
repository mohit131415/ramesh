"use client"

import { useState, useEffect } from "react"
import { UniversalButton } from "../components/ui/universal-button"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { cn } from "../lib/utils"
import { formatPrice } from "../lib/utils"
import SectionHeader from "../components/common/section-header"

export default function BulkOrderPage() {
  const [quantity, setQuantity] = useState(50)
  const [selectedProduct, setSelectedProduct] = useState("assorted-sweets")
  const [customPackaging, setCustomPackaging ]= useState(false)
  const [expressDelivery, setExpressDelivery] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [activeTab, setActiveTab] = useState("calculator")

  const products = [
    { id: "assorted-sweets", name: "Assorted Sweets", basePrice: 250 },
    { id: "kaju-katli", name: "Kaju Katli", basePrice: 300 },
    { id: "soan-papdi", name: "Soan Papdi", basePrice: 200 },
    { id: "gulab-jamun", name: "Gulab Jamun", basePrice: 220 },
    { id: "rasgulla", name: "Rasgulla", basePrice: 240 },
    { id: "motichoor-ladoo", name: "Motichoor Ladoo", basePrice: 260 },
  ]

  const bulkPackages = [
    {
      id: "standard",
      name: "Standard Bulk Package",
      description: "Perfect for medium-sized events and gatherings",
      quantity: "100-250 boxes",
      price: "From ₹20,000",
      features: ["Assorted sweets selection", "Standard packaging", "Delivery within 5-7 days", "5% bulk discount"],
      image: "/bulk-standard-package.png",
    },
    {
      id: "premium",
      name: "Premium Bulk Package",
      description: "Ideal for large corporate events and weddings",
      quantity: "250-500 boxes",
      price: "From ₹50,000",
      features: [
        "Premium sweets selection",
        "Elegant packaging",
        "Delivery within 3-5 days",
        "10% bulk discount",
        "Dedicated account manager",
      ],
      image: "/bulk-premium-package.png",
    },
    {
      id: "deluxe",
      name: "Deluxe Bulk Package",
      description: "Our finest offering for prestigious events",
      quantity: "500+ boxes",
      price: "From ₹100,000",
      features: [
        "Luxury sweets selection",
        "Custom branded packaging",
        "Priority delivery within 2-3 days",
        "15% bulk discount",
        "Dedicated account manager",
        "Complimentary tasting session",
      ],
      image: "/bulk-deluxe-package.png",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Consultation",
      description: "Discuss your requirements with our bulk order specialists",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      number: 2,
      title: "Customization",
      description: "Select products, packaging, and branding options",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      ),
    },
    {
      number: 3,
      title: "Quotation",
      description: "Receive a detailed quote with applicable discounts",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M7 15h0"></path>
          <path d="M12 15h0"></path>
          <path d="M17 15h0"></path>
          <path d="M7 9h10"></path>
        </svg>
      ),
    },
    {
      number: 4,
      title: "Confirmation",
      description: "Approve the quote and make the initial payment",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
    {
      number: 5,
      title: "Production",
      description: "Your order is prepared with care and quality checks",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
    },
    {
      number: 6,
      title: "Delivery",
      description: "Receive your bulk order at your specified location",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
      ),
    },
  ]

  const faqs = [
    {
      question: "What is the minimum quantity for bulk orders?",
      answer:
        "Our bulk orders start at a minimum of 50 boxes. For quantities less than 50, please check our regular product pages.",
    },
    {
      question: "How far in advance should I place my bulk order?",
      answer:
        "We recommend placing bulk orders at least 2 weeks in advance to ensure timely production and delivery. For urgent orders, please contact us directly.",
    },
    {
      question: "Can I customize the packaging for bulk orders?",
      answer:
        "Yes, we offer custom packaging options for bulk orders. This includes branded boxes, custom labels, and personalized messages.",
    },
    {
      question: "Do you offer discounts for bulk orders?",
      answer:
        "Yes, we offer tiered discounts based on order quantity: 5% for 50-100 boxes, 10% for 101-250 boxes, and 15% for orders above 250 boxes.",
    },
    {
      question: "Can I get samples before placing a bulk order?",
      answer:
        "Yes, we offer sample boxes for bulk order clients. Please contact our sales team to arrange a tasting session.",
    },
  ]

  const testimonials = [
    {
      name: "Rajesh Mehta",
      company: "Mehta Enterprises",
      quote:
        "We ordered 300 boxes for our company's Diwali celebration. The quality was exceptional, and the custom packaging with our logo made a great impression on our clients.",
      image: "/bulk-testimonial-1.png",
    },
    {
      name: "Priya Sharma",
      company: "Grand Celebrations",
      quote:
        "As an event planner, I've worked with many sweet suppliers, but Ramesh Sweets stands out for their reliability and quality. Their bulk order process is seamless.",
      image: "/bulk-testimonial-2.png",
    },
    {
      name: "Vikram Singh",
      company: "Hotel Grandeur",
      quote:
        "We place monthly bulk orders for our hotel's gift shop. The consistent quality and flexible delivery options make Ramesh Sweets our preferred partner.",
      image: "/bulk-testimonial-3.png",
    },
  ]

  // Calculate total price
  useEffect(() => {
    const selectedProductData = products.find((p) => p.id === selectedProduct)
    let price = selectedProductData.basePrice * quantity

    // Add custom packaging cost
    if (customPackaging) {
      price += quantity * 50 // ₹50 per box for custom packaging
    }

    // Add express delivery cost
    if (expressDelivery) {
      price += 2000 // Flat ₹2000 for express delivery
    }

    // Apply bulk discounts
    let discount = 0
    if (quantity >= 250) {
      discount = price * 0.15 // 15% discount
      setDiscountApplied(true)
      setDiscountAmount(discount)
    } else if (quantity >= 100) {
      discount = price * 0.1 // 10% discount
      setDiscountApplied(true)
      setDiscountAmount(discount)
    } else if (quantity >= 50) {
      discount = price * 0.05 // 5% discount
      setDiscountApplied(true)
      setDiscountAmount(discount)
    } else {
      setDiscountApplied(false)
      setDiscountAmount(0)
    }

    setTotalPrice(price - discount)
  }, [quantity, selectedProduct, customPackaging, expressDelivery])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-[#fffafc]">
        <div className="absolute inset-0 bg-pattern opacity-10 z-0"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <div className="relative">
                <span className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-gold"></span>
                <span className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-gold"></span>

                <h1 className="text-4xl md:text-6xl font-cinzel font-bold mb-4 leading-tight">
                  Luxury <span className="text-gold">Bulk Orders</span> for Special Occasions
                </h1>

                <div className="w-20 h-1 bg-gold mb-6"></div>

                <p className="text-lg mb-8 leading-relaxed">
                  Elevate your events with our premium sweets in bulk. Perfect for corporate celebrations, weddings, and
                  grand festivities. Enjoy exclusive discounts and bespoke customization options.
                </p>

                <div className="flex flex-wrap gap-4">
                  <UniversalButton variant="gold" size="lg" className="shadow-lg hover:shadow-xl transition-all">
                    Start Your Order
                  </UniversalButton>

                  <UniversalButton variant="outline" size="lg" className="border-gold text-gold hover:bg-gold/10">
                    View Packages
                  </UniversalButton>
                </div>

                <div className="mt-8 flex items-center gap-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-gold"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <span className="ml-2 text-sm">Premium Quality</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-gold"
                      >
                        <path d="M12 2v20"></path>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <span className="ml-2 text-sm">Bulk Discounts</span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-gold"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <span className="ml-2 text-sm">Pan India Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/bulk-order-hero-premium.png"
                  alt="Luxury bulk order sweets arrangement"
                  className="w-full rounded-lg"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cinzel font-bold text-lg">Exclusive Offer</p>
                      <p className="text-gold font-semibold">Up to 15% Off Bulk Orders</p>
                    </div>
                    <div className="bg-gold text-white px-3 py-1 rounded-full text-sm font-bold">Limited Time</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border-2 border-dashed border-gold/30 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 border-2 border-dashed border-gold/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs for Calculator and Packages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-cream/50 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === "calculator"
                    ? "bg-gradient-to-r from-gold to-amber-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-cream"
                }`}
              >
                Bulk Order Calculator
              </button>
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === "packages"
                    ? "bg-gradient-to-r from-gold to-amber-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-cream"
                }`}
              >
                Curated Packages
              </button>
            </div>
          </div>

          {activeTab === "calculator" && (
            <div className="max-w-5xl mx-auto">
              <SectionHeader
                title="Personalized Bulk Order Calculator"
                subtitle="Create your custom bulk order and get an instant estimate"
                centered
              />

              <div className="mt-12 bg-gradient-to-br from-gold/20 to-cream p-1 rounded-xl shadow-xl">
                <div className="bg-white p-8 rounded-xl relative overflow-hidden">
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/20 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/20 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/20 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/20 rounded-br-lg"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-cinzel font-bold text-gray-800 relative inline-block">
                        Order Details
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"></span>
                      </h3>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="product" className="text-sm font-medium">
                            Select Product
                          </Label>
                          <select
                            id="product"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
                          >
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} (₹{product.basePrice}/box)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-sm font-medium">
                            Quantity (Boxes)
                          </Label>
                          <div className="relative">
                            <Input
                              id="quantity"
                              type="number"
                              min="10"
                              value={quantity}
                              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                              className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">boxes</span>
                          </div>
                          <p className="text-sm text-gray-500 italic">Minimum 50 boxes for bulk order</p>
                        </div>

                        <div className="p-4 bg-cream/30 rounded-lg border border-gold/10">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="custom-packaging"
                              checked={customPackaging}
                              onCheckedChange={setCustomPackaging}
                              className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="custom-packaging" className="font-medium">
                                Custom Packaging (+₹50/box)
                              </Label>
                              <p className="text-sm text-gray-500">Includes branded boxes and custom labels</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream/30 rounded-lg border border-gold/10">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="express-delivery"
                              checked={expressDelivery}
                              onCheckedChange={setExpressDelivery}
                              className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="express-delivery" className="font-medium">
                                Express Delivery (+₹2,000)
                              </Label>
                              <p className="text-sm text-gray-500">Guaranteed delivery within 48 hours</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-cream/30 p-6 rounded-xl border border-gold/10 shadow-sm">
                      <h3 className="text-2xl font-cinzel font-bold text-gray-800 mb-6 relative inline-block">
                        Order Summary
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"></span>
                      </h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-gray-600">Product:</span>
                          <span className="font-medium">{products.find((p) => p.id === selectedProduct)?.name}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{quantity} boxes</span>
                        </div>

                        {customPackaging && (
                          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <span className="text-gray-600">Custom Packaging:</span>
                            <span className="font-medium">₹{(quantity * 50).toLocaleString()}</span>
                          </div>
                        )}

                        {expressDelivery && (
                          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <span className="text-gray-600">Express Delivery:</span>
                            <span className="font-medium">₹2,000</span>
                          </div>
                        )}

                        {discountApplied && (
                          <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-green-600">
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 mr-1"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Bulk Discount:
                            </span>
                            <span className="font-medium">-₹{discountAmount.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="pt-4 flex justify-between items-center">
                          <span className="text-lg font-bold">Total Estimate:</span>
                          <span className="text-xl font-bold text-gold">{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm text-gray-500 italic">
                          Final price may vary based on specific customizations and delivery location.
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <UniversalButton
                          variant="gold"
                          className="w-full py-3 text-base shadow-md hover:shadow-lg transition-all"
                        >
                          Request Detailed Quote
                        </UniversalButton>

                        <p className="text-center text-sm text-gray-500">
                          Our team will contact you within 24 hours with a detailed quotation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "packages" && (
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                title="Curated Bulk Order Packages"
                subtitle="Choose from our expertly designed packages for different occasions"
                centered
              />

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {bulkPackages.map((pkg, index) => (
                  <div key={pkg.id} className="group relative">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br",
                        pkg.id === "standard"
                          ? "from-gold/50 to-gold/20"
                          : pkg.id === "premium"
                            ? "from-gold/80 to-gold/30"
                            : "from-gold/60 to-gold/20",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                      )}
                    ></div>

                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl border border-gray-100 group-hover:border-transparent h-full flex flex-col">
                      {pkg.id === "premium" && (
                        <div className="bg-gradient-to-r from-gold to-amber-600 text-white text-center py-2 font-medium">
                          Most Popular
                        </div>
                      )}

                      <div className="relative">
                        <img
                          src={pkg.image || "/placeholder.svg"}
                          alt={pkg.name}
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gold/10">
                          <p className="font-cinzel font-bold">{pkg.quantity}</p>
                          <p className="font-bold text-gold">{pkg.price}</p>
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-cinzel font-bold mb-2">{pkg.name}</h3>
                        <p className="text-gray-600 mb-4">{pkg.description}</p>

                        <ul className="space-y-2 mb-6 flex-grow">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <svg
                                className="w-5 h-5 text-gold mr-2 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <UniversalButton
                          variant={pkg.id === "premium" ? "gold" : "outline"}
                          className={pkg.id !== "premium" ? "border-gold text-gold hover:bg-gold/10" : ""}
                        >
                          Select Package
                        </UniversalButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-[#fffafc]">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Luxury Bulk Order Process"
            subtitle="A seamless journey from consultation to delivery"
            centered
          />

          <div className="mt-16 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/30 via-gold/50 to-gold/30 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-gold/10 h-full transform transition-transform hover:-translate-y-2 duration-300">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-md border border-gold/20 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-cinzel font-bold mb-3">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="What Our Luxury Clients Say"
            subtitle="Trusted by prestigious businesses and event planners"
            centered
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-cream/30 p-1 rounded-xl shadow-lg">
                <div className="bg-white p-6 rounded-xl h-full flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="relative mr-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-amber-600 blur-[1px]"></div>
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white relative z-10"
                      />
                    </div>
                    <div>
                      <h3 className="font-cinzel font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="text-gold mb-2">
                      <span className="text-2xl">"</span>
                    </div>
                    <p className="italic text-gray-700 mb-4">{testimonial.quote}</p>
                    <div className="text-gold text-right">
                      <span className="text-2xl">"</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-gold"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#fffafc]">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our luxury bulk orders"
            centered
          />

          <div className="max-w-3xl mx-auto mt-16">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border border-gold/10 transition-all duration-300 hover:shadow-lg hover:border-gold/20"
                >
                  <h3 className="text-lg font-cinzel font-bold mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-sm mr-3">
                      Q
                    </span>
                    {faq.question}
                  </h3>
                  <div className="pl-11">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-[#fffafc] to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gold/10">
            <SectionHeader
              title="Request a Luxury Bulk Order Consultation"
              subtitle="Our dedicated team will help you create the perfect bulk order experience"
              centered
            />

            <form className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company/Organization
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="event-type" className="text-sm font-medium">
                  Event Type
                </Label>
                <select
                  id="event-type"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                >
                  <option value="">Select event type</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="wedding">Wedding</option>
                  <option value="festival">Festival Celebration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Additional Requirements
                </Label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                  placeholder="Tell us about your event and requirements"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-center mt-4">
                <UniversalButton variant="gold" size="lg" className="px-12 shadow-lg hover:shadow-xl transition-all">
                  Submit Luxury Consultation Request
                </UniversalButton>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
