"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Gift, Package, Sparkles, Star, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button } from "../components/ui/button"
import { HeritageCornerDecoration } from "../components/ui/heritage-decorations"
import { cn } from "../lib/utils"

// Hamper categories
const hamperCategories = [
  {
    id: "premium",
    name: "Premium Hampers",
    description: "Luxurious gift hampers featuring our finest sweets and dry fruits in elegant packaging.",
    image: "/premium-gift-hamper.png",
  },
  {
    id: "occasion",
    name: "Occasion Hampers",
    description: "Specially curated hampers for birthdays, anniversaries, and other special moments.",
    image: "/occasion-gift-hamper.png",
  },
  {
    id: "festival",
    name: "Festival Hampers",
    description: "Celebrate festivals with our specially designed festive hampers.",
    image: "/festival-gift-hamper.png",
  },
  {
    id: "corporate",
    name: "Corporate Hampers",
    description: "Impress clients and colleagues with our professional corporate gift hampers.",
    image: "/corporate-gift-hamper.png",
  },
]

// Hamper products
const hamperProducts = [
  {
    id: 1,
    category: "premium",
    name: "Royal Indulgence Hamper",
    price: "₹4,999",
    image: "/royal-indulgence-hamper.png",
    description:
      "Our most luxurious hamper featuring premium sweets, dry fruits, and exotic nuts in a handcrafted wooden box.",
    contents: [
      "Kaju Katli (500g)",
      "Kesar Peda (500g)",
      "Assorted Barfi (500g)",
      "Premium Mixed Dry Fruits (500g)",
      "Soan Papdi (500g)",
      "Handcrafted Wooden Box",
    ],
  },
  {
    id: 2,
    category: "premium",
    name: "Maharaja Collection",
    price: "₹3,499",
    image: "/maharaja-collection.png",
    description: "A regal collection of traditional sweets and savories in an elegant gift box.",
    contents: [
      "Motichoor Ladoo (500g)",
      "Besan Ladoo (500g)",
      "Kaju Katli (500g)",
      "Namkeen Mix (300g)",
      "Mathri (300g)",
      "Premium Gift Box",
    ],
  },
  {
    id: 3,
    category: "premium",
    name: "Signature Sweet Box",
    price: "₹2,999",
    image: "/signature-sweet-box.png",
    description: "Our signature collection featuring a handpicked selection of our most popular sweets.",
    contents: [
      "Kaju Katli (300g)",
      "Milk Cake (300g)",
      "Gulab Jamun (500g)",
      "Rasgulla (500g)",
      "Soan Papdi (300g)",
      "Luxury Gift Box",
    ],
  },
  {
    id: 4,
    category: "occasion",
    name: "Birthday Celebration Hamper",
    price: "₹2,499",
    image: "/birthday-celebration-hamper.png",
    description: "Make birthdays special with this celebratory hamper of sweets and treats.",
    contents: [
      "Assorted Barfi (500g)",
      "Chocolate Modak (300g)",
      "Dry Fruit Mix (300g)",
      "Birthday Card",
      "Decorative Candles",
      "Celebration Gift Box",
    ],
  },
  {
    id: 5,
    category: "occasion",
    name: "Anniversary Special Box",
    price: "₹3,299",
    image: "/anniversary-special-box.png",
    description: "Celebrate years of togetherness with this romantic hamper of sweets and gifts.",
    contents: [
      "Heart-shaped Kaju Katli (300g)",
      "Rose Peda (300g)",
      "Chocolate Barfi (300g)",
      "Dry Fruits (300g)",
      "Scented Candle",
      "Elegant Gift Box",
    ],
  },
  {
    id: 6,
    category: "occasion",
    name: "Congratulations Hamper",
    price: "₹1,999",
    image: "/congratulations-hamper.png",
    description: "Perfect for celebrating achievements and milestones.",
    contents: [
      "Assorted Sweets (500g)",
      "Namkeen Mix (300g)",
      "Chocolate Barfi (300g)",
      "Congratulations Card",
      "Festive Gift Box",
    ],
  },
  {
    id: 7,
    category: "festival",
    name: "Diwali Deluxe Hamper",
    price: "₹3,999",
    image: "/diwali-deluxe-hamper.png",
    description: "Celebrate the festival of lights with this luxurious hamper of sweets and gifts.",
    contents: [
      "Assorted Sweets (1kg)",
      "Dry Fruits (500g)",
      "Namkeen Mix (500g)",
      "Decorative Diyas",
      "Scented Candles",
      "Premium Diwali Gift Box",
    ],
  },
  {
    id: 8,
    category: "festival",
    name: "Holi Celebration Box",
    price: "₹2,499",
    image: "/holi-celebration-box.png",
    description: "Add sweetness to the festival of colors with this vibrant hamper.",
    contents: [
      "Gujiya (500g)",
      "Mathri (300g)",
      "Thandai Mix (250g)",
      "Assorted Sweets (500g)",
      "Organic Colors",
      "Festive Gift Box",
    ],
  },
  {
    id: 9,
    category: "festival",
    name: "Rakhi Special Hamper",
    price: "₹1,999",
    image: "/rakhi-special-hamper.png",
    description: "Express your love for your siblings with this special Rakhi hamper.",
    contents: [
      "Assorted Sweets (500g)",
      "Dry Fruits (300g)",
      "Designer Rakhi",
      "Roli Chawal",
      "Gift Card",
      "Decorative Gift Box",
    ],
  },
  {
    id: 10,
    category: "corporate",
    name: "Executive Gift Hamper",
    price: "₹5,999",
    image: "/executive-gift-hamper.png",
    description: "Impress your clients and business partners with this premium corporate gift hamper.",
    contents: [
      "Premium Assorted Sweets (1kg)",
      "Exotic Dry Fruits (500g)",
      "Gourmet Chocolates (300g)",
      "Premium Tea/Coffee",
      "Corporate Branded Packaging",
    ],
  },
  {
    id: 11,
    category: "corporate",
    name: "Business Associate Hamper",
    price: "₹3,499",
    image: "/business-associate-hamper.png",
    description: "Perfect for strengthening business relationships and expressing gratitude.",
    contents: [
      "Assorted Sweets (750g)",
      "Dry Fruits (300g)",
      "Namkeen Mix (300g)",
      "Premium Tea",
      "Corporate Gift Box",
    ],
  },
  {
    id: 12,
    category: "corporate",
    name: "Employee Appreciation Box",
    price: "₹1,999",
    image: "/employee-appreciation-box.png",
    description: "Show your appreciation to your team with this thoughtful gift hamper.",
    contents: [
      "Assorted Sweets (500g)",
      "Namkeen Mix (300g)",
      "Chocolate Barfi (300g)",
      "Thank You Card",
      "Corporate Gift Box",
    ],
  },
]

