// import HeroSlider from "@/components/home/hero-slider"
import HeroSection from "@/components/home/hero-section"
import BestSellers from "../components/home/best-sellers"
import CategorySection from "../components/home/category-section"
import QuickPicks from "../components/home/quick-picks"
import CTASection from "../components/home/cta-section"
import TestimonialsSection from "../components/home/testimonials-section"
import InstagramSection from "../components/home/instagram-section"
import RecentlyViewed from "../components/home/recently-viewed"
import TopCategoriesSection from "../components/home/top-categories-section"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopCategoriesSection />
      <HeroSection />
      {/* <HeroSlider /> */}
      {/* <RecentlyViewed /> */}
      <BestSellers />
      <CategorySection />
      <QuickPicks />
      <TestimonialsSection />
      <InstagramSection />
      <CTASection />
    </div>
  )
}
