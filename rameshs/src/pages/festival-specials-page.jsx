"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Calendar, Gift, Truck, Star, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../components/ui/button"
import { HeritageCornerDecoration } from "../components/ui/heritage-decorations"
// import RemoteImage from "../components/ui/remote-image"
import { cn } from "../lib/utils"

// Festival data
const festivals = [
  {
    id: "diwali",
    name: "Diwali",
    description: "Celebrate the festival of lights with our exquisite collection of traditional sweets.",
    date: "October-November",
    image: "/festival-diwali-collection.png",
    products: [
      {
        id: 1,
        name: "Diwali Deluxe Hamper",
        price: "₹2,999",
        image: "/diwali-deluxe-hamper.png",
        description: "A luxurious assortment of 12 varieties of sweets in an elegant gift box with diyas.",
      },
      {
        id: 2,
        name: "Diwali Premium Box",
        price: "₹1,999",
        image: "/diwali-premium-box.png",
        description: "Premium selection of 8 varieties of sweets in a beautiful festive packaging.",
      },
      {
        id: 3,
        name: "Diwali Special Kaju Mix",
        price: "1,499",
        image: "/diwali-kaju-mix.png",
        description: "Assorted kaju-based sweets in a special Diwali-themed box.",
      },
    ],
  },
  {
    id: "rakhi",
    name: "Raksha Bandhan",
    description: "Express your love for your siblings with our special Rakhi sweet collections.",
    date: "August",
    image: "/festival-rakhi-collection.png",
    products: [
      {
        id: 1,
        name: "Rakhi Special Box",
        price: "₹1,499",
        image: "/rakhi-special-box.png",
        description: "A beautiful box of assorted sweets with a designer rakhi and roli chawal.",
      },
      {
        id: 2,
        name: "Brother's Delight Hamper",
        price: "₹2,499",
        image: "/brothers-delight-hamper.png",
        description: "Premium sweets with dry fruits, chocolates, and a silver-plated rakhi.",
      },
      {
        id: 3,
        name: "Sister's Special Box",
        price: "₹1,299",
        image: "/sisters-special-box.png",
        description: "Curated box of sweets with a special gift for sisters on Raksha Bandhan.",
      },
    ],
  },
  {
    id: "holi",
    name: "Holi",
    description: "Add sweetness to the festival of colors with our vibrant Holi special treats.",
    date: "March",
    image: "/festival-holi-collection.png",
    products: [
      {
        id: 1,
        name: "Holi Celebration Box",
        price: "₹1,299",
        image: "/holi-celebration-box.png",
        description: "Colorful assortment of gujiya, mathri, and other Holi specialties.",
      },
      {
        id: 2,
        name: "Thandai & Sweets Combo",
        price: "₹1,799",
        image: "/thandai-sweets-combo.png",
        description: "Premium thandai mix with assorted sweets in a festive package.",
      },
      {
        id: 3,
        name: "Gujiya Special Box",
        price: "₹999",
        image: "/gujiya-special-box.png",
        description: "Assorted gujiya with different fillings in a beautiful Holi-themed box.",
      },
    ],
  },
  {
    id: "ganesh",
    name: "Ganesh Chaturthi",
    description: "Honor Lord Ganesha with our specially crafted sweets for this auspicious occasion.",
    date: "August-September",
    image: "/festival-ganesh-collection.png",
    products: [
      {
        id: 1,
        name: "Modak Special Box",
        price: "₹1,199",
        image: "/modak-special-box.png",
        description: "Assorted modaks with different fillings in a beautiful Ganesh-themed box.",
      },
      {
        id: 2,
        name: "Ganesh Festival Hamper",
        price: "₹2,299",
        image: "/ganesh-festival-hamper.png",
        description: "Premium selection of modaks, laddoos, and other sweets with a small Ganesh idol.",
      },
      {
        id: 3,
        name: "Prasad Special Box",
        price: "₹999",
        image: "/prasad-special-box.png",
        description: "Traditional prasad items including modaks and laddoos in a festive package.",
      },
    ],
  },
]

// FAQ data
const faqs = [
  {
    question: "How far in advance should I place my festival order?",
    answer:
      "We recommend placing your festival orders at least 7-10 days in advance to ensure availability and timely delivery. For major festivals like Diwali, we suggest ordering 2-3 weeks in advance due to high demand.",
  },
  {
    question: "Do you offer customization for festival gift boxes?",
    answer:
      "Yes, we offer customization options for all our festival gift boxes. You can personalize the packaging, add a custom message, or even select specific sweets to be included in your gift box.",
  },
  {
    question: "Are there any special discounts for bulk festival orders?",
    answer:
      "Yes, we offer special discounts for bulk orders during festivals. The discount percentage varies based on the order quantity. Please contact our customer service for more details on bulk order pricing.",
  },
  {
    question: "How long do your festival sweets stay fresh?",
    answer:
      "Our sweets typically stay fresh for 7-10 days when stored properly in a cool, dry place. Each product comes with a best-before date. We recommend consuming them within 3-5 days for the best taste and quality.",
  },
  {
    question: "Do you deliver festival orders outside of India?",
    answer:
      "Yes, we offer international shipping for most of our festival special products. Please note that international orders require additional processing time and shipping costs. Contact us for specific details about your destination.",
  },
]