// FAQ data
const faqs = [
  {
    question: "How do I customize a gift hamper?",
    answer:
      "You can customize your gift hamper by contacting our customer service team. We offer options to select specific sweets, add personalized messages, choose custom packaging, and include additional gifts based on your preferences and budget.",
  },
  {
    question: "What is the shelf life of your gift hampers?",
    answer:
      "The shelf life varies depending on the contents. Most of our sweets stay fresh for 7-10 days when stored in a cool, dry place. Dry fruits and packaged items have a longer shelf life. Each hamper comes with specific storage instructions and best-before dates.",
  },
  {
    question: "Do you offer same-day delivery for gift hampers?",
    answer:
      "Yes, we offer same-day delivery for orders placed before 12 PM within city limits. For customized hampers, we require at least 24-48 hours notice. During peak festival seasons, we recommend placing your orders at least 3-5 days in advance to ensure timely delivery.",
  },
  {
    question: "Can I send gift hampers internationally?",
    answer:
      "Yes, we offer international shipping for most of our gift hampers. Please note that international orders require additional processing time and shipping costs. Some items may be restricted for international shipping due to customs regulations. Please contact our customer service for specific details about your destination.",
  },
  {
    question: "Do you offer corporate discounts for bulk hamper orders?",
    answer:
      "Yes, we offer special corporate discounts for bulk orders. The discount percentage varies based on the order quantity and total value. We also offer custom branding options for corporate gift hampers. Please contact our corporate sales team for a personalized quote.",
  },
]

