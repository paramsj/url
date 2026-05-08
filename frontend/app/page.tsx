import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
