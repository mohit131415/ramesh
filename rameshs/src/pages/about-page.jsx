import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"

export default function AboutPage() {
  return (
    <div className="bg-[#fffaf5]">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="/sweets_images/mohan thall.jpg"
          alt="Luxury Indian Sweets Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-block mb-6">
            <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets" className="h-24 w-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">Our Heritage</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            A legacy of authentic flavors and traditional craftsmanship since 1975
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fffaf5] to-transparent z-20"></div>
      </div>

      {/* Elegant Divider */}
      <div className="container mx-auto px-4 py-8">
        <div className="heritage-divider"></div>
      </div>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/sweets_images/kajukatli.webp"
                  alt="Traditional Kaju Katli"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute top-8 -right-8 w-32 h-32 bg-[#fffafc] rounded-full flex items-center justify-center z-20 shadow-lg border border-gold/20">
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-gold">48</div>
                  <div className="text-sm text-muted-foreground">
                    Years of
                    <br />
                    Excellence
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gold/10 rounded-full z-0"></div>
            </div>
            <div>
              <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
                <span className="text-gold font-medium">Since 1975</span>
              </div>
              <h2 className="text-4xl font-display font-bold mb-6">A Legacy of Sweetness</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Ramesh Sweets began as a small sweet shop in the heart of Kolkata in 1975. Founded by Mr. Ramesh
                  Kumar, the shop quickly gained popularity for its authentic taste and premium quality sweets made from
                  traditional recipes.
                </p>
                <p className="text-lg">
                  What started as a modest establishment has now grown into one of the most beloved sweet brands in
                  India, with multiple locations across the country and an online presence that allows us to deliver our
                  delicacies to sweet lovers nationwide.
                </p>
                <p className="text-lg">
                  Despite our growth, we remain committed to our founding principles: using only the finest ingredients,
                  following time-honored recipes, and ensuring that every sweet that bears the Ramesh name is crafted
                  with care and passion.
                </p>
              </div>
              <div className="mt-8 flex items-center">
                <div className="mr-6">
                  <img
                    src="https://images.unsplash.com/photo-1630493200278-8ea51e39cfa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80"
                    alt="Founder Signature"
                    className="h-16"
                  />
                </div>
                <div>
                  <p className="font-display font-semibold">Ramesh Kumar</p>
                  <p className="text-muted-foreground">Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-20 bg-heritage-gold">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
              <span className="text-gold font-medium">Our Craftsmanship</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">The Art of Sweet Making</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From selecting the finest ingredients to the final presentation, every step in our process is executed
              with precision and care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <LuxuryProcessStep
              number="01"
              title="Premium Ingredient Selection"
              description="We source the finest ingredients from trusted suppliers, ensuring premium quality in every sweet."
              image="/sweets_images/desi ghe bondi laddo.jpg"
            />
            <LuxuryProcessStep
              number="02"
              title="Artisanal Preparation"
              description="Our master sweet makers follow time-honored recipes and techniques passed down through generations."
              image="/sweets_images/methi laddo.jpg"
            />
            <LuxuryProcessStep
              number="03"
              title="Meticulous Quality Control"
              description="Each sweet undergoes rigorous quality checks before being elegantly packaged and delivered to our customers."
              image="/sweets_images/bundhi laddo.jpg"
            />
          </div>
        </div>
      </section>

      {/* Heritage Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
              <span className="text-gold font-medium">Our Heritage</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">A Visual Journey</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore the rich heritage and artistry behind our celebrated sweets through these captivating images.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 h-[600px]">
            <div className="col-span-12 md:col-span-8 row-span-2 relative group overflow-hidden rounded-lg">
              <img
                src="/sweets_images/JILEBI.webp"
                alt="Traditional Jalebi"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <h3 className="text-white text-xl font-display font-semibold">Our Premium Collection</h3>
              </div>
            </div>
            <div className="col-span-6 md:col-span-4 relative group overflow-hidden rounded-lg">
              <img
                src="/sweets_images/gulab_jamun.jpg"
                alt="Gulab Jamun"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <h3 className="text-white text-lg font-display font-semibold">Traditional Methods</h3>
              </div>
            </div>
            <div className="col-span-6 md:col-span-4 relative group overflow-hidden rounded-lg">
              <img
                src="/sweets_images/Motichoor_Laddoo.webp"
                alt="Motichoor Laddoo"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <h3 className="text-white text-lg font-display font-semibold">Elegant Presentation</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-heritage-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
              <span className="text-gold font-medium">Our Principles</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">Guided by Tradition</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our values are the foundation of everything we do, ensuring that every sweet we create meets the highest
              standards of quality and authenticity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <LuxuryValueCard
              title="Uncompromising Quality"
              description="We source only the finest ingredients and follow strict quality control processes to ensure excellence in every bite."
            />
            <LuxuryValueCard
              title="Time-Honored Tradition"
              description="Our recipes have been passed down through generations, preserving the authentic flavors of traditional Indian sweets."
            />
            <LuxuryValueCard
              title="Artisanal Craftsmanship"
              description="Each sweet is handcrafted by our master confectioners who have perfected their art through years of dedication."
            />
            <LuxuryValueCard
              title="Innovation with Respect"
              description="We balance innovation with respect for tradition, creating new experiences while honoring our heritage."
            />
            <LuxuryValueCard
              title="Community Connection"
              description="We believe in building relationships and bringing people together through the shared joy of our sweets."
            />
            <LuxuryValueCard
              title="Daily Freshness"
              description="Every sweet is made fresh daily to ensure the best taste and quality for our valued customers."
            />
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
              <span className="text-gold font-medium">Our Journey</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">Key Milestones</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The story of Ramesh Sweets is one of passion, perseverance, and a commitment to excellence.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gold/20"></div>

            <Milestone
              year="1975"
              title="The Beginning"
              description="Ramesh Kumar opens the first sweet shop in Kolkata with just five varieties of sweets."
              isLeft={true}
            />

            <Milestone
              year="1985"
              title="Expansion Begins"
              description="After a decade of success, we opened our second location and expanded our menu to include 25 varieties."
              isLeft={false}
            />

            <Milestone
              year="1998"
              title="National Recognition"
              description="Ramesh Sweets receives its first national award for excellence in traditional confectionery."
              isLeft={true}
            />

            <Milestone
              year="2005"
              title="Going Digital"
              description="Launch of our first website, allowing customers to order our sweets online for the first time."
              isLeft={false}
            />

            <Milestone
              year="2015"
              title="International Presence"
              description="Began shipping our premium collections internationally, bringing the taste of India to global customers."
              isLeft={true}
            />

            <Milestone
              year="2023"
              title="Modern Innovation"
              description="Launched our exclusive artisanal collection, blending traditional recipes with contemporary techniques."
              isLeft={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
              src="/sweets_images/black current katli.jpg"
              alt="Premium Indian Sweets"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 py-20 px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Experience the Taste of Tradition
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                From our kitchen to your doorstep, we deliver the authentic taste of India's finest sweets.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/products">
                  <UniversalButton variant="primary" size="lg">
                    Explore Our Collection
                  </UniversalButton>
                </Link>
                <Link to="/contact">
                  <UniversalButton variant="secondary" size="lg">
                    Visit Our Stores
                  </UniversalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-heritage-gold">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 bg-gold/10 px-3 py-1 rounded-full">
              <span className="text-gold font-medium">Our Specialties</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">Signature Creations</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover our most beloved sweets that have delighted customers for generations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <FeaturedProduct name="Kaju Katli" image="/sweets_images/kajukatli.webp" />
            <FeaturedProduct name="Gulab Jamun" image="/sweets_images/gulab_jamun.jpg" />
            <FeaturedProduct name="Milk Cake" image="/sweets_images/MILKCAKE.webp" />
            <FeaturedProduct name="Motichoor Laddoo" image="/sweets_images/Motichoor_Laddoo.webp" />
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <UniversalButton variant="primary" size="lg" icon={<ChevronRight />} iconPosition="right">
                View All Products
              </UniversalButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function LuxuryValueCard({ title, description }) {
  return (
    <div className="border-gold/10 bg-white hover:shadow-lg transition-all duration-500 overflow-hidden group rounded-lg">
      <div className="p-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-display font-semibold mb-3">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function LuxuryProcessStep({ number, title, description, image }) {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-lg mb-6">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-4 left-4 bg-gold text-white w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-display font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function Milestone({ year, title, description, isLeft }) {
  return (
    <div
      className={`relative pb-16 ${isLeft ? "ml-auto mr-[50%] pr-12 text-right" : "ml-[50%] pl-12"}`}
      style={{ width: "calc(50% - 0.5px)" }}
    >
      <div className={`absolute top-0 ${isLeft ? "right-0" : "left-0"} w-12 h-0.5 bg-gold/20`}></div>
      <div
        className={`absolute top-0 transform -translate-y-1/2 ${isLeft ? "right-0 -translate-x-1/2" : "left-0 translate-x-1/2"} w-4 h-4 rounded-full bg-gold border-4 border-white`}
      ></div>
      <div className="mb-2">
        <span className="inline-block bg-gold/10 text-gold font-medium px-3 py-1 rounded-full text-sm">{year}</span>
      </div>
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function FeaturedProduct({ name, image }) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-md">
      <div className="aspect-square overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
        <div className="w-full p-4">
          <h3 className="text-white text-xl font-display font-semibold text-center">{name}</h3>
        </div>
      </div>
    </div>
  )
}