export default function GiftHampersPage() {
  const [activeCategory, setActiveCategory] = useState("premium")
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedHamper, setSelectedHamper] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const filteredProducts = hamperProducts.filter((product) => product.category === activeCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-[#fffafc]">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cinzel font-bold text-black mb-6">
              Gift <span className="text-gold">Hampers</span>
            </h1>
            <p className="text-lg md:text-xl font-cinzel text-gray-700 mb-8 max-w-2xl mx-auto">
              Exquisite collections of our finest sweets and delicacies, beautifully packaged to make every occasion
              special.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link to="#hampers">Explore Hampers</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                <Link to="#customize">Customize Your Hamper</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              Explore Our <span className="text-gold">Collections</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Discover our range of thoughtfully curated gift hampers for every occasion and recipient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hamperCategories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  "relative overflow-hidden rounded-lg p-6 transition-all duration-300 cursor-pointer border-2",
                  activeCategory === category.id
                    ? "border-gold shadow-lg bg-white"
                    : "border-transparent hover:border-gold/50 bg-white/80",
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-cinzel font-bold text-xl">{category.name}</h3>
                </div>
                <p className="text-gray-700 mb-4">{category.description}</p>
                <button className="text-gold font-medium flex items-center gap-1 text-sm">
                  View Collection <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hampers Section */}
      <section id="hampers" className="py-16 bg-[#fffafc]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              {hamperCategories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              {hamperCategories.find((c) => c.id === activeCategory)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setSelectedHamper(selectedHamper === product.id ? null : product.id)}
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-cinzel font-bold text-xl mb-2">{product.name}</h3>
                  <p className="text-gray-700 mb-4">{product.description}</p>

                  {selectedHamper === product.id && (
                    <div className="mb-4 bg-cream/50 p-4 rounded-lg">
                      <h4 className="font-cinzel font-bold text-sm mb-2">Hamper Contents:</h4>
                      <ul className="space-y-1">
                        {product.contents.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gold font-bold text-xl">{product.price}</span>
                    <Button className="bg-gold hover:bg-gold/90 text-white">Order Now</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section id="customize" className="py-16 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none"></div>
        <div className="container relative">
          <HeritageCornerDecoration className="absolute inset-0" variant="full" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-6">
              Create Your <span className="text-gold">Custom Hamper</span>
            </h2>
            <p className="text-cream mb-8">
              Design a personalized gift hamper tailored to your preferences and budget. Choose from our wide range of
              sweets, dry fruits, and packaging options.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Select Contents</h3>
                <p className="text-cream-dark text-sm">
                  Choose from our wide range of sweets, savories, dry fruits, and chocolates
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Choose Packaging</h3>
                <p className="text-cream-dark text-sm">
                  Select from our elegant packaging options including boxes, baskets, and trays
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Add Personal Touch</h3>
                <p className="text-cream-dark text-sm">
                  Include a personalized message card or add special decorative elements
                </p>
              </div>
            </div>

            <Button asChild className="bg-gold hover:bg-gold/90 text-white">
              <Link to="/contact">Contact For Custom Order</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-[#fffafc]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              Customer <span className="text-gold">Testimonials</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              See what our customers have to say about our gift hampers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  {index === 1 &&
                    "The Royal Indulgence Hamper was absolutely stunning! The presentation was exquisite and the sweets were delicious. It made the perfect gift for my parents' anniversary."}
                  {index === 2 &&
                    "I ordered the Executive Gift Hamper for my business clients and they were thoroughly impressed. The quality of the sweets and the elegant packaging reflected our company's standards perfectly."}
                  {index === 3 &&
                    "The Birthday Celebration Hamper was a hit! My friend loved the variety of sweets and the beautiful presentation. Will definitely order again for other special occasions."}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={`/hamper-testimonial-${index}.png`}
                      alt="Customer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-bold">
                      {index === 1 && "Neha Kapoor"}
                      {index === 2 && "Vikram Singh"}
                      {index === 3 && "Meera Patel"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {index === 1 && "Premium Hamper"}
                      {index === 2 && "Corporate Hamper"}
                      {index === 3 && "Occasion Hamper"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">Find answers to common questions about our gift hampers.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-cinzel font-bold text-left">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gold" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-white/80 rounded-b-lg -mt-1 shadow-sm">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gold/10 to-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-6">
              Send the Perfect <span className="text-gold">Gift</span>
            </h2>
            <p className="text-gray-700 mb-8">
              Whether it's a celebration, festival, or corporate event, our gift hampers are designed to impress and
              delight.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link to="#hampers">Order Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
