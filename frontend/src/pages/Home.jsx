import { useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import BookingForm from "../components/BookingForm";
import Destinations from "../components/Destinations";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import FAQs from "../components/FAQHome";

export default function HomePage() {
  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <HeroSlider />
      <BookingForm />
      <div id="destinations">
        <Destinations />
      </div>
       <Testimonials />
       <FAQs />
      <Features />
      <Footer />
    </div>
  );
}
