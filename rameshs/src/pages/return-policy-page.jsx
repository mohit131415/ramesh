import { ArrowLeft, Clock, Package, RefreshCw, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { HeritageHeaderDecoration } from "../components/ui/heritage-header-decoration"
import { HeritageCornerDecoration } from "../components/ui/heritage-decorations"

export default function ReturnPolicyPage() {
  return (
    <div className="relative bg-cream min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/elegant-indian-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>

      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16 lg:py-20 relative">
        {/* Header with decorative elements */}
        <div className="relative mb-12">
          <HeritageHeaderDecoration className="absolute inset-0 -mx-4" />

          <div className="text-center relative z-10 py-6">
            <Link to="/" className="inline-flex items-center text-maroon hover:text-maroon-dark transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-cinzel text-sm">Back to Home</span>
            </Link>

            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-maroon mb-4">Return Policy</h1>

            <p className="text-brown-dark max-w-2xl mx-auto font-cinzel">
              Our commitment to quality and customer satisfaction
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative">
          <HeritageCornerDecoration className="absolute inset-0" variant="corners" />

          <div className="bg-white border border-gold/20 rounded-lg p-6 md:p-8 lg:p-10 shadow-soft relative z-10">
            {/* Introduction */}
            <div className="mb-10">
              <p className="text-brown-dark leading-relaxed mb-4">
                At Ramesh Sweets, we take immense pride in the quality and freshness of our products. We understand that
                sometimes products may not meet your expectations. Our return policy is designed to ensure your complete
                satisfaction while maintaining the integrity of our perishable food products.
              </p>
              <p className="text-brown-dark leading-relaxed">
                Please read this policy carefully to understand our procedures and guidelines regarding returns,
                replacements, and refunds.
              </p>
            </div>

            {/* Policy highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-cream/50 p-5 rounded-lg border border-gold/10 flex">
                <div className="mr-4">
                  <Clock className="h-8 w-8 text-maroon" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-medium text-maroon mb-2">Return Timeframe</h3>
                  <p className="text-sm text-brown-dark">
                    Returns must be initiated within 24 hours of delivery due to the perishable nature of our products.
                  </p>
                </div>
              </div>

              <div className="bg-cream/50 p-5 rounded-lg border border-gold/10 flex">
                <div className="mr-4">
                  <ShieldCheck className="h-8 w-8 text-maroon" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-medium text-maroon mb-2">Quality Guarantee</h3>
                  <p className="text-sm text-brown-dark">
                    We guarantee the quality of our products at the time of delivery.
                  </p>
                </div>
              </div>

              <div className="bg-cream/50 p-5 rounded-lg border border-gold/10 flex">
                <div className="mr-4">
                  <Package className="h-8 w-8 text-maroon" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-medium text-maroon mb-2">Unopened Products</h3>
                  <p className="text-sm text-brown-dark">
                    For non-perishable items, products must be in their original, unopened packaging.
                  </p>
                </div>
              </div>

              <div className="bg-cream/50 p-5 rounded-lg border border-gold/10 flex">
                <div className="mr-4">
                  <RefreshCw className="h-8 w-8 text-maroon" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-medium text-maroon mb-2">Replacement Priority</h3>
                  <p className="text-sm text-brown-dark">
                    We prioritize replacements over refunds to ensure you enjoy our products.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed policy sections */}
            <div className="space-y-8">
              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Return Eligibility
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>Products are eligible for return or replacement if:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>They are damaged during delivery</li>
                    <li>They are spoiled or of substandard quality upon delivery</li>
                    <li>They are incorrect or missing items from your order</li>
                    <li>They do not match the description on our website</li>
                  </ul>
                  <p className="text-sm italic mt-4">
                    <strong>Note:</strong> Due to the perishable nature of our sweets and food products, we cannot
                    accept returns after 24 hours of delivery.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Return Process
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>To initiate a return or replacement:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Contact our customer service team within 24 hours of delivery</li>
                    <li>Provide your order number and details of the issue</li>
                    <li>If possible, include photographs of the damaged or substandard products</li>
                    <li>Our team will review your request and provide further instructions</li>
                  </ol>
                  <p className="mt-3">You can contact our customer service team through:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Phone: +91 98765 43210 (9:00 AM - 8:00 PM, all days)</li>
                    <li>Email: returns@rameshsweets.co.in</li>
                    <li>WhatsApp: +91 98765 43210</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Replacements and Refunds
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>For eligible returns, we offer the following options:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Replacement:</strong> We will arrange for a replacement of the same product to be
                      delivered at the earliest possible time, subject to availability.
                    </li>
                    <li>
                      <strong>Alternative Product:</strong> If the original product is unavailable, we can offer a
                      similar product of equal or greater value.
                    </li>
                    <li>
                      <strong>Refund:</strong> If replacement is not possible or preferred, we will process a refund to
                      your original payment method within 5-7 business days.
                    </li>
                  </ul>
                  <p className="text-sm italic mt-4">
                    For bulk orders, corporate gifts, and wedding orders, special terms may apply. Please contact our
                    customer service for specific details.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Non-Returnable Items
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>The following items cannot be returned or replaced:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Products that have been consumed (partially or fully)</li>
                    <li>Custom or personalized orders (unless damaged or defective)</li>
                    <li>Products returned after 24 hours of delivery</li>
                    <li>Products that have not been stored as per instructions</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Shipping Costs for Returns
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>If a return is accepted:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      For issues that are our responsibility (damaged, incorrect, or substandard products), we will bear
                      all shipping costs for returns and replacements.
                    </li>
                    <li>
                      For returns due to customer preference or change of mind (where applicable), the customer may be
                      responsible for return shipping costs.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Quality Commitment
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>
                    At Ramesh Sweets, we are committed to providing the highest quality traditional Indian sweets and
                    snacks. All our products undergo strict quality checks before dispatch. We use premium ingredients
                    and follow traditional recipes to ensure authentic taste and freshness.
                  </p>
                  <p>
                    If you have any concerns about the quality of our products, please do not hesitate to contact us.
                    Your satisfaction is our priority.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Policy Changes
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>
                    We reserve the right to modify this return policy at any time. Changes will be effective immediately
                    upon posting to our website. Your continued use of our services following any changes indicates your
                    acceptance of the new terms.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-cinzel text-xl font-semibold text-maroon mb-3 pb-2 border-b border-gold/20">
                  Contact Us
                </h2>
                <div className="space-y-3 text-brown-dark">
                  <p>If you have any questions about our return policy, please contact us:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Phone: +91 98765 43210</li>
                    <li>Email: info@rameshsweets.co.in</li>
                    <li>
                      Address: Shop Number 25, Main Bazar Bharat Chowk, Ulhasnagar 1, Sidhi Vinayak Nagar, Ulhasnagar,
                      Maharashtra 421001
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Last updated */}
            <div className="mt-12 pt-6 border-t border-gold/20 text-center">
              <p className="text-sm text-brown-dark/70 font-cinzel">Last Updated: May 4, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
