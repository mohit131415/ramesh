import { Link } from "react-router-dom"
import { Facebook, Instagram, PhoneIcon as WhatsApp, MapPin, Phone, Mail, Clock } from "lucide-react"
import { HeritageCornerDecoration } from "../ui/heritage-decorations"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#1a0802] border-t border-gold/30 overflow-hidden">
      {/* Heritage pattern background */}
      <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none"></div>

      {/* Top decorative border - rich gold */}
      <div className="relative h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent"></div>

      <div className="container py-16 relative">
        {/* Corner decorations */}
        <HeritageCornerDecoration className="absolute inset-0" variant="full" />

        {/* Decorative circles */}
        <div className="absolute top-24 left-12 w-32 h-32 rounded-full bg-gold/5 blur-xl"></div>
        <div className="absolute bottom-24 right-12 w-40 h-40 rounded-full bg-gold/5 blur-xl"></div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
          {/* Logo and About */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 border border-gold/50 rounded-lg"></div>
              {/* Logo without shadow */}
              <Link to="/" className="relative block p-4">
                <img src="/logo_white.svg" alt="Ramesh Sweets Logo" className="h-16 w-auto mx-auto" />
              </Link>
            </div>

            <p className="text-cream font-cinzel text-sm leading-relaxed tracking-wide">
              Crafting authentic Indian sweets with traditional recipes since 1975. Every bite tells a story of heritage
              and passion, bringing the rich flavors of India to your celebrations and special moments.
            </p>

            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/60 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/rameshsweetsandcakes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/60 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/60 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsApp className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-cinzel text-xl font-medium text-gold-dark relative inline-block tracking-wide">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-px bg-gold/60"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", path: "/" },
                { label: "Products", path: "/products" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="font-cinzel text-sm text-cream-dark hover:text-gold transition-colors flex items-center tracking-wide"
                  >
                    <span className="w-1.5 h-1.5 bg-gold/80 rounded-full mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="font-cinzel text-xl font-medium text-gold-dark relative inline-block tracking-wide">
              Explore
              <span className="absolute -bottom-1 left-0 w-12 h-px bg-gold/60"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Categories", path: "/categories" },
                { label: "Corporate Gifts", path: "/corporate-gifts" },
                { label: "Wedding Gifts", path: "/wedding-gifts" },
                { label: "Bulk Order", path: "/bulk-order" },
                { label: "Festival Specials", path: "/festival-specials" },
                { label: "Gift Hampers", path: "/gift-hampers" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="font-cinzel text-sm text-cream-dark hover:text-gold transition-colors flex items-center tracking-wide"
                  >
                    <span className="w-1.5 h-1.5 bg-gold/80 rounded-full mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="font-cinzel text-xl font-medium text-gold-dark relative inline-block tracking-wide">
              Contact Us
              <span className="absolute -bottom-1 left-0 w-12 h-px bg-gold/60"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gold mr-3 mt-0.5 flex-shrink-0" />
                <a
                  href="https://maps.google.com/?q=Shop+Number+25,+Main+Bazar+Bharat+Chowk,+Ulhasnagar+1,+Sidhi+Vinayak+Nagar,+Ulhasnagar,+Maharashtra+421001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-cinzel text-sm text-cream-dark hover:text-gold transition-colors tracking-wide"
                >
                  Shop Number 25, Main Bazar Bharat Chowk, Ulhasnagar 1, Sidhi Vinayak Nagar, Ulhasnagar, Maharashtra
                  421001
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="font-cinzel text-sm text-cream-dark hover:text-gold transition-colors tracking-wide"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                <a
                  href="mailto:info@rameshsweets.co.in"
                  className="font-cinzel text-sm text-cream-dark hover:text-gold transition-colors tracking-wide"
                >
                  info@rameshsweets.co.in
                </a>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                <span className="font-cinzel text-sm text-cream-dark tracking-wide">
                  Open: 9:00 AM - 11:00 PM (All days including holidays)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="my-10 relative h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>

        {/* Copyright section */}
        <div className="relative">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="font-cinzel text-xs text-cream-dark/80 mb-4 md:mb-0 tracking-wide">
              © {currentYear} <span className="text-gold">Ramesh Sweets</span>. All rights reserved. Proudly serving
              authentic sweets since 1975.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
              <Link
                to="/privacy-policy"
                className="font-cinzel text-xs text-cream-dark/80 hover:text-gold transition-colors tracking-wide"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="font-cinzel text-xs text-cream-dark/80 hover:text-gold transition-colors tracking-wide"
              >
                Terms of Service
              </Link>
              <Link
                to="/return-policy"
                className="font-cinzel text-xs text-cream-dark/80 hover:text-gold transition-colors tracking-wide"
              >
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="relative h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent"></div>
    </footer>
  )
}