export default function FestivalSpecialsPage() {
  const [activeFestival, setActiveFestival] = useState("diwali")
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-[#fffafc]">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cinzel font-bold text-black mb-6">
              Festival <span className="text-gold">Specials</span>
            </h1>
            <p className="text-lg md:text-xl font-cinzel text-gray-700 mb-8 max-w-2xl mx-auto">
              Celebrate India's rich cultural heritage with our exquisite collection of festival sweets, crafted with
              tradition and love.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link to="#festivals">Explore Collections</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                <Link to="#pre-order">Pre-Order Now</Link>
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

      {/* Festival Calendar Section */}
      <section className="py-16 bg-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              Festival <span className="text-gold">Calendar</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Mark your calendar for these sweet celebrations. Pre-order early to ensure you get our special festival
              collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {festivals.map((festival) => (
              <div
                key={festival.id}
                className={cn(
                  "relative overflow-hidden rounded-lg p-6 transition-all duration-300 cursor-pointer border-2",
                  activeFestival === festival.id
                    ? "border-gold shadow-lg bg-white"
                    : "border-transparent hover:border-gold/50 bg-white/80",
                )}
                onClick={() => setActiveFestival(festival.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-xl">{festival.name}</h3>
                    <p className="text-sm text-gray-500">{festival.date}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{festival.description}</p>
                <button className="text-gold font-medium flex items-center gap-1 text-sm">
                  View Collection <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Festival Products Section */}
      <section id="festivals" className="py-16 bg-[#fffafc]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              {festivals.find((f) => f.id === activeFestival)?.name} <span className="text-gold">Collection</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              {festivals.find((f) => f.id === activeFestival)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {festivals
              .find((f) => f.id === activeFestival)
              ?.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
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
                    <div className="flex justify-between items-center">
                      <span className="text-gold font-bold text-xl">{product.price}</span>
                      <Button className="bg-gold hover:bg-gold/90 text-white">Pre-Order</Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Pre-Order Section */}
      <section id="pre-order" className="py-16 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none"></div>
        <div className="container relative">
          <HeritageCornerDecoration className="absolute inset-0" variant="full" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-6">
              Pre-Order Your <span className="text-gold">Festival Sweets</span>
            </h2>
            <p className="text-cream mb-8">
              Secure your festival sweets in advance to avoid disappointment. Our special collections are made in
              limited quantities and sell out quickly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Early Booking</h3>
                <p className="text-cream-dark text-sm">
                  Place your order 2-3 weeks before the festival for guaranteed availability
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Customization</h3>
                <p className="text-cream-dark text-sm">
                  Personalize your festival gifts with custom packaging and messages
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-gold/30">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-lg mb-2">Scheduled Delivery</h3>
                <p className="text-cream-dark text-sm">
                  Choose your preferred delivery date to receive fresh sweets for the festival
                </p>
              </div>
            </div>

            <Button asChild className="bg-gold hover:bg-gold/90 text-white">
              <Link to="/contact">Contact For Pre-Order</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-[#fffafc]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-black mb-4">
              Customer <span className="text-gold">Celebrations</span>
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              See how our festival specials have made celebrations more memorable for our customers.
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
                    "The Diwali hamper from Ramesh Sweets was the highlight of our family celebration. The sweets were fresh, delicious, and beautifully presented. Will definitely order again next year!"}
                  {index === 2 &&
                    "I ordered the Rakhi Special Box for my brother who lives abroad. The packaging was stunning and the sweets arrived fresh. The included rakhi was beautiful and my brother was thrilled with the gift."}
                  {index === 3 &&
                    "The Ganesh Festival Hamper exceeded our expectations. The modaks were divine and the presentation was elegant. It made our Ganesh Chaturthi celebration truly special."}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={`/festival-testimonial-${index}.png`}
                      alt="Customer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-bold">
                      {index === 1 && "Priya Sharma"}
                      {index === 2 && "Rahul Mehta"}
                      {index === 3 && "Anita Desai"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {index === 1 && "Diwali Collection"}
                      {index === 2 && "Rakhi Special"}
                      {index === 3 && "Ganesh Festival"}
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
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find answers to common questions about our festival special collections.
            </p>
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
              Make Your Festival <span className="text-gold">Sweeter</span>
            </h2>
            <p className="text-gray-700 mb-8">
              Don't miss out on our limited-edition festival specials. Pre-order now to ensure you get the perfect
              sweets for your celebration.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link to="#festivals">Browse Collections</Link>
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
