"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Shield,
  FileText,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCw,
  Copyright,
  UserCheck,
  Scale,
  Globe,
} from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"

const TermsOfServicePage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-cream min-h-screen">
      {/* Luxury Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d3ae6e]/20 via-[#d3ae6e]/20 to-[#d3ae6e]/20"></div>
        <div className="absolute inset-0 bg-[url('/elegant-gold-pattern.png')] bg-repeat opacity-10"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-[#d3ae6e] opacity-60"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-[#d3ae6e] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-[#d3ae6e] opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-[#d3ae6e] opacity-60"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center justify-center">
                <div className="h-px w-12 bg-[#d3ae6e]"></div>
                <div className="mx-4 text-[#d3ae6e] text-sm tracking-widest uppercase">Legal Agreement</div>
                <div className="h-px w-12 bg-[#d3ae6e]"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#d3ae6e] mb-6 font-serif">Terms of Service</h1>

            <div className="flex items-center justify-center mb-6">
              <div className="h-0.5 w-12 bg-[#d3ae6e]"></div>
              <div className="mx-3">
                <div className="w-3 h-3 rotate-45 bg-[#d3ae6e]"></div>
              </div>
              <div className="h-0.5 w-12 bg-[#d3ae6e]"></div>
            </div>

            <p className="text-center mt-4 text-gray-700 max-w-2xl mx-auto text-lg">
              Please read these terms carefully before using our website and services.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative">
        {/* Decorative side elements */}
        <div className="hidden lg:block absolute left-8 top-1/4 h-32 w-1 bg-gradient-to-b from-transparent via-[#d3ae6e] to-transparent opacity-30"></div>
        <div className="hidden lg:block absolute right-8 top-1/2 h-32 w-1 bg-gradient-to-b from-transparent via-[#d3ae6e] to-transparent opacity-30"></div>

        <div className="max-w-4xl mx-auto">
          {/* Luxury paper effect */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden relative">
            {/* Gold corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
              <div className="absolute top-0 left-0 w-0.5 h-16 bg-[#d3ae6e] opacity-60"></div>
              <div className="absolute top-0 left-0 h-0.5 w-16 bg-[#d3ae6e] opacity-60"></div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-0.5 h-16 bg-[#d3ae6e] opacity-60"></div>
              <div className="absolute top-0 right-0 h-0.5 w-16 bg-[#d3ae6e] opacity-60 -translate-x-0"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
              <div className="absolute bottom-0 left-0 w-0.5 h-16 bg-[#d3ae6e] opacity-60"></div>
              <div className="absolute bottom-0 left-0 h-0.5 w-16 bg-[#d3ae6e] opacity-60"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
              <div className="absolute bottom-0 right-0 w-0.5 h-16 bg-[#d3ae6e] opacity-60"></div>
              <div className="absolute bottom-0 right-0 h-0.5 w-16 bg-[#d3ae6e] opacity-60"></div>
            </div>

            {/* Content with luxury styling */}
            <div className="p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[url('/elegant-gold-pattern.png')] bg-contain opacity-5 rotate-45"></div>

              <div className="prose prose-lg max-w-none">
                <div className="flex items-center mb-8">
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[#d3ae6e]/30 to-transparent"></div>
                  <p className="text-sm text-gray-500 px-4">Last Updated: May 1, 2025</p>
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[#d3ae6e]/30 to-transparent"></div>
                </div>

                <section className="mb-10">
                  <div className="flex items-center">
                    <Shield className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Acceptance of Terms</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      These Terms of Service ("Terms") govern your access to and use of the Ramesh Sweets website,
                      products, and services. By accessing or using our website, you agree to be bound by these Terms.
                      If you do not agree to these Terms, please do not use our website or services.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <FileText className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Use of Our Website</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      You may use our website only for lawful purposes and in accordance with these Terms. You agree not
                      to use our website:
                    </p>
                    <ul className="list-none pl-0 mt-4 space-y-4">
                      <li className="pl-8 relative">
                        <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                        In any way that violates any applicable federal, state, local, or international law or
                        regulation any applicable federal, state, local, or international law or regulation.
                      </li>
                      <li className="pl-8 relative">
                        <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                        To transmit, or procure the sending of, any advertising or promotional material, including any
                        "junk mail," "chain letter," "spam," or any other similar solicitation.
                      </li>
                      <li className="pl-8 relative">
                        <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                        To impersonate or attempt to impersonate Ramesh Sweets, a Ramesh Sweets employee, another user,
                        or any other person or entity.
                      </li>
                      <li className="pl-8 relative">
                        <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                        To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the
                        website, or which may harm Ramesh Sweets or users of the website.
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <ShoppingBag className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Products and Orders</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <div className="bg-cream/50 p-6 border-l-2 border-[#d3ae6e] rounded-r-md">
                      <p className="leading-relaxed">
                        All products displayed on our website are subject to availability. We reserve the right to
                        discontinue any product at any time.
                      </p>
                      <p className="mt-4 leading-relaxed">
                        Prices for our products are subject to change without notice. We reserve the right to modify or
                        discontinue the website or any service or product without notice at any time.
                      </p>
                      <p className="mt-4 leading-relaxed">
                        We reserve the right to refuse any order you place with us. We may, in our sole discretion,
                        limit or cancel quantities purchased per person, per household, or per order.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <CreditCard className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Payment Terms</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      We accept various payment methods as indicated on our website. By providing a payment method, you
                      represent and warrant that you are authorized to use the designated payment method.
                    </p>
                    <p className="mt-4 leading-relaxed">
                      You agree to pay all charges incurred by you or any users of your account and payment method at
                      the prices in effect when such charges are incurred. You are responsible for any applicable taxes
                      related to your purchases.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <Truck className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Shipping and Delivery</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      We will make every effort to deliver products within the estimated delivery time; however, we are
                      not responsible for delays beyond our control.
                    </p>
                    <p className="mt-4 leading-relaxed">
                      Risk of loss and title for items purchased from our website pass to you upon delivery of the items
                      to the carrier. You are responsible for filing any claims with carriers for damaged and/or lost
                      shipments.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <RefreshCw className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Returns and Refunds</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <div className="bg-cream/50 p-6 border-l-2 border-[#d3ae6e] rounded-r-md">
                      <p className="leading-relaxed">
                        Due to the perishable nature of our products, we generally do not accept returns. However, if
                        you are not satisfied with your purchase, please contact us within 24 hours of receiving your
                        order.
                      </p>
                      <p className="mt-4 leading-relaxed">
                        If a product is damaged during shipping or if there is an error in your order, please contact us
                        immediately with photos of the damaged items or description of the error.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <Copyright className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Intellectual Property Rights</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      The website and its entire contents, features, and functionality (including but not limited to all
                      information, software, text, displays, images, video, and audio, and the design, selection, and
                      arrangement thereof) are owned by Ramesh Sweets, its licensors, or other providers of such
                      material and are protected by copyright, trademark, patent, trade secret, and other intellectual
                      property or proprietary rights laws.
                    </p>
                    <p className="mt-4 leading-relaxed">
                      You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                      perform, republish, download, store, or transmit any of the material on our website.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <UserCheck className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">User Accounts</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      When you create an account with us, you guarantee that the information you provide is accurate,
                      complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in
                      the immediate termination of your account on the website.
                    </p>
                    <p className="mt-4 leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account and password and for
                      restricting access to your computer, and you agree to accept responsibility for all activities
                      that occur under your account or password.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <Scale className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Limitation of Liability</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <div className="bg-cream/50 p-6 border-l-2 border-[#d3ae6e] rounded-r-md">
                      <p className="leading-relaxed">
                        In no event will Ramesh Sweets, its affiliates, or their licensors, service providers,
                        employees, agents, officers, or directors be liable for damages of any kind, under any legal
                        theory, arising out of or in connection with your use, or inability to use, the website, any
                        websites linked to it, any content on the website or such other websites, including any direct,
                        indirect, special, incidental, consequential, or punitive damages.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center">
                    <Globe className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Governing Law</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">
                      These Terms and any dispute or claim arising out of or related to them, their subject matter, or
                      their formation shall be governed by and construed in accordance with the laws of the state or
                      country where Ramesh Sweets is headquartered, without giving effect to any choice or conflict of
                      law provision or rule.
                    </p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center">
                    <FileText className="text-[#d3ae6e] mr-3 h-6 w-6" />
                    <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e]">Contact Information</h2>
                  </div>
                  <div className="mt-4 pl-9">
                    <p className="leading-relaxed">Questions about the Terms of Service should be sent to us at:</p>
                    <div className="mt-6 p-6 border border-[#d3ae6e]/20 rounded-md bg-gradient-to-r from-[#d3ae6e]/5 to-transparent">
                      <p className="font-serif text-lg font-semibold text-[#d3ae6e]">Ramesh Sweets</p>
                      <p>123 Sweet Lane, Flavor District</p>
                      <p>Dessert City, DC 12345</p>
                      <p className="mt-2">
                        Email: <span className="text-[#d3ae6e]">legal@rameshsweets.com</span>
                      </p>
                      <p>
                        Phone: <span className="text-[#d3ae6e]">(555) 123-4567</span>
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-12 flex justify-center relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#d3ae6e]/30 to-transparent -translate-y-1/2"></div>
                <Link to="/">
                  <UniversalButton variant="secondary" size="lg" className="relative z-10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </UniversalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage
