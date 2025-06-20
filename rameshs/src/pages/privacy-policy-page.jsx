"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"

const PrivacyPolicyPage = () => {
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
                <div className="mx-4 text-[#d3ae6e] text-sm tracking-widest uppercase">Official Document</div>
                <div className="h-px w-12 bg-[#d3ae6e]"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#d3ae6e] mb-6 font-serif">Privacy Policy</h1>

            <div className="flex items-center justify-center mb-6">
              <div className="h-0.5 w-12 bg-[#d3ae6e]"></div>
              <div className="mx-3">
                <div className="w-3 h-3 rotate-45 bg-[#d3ae6e]"></div>
              </div>
              <div className="h-0.5 w-12 bg-[#d3ae6e]"></div>
            </div>

            <p className="text-center mt-4 text-gray-700 max-w-2xl mx-auto text-lg">
              At Ramesh Sweets, we value your privacy and are committed to protecting your personal information.
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
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Introduction
                  </h2>
                  <p className="leading-relaxed">
                    Ramesh Sweets ("we," "our," or "us") respects your privacy and is committed to protecting it through
                    our compliance with this policy. This Privacy Policy describes the types of information we may
                    collect from you or that you may provide when you visit our website and our practices for
                    collecting, using, maintaining, protecting, and disclosing that information.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Information We Collect
                  </h2>
                  <p className="leading-relaxed">
                    We collect several types of information from and about users of our website, including:
                  </p>
                  <ul className="list-none pl-0 mt-4 space-y-4">
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      <strong className="text-[#d3ae6e]">Personal Information:</strong> Name, postal address, email
                      address, telephone number, payment information, and any other identifier by which you may be
                      contacted online or offline.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      <strong className="text-[#d3ae6e]">Order Information:</strong> Details about the products you
                      purchase, including order history, preferences, and delivery information.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      <strong className="text-[#d3ae6e]">Usage Information:</strong> Information about your internet
                      connection, the equipment you use to access our website, and usage details.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      <strong className="text-[#d3ae6e]">Cookies and Tracking Technologies:</strong> We use cookies and
                      similar technologies to track activity on our website and hold certain information.
                    </li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    How We Use Your Information
                  </h2>
                  <p className="leading-relaxed">
                    We use information that we collect about you or that you provide to us:
                  </p>
                  <ul className="list-none pl-0 mt-4 space-y-4">
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To present our website and its contents to you.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To provide you with information, products, or services that you request from us.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To fulfill any other purpose for which you provide it.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To process and deliver your orders, including managing payments and tracking delivery.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To provide you with notices about your account or orders.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To improve our website, products, and services.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To personalize your website experience and to deliver content and product offerings relevant to
                      your interests.
                    </li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Disclosure of Your Information
                  </h2>
                  <p className="leading-relaxed">
                    We may disclose personal information that we collect or you provide as described in this privacy
                    policy:
                  </p>
                  <ul className="list-none pl-0 mt-4 space-y-4">
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To our subsidiaries and affiliates.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To contractors, service providers, and other third parties we use to support our business.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To fulfill the purpose for which you provide it.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      For any other purpose disclosed by us when you provide the information.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      With your consent.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      To comply with any court order, law, or legal process.
                    </li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Data Security
                  </h2>
                  <div className="bg-cream/50 p-6 border-l-2 border-[#d3ae6e] rounded-r-md">
                    <p className="leading-relaxed">
                      We have implemented measures designed to secure your personal information from accidental loss and
                      from unauthorized access, use, alteration, and disclosure. All information you provide to us is
                      stored on secure servers behind firewalls. Any payment transactions will be encrypted using SSL
                      technology.
                    </p>
                    <p className="mt-4 leading-relaxed">
                      Unfortunately, the transmission of information via the internet is not completely secure. Although
                      we do our best to protect your personal information, we cannot guarantee the security of your
                      personal information transmitted to our website. Any transmission of personal information is at
                      your own risk.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Your Rights
                  </h2>
                  <p className="leading-relaxed">
                    Depending on your location, you may have certain rights regarding your personal information,
                    including:
                  </p>
                  <ul className="list-none pl-0 mt-4 space-y-4">
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to access personal information we hold about you.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to request correction of inaccurate personal information.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to request deletion of your personal information.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to object to processing of your personal information.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to data portability.
                    </li>
                    <li className="pl-8 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 border border-[#d3ae6e] rotate-45"></div>
                      The right to withdraw consent at any time where we rely on consent to process your personal
                      information.
                    </li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Children's Privacy
                  </h2>
                  <div className="bg-cream/50 p-6 border-l-2 border-[#d3ae6e] rounded-r-md">
                    <p className="leading-relaxed">
                      Our website is not intended for children under 13 years of age. We do not knowingly collect
                      personal information from children under 13. If you are under 13, do not use or provide any
                      information on this website.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Changes to Our Privacy Policy
                  </h2>
                  <p className="leading-relaxed">
                    We may update our Privacy Policy from time to time. If we make material changes to how we treat our
                    users' personal information, we will post the new Privacy Policy on this page and notify you through
                    a notice on the website home page.
                  </p>
                  <p className="mt-4 leading-relaxed">
                    The date the Privacy Policy was last revised is identified at the top of the page. You are
                    responsible for periodically visiting our website and this Privacy Policy to check for any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-[#d3ae6e] mb-4 flex items-center">
                    <span className="w-6 h-0.5 bg-[#d3ae6e] mr-3"></span>
                    Contact Information
                  </h2>
                  <p className="leading-relaxed">
                    To ask questions or comment about this Privacy Policy and our privacy practices, contact us at:
                  </p>
                  <div className="mt-6 p-6 border border-[#d3ae6e]/20 rounded-md bg-gradient-to-r from-[#d3ae6e]/5 to-transparent">
                    <p className="font-serif text-lg font-semibold text-[#d3ae6e]">Ramesh Sweets</p>
                    <p>123 Sweet Lane, Flavor District</p>
                    <p>Dessert City, DC 12345</p>
                    <p className="mt-2">
                      Email: <span className="text-[#d3ae6e]">privacy@rameshsweets.com</span>
                    </p>
                    <p>
                      Phone: <span className="text-[#d3ae6e]">(555) 123-4567</span>
                    </p>
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

export default PrivacyPolicyPage
