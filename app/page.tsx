import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesSection from "@/components/home/CoursesSection";
import MentorsSection from "@/components/home/MentorsSection";
import CTABanner from "@/components/home/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <MentorsSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
