"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import PageHeader from "../components/common/page-header"
import SectionHeader from "../components/common/section-header"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Card, CardContent } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="pt-24 pb-16 bg-[#fffafc] relative overflow-hidden">
      <PageHeader title="Contact Us" description="We'd love to hear from you. Get in touch with us." />

      <div className="container mx-auto px-4">
        {/* Contact Information */}
        <section className="mb-16 relative">
          <div className="relative z-10 grid md:grid-cols-4 gap-6">
            <ContactCard
              icon={<MapPin className="h-6 w-6 text-gold" />}
              title="Visit Us"
              details={["123 Sweet Lane, Kolkata", "West Bengal, India 700001"]}
            />
            <ContactCard
              icon={<Phone className="h-6 w-6 text-gold" />}
              title="Call Us"
              details={["+91 9876 543 210", "+91 9876 543 211"]}
            />
            <ContactCard
              icon={<Mail className="h-6 w-6 text-gold" />}
              title="Email Us"
              details={["info@rameshsweets.co.in", "orders@rameshsweets.co.in"]}
            />
            <ContactCard
              icon={<Clock className="h-6 w-6 text-gold" />}
              title="Opening Hours"
              details={["Mon - Sat: 9:00 AM - 9:00 PM", "Sunday: 10:00 AM - 6:00 PM"]}
            />
          </div>
        </section>

        {/* Contact Form and Map */}
        <section className="relative mb-16">
          <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 bg-white rounded-lg shadow-md border border-gold/10">
            <div>
              <div className="relative mb-8">
                <SectionHeader
                  title="Send Us a Message"
                  description="Fill out the form below and we'll get back to you as soon as possible."
                  className="mb-6"
                />
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-gold to-transparent"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-display text-sm">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-gold/20 focus:border-gold focus:ring-gold/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-display text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-gold/20 focus:border-gold focus:ring-gold/30"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-display text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-gold/20 focus:border-gold focus:ring-gold/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-display text-sm">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="border-gold/20 focus:border-gold focus:ring-gold/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-display text-sm">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="border-gold/20 focus:border-gold focus:ring-gold/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-gold hover:bg-gold-dark text-white relative overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                  {isSubmitting ? (
                    <>
                      <span className="relative">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">Send Message</span>
                      <Send className="relative ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div>
              <div className="relative mb-8">
                <SectionHeader title="Our Location" description="Visit our main store in Kolkata" className="mb-6" />
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-gold to-transparent"></div>
              </div>

              <div className="rounded-lg overflow-hidden h-[400px] shadow-lg border border-gold/20 relative">
                <div className="absolute inset-0 pointer-events-none border border-gold/10 rounded-lg z-10"></div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.21689846735!2d88.26494987792967!3d22.535564900000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277c3c0c093d1%3A0x85bf8bc90e55caa!2sRamesh%20Sweets!5e0!3m2!1sen!2sin!4v1647863121212!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Ramesh Sweets Location"
                ></iframe>
              </div>

              <div className="mt-4 p-4 bg-[#fffafc] rounded-lg border border-gold/10">
                <h4 className="font-display text-lg font-medium mb-2">Visit Our Store</h4>
                <p className="text-sm text-muted-foreground">
                  Experience the authentic taste of traditional Bengali sweets at our flagship store. Our store is
                  easily accessible by public transport and has ample parking space.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ContactCard({ icon, title, details }) {
  return (
    <Card className="border-gold/10 hover:shadow-md transition-all duration-300 bg-white overflow-hidden group relative">
      <CardContent className="p-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4 relative">
          <div className="absolute inset-0 rounded-full border border-gold/30"></div>
          <div className="absolute inset-1 rounded-full border border-gold/20"></div>
          {icon}
        </div>

        <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
        <div className="text-muted-foreground">
          {details.map((detail, index) => (
            <p key={index}>{detail}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
