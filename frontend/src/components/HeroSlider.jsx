import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80",
    title: "Discover the World",
    subtitle: "Premium travel experiences to over 200 destinations",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&q=80",
    title: "Fly in Comfort",
    subtitle: "Award-winning service and world-class amenities",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507812984078-917a274065be?w=1920&q=80",
    title: "Business Excellence",
    subtitle: "Elevate your corporate travel experience",
  },
  {
    image:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80",
    title: "Paradise Awaits",
    subtitle: "Escape to breathtaking tropical destinations",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Frequent Flyer · Gold Member",
    avatar: "PS",
    stars: 5,
    text: "SkyArc completely transformed my travel experience. The seamless online check-in, premium seat selection and the loyalty rewards made every trip feel first class. Highly recommend!",
  },
  {
    name: "Rahul Mehta",
    role: "Business Traveler",
    avatar: "RM",
    stars: 5,
    text: "I travel twice a month for work and SkyArc is my go-to airline. The app is flawless, customer support is lightning fast, and the Business Class deal saved me a fortune this quarter.",
  },
  {
    name: "Amelia Johnson",
    role: "Solo Traveler",
    avatar: "AJ",
    stars: 5,
    text: "Booked a last-minute trip to Bali and SkyArc had the best prices with incredible service. The in-flight meal I pre-ordered was genuinely delicious. Will fly with them again!",
  },
  {
    name: "Vikram Singh",
    role: "Family Travel Enthusiast",
    avatar: "VS",
    stars: 4,
    text: "Traveling with three kids used to be a nightmare. SkyArc's family check-in and group seating made it so smooth. The baggage tracking feature gave us peace of mind throughout.",
  },
];

const faqs = [
  {
    q: "How early can I check in online?",
    a: "Online check-in opens 48 hours before your scheduled departure and closes 1 hour before. You can download your mobile boarding pass directly from the SkyArc app or website after completing check-in.",
  },
  {
    q: "What is the free baggage allowance?",
    a: "Economy class passengers are entitled to 23 kg checked baggage plus 7 kg cabin baggage. Business Class passengers receive 32 kg checked baggage. Additional baggage can be pre-purchased at discounted rates.",
  },
  {
    q: "How do I earn and redeem SkyRewards miles?",
    a: "Miles are earned on every SkyArc flight based on distance and fare class. You can redeem miles for free flights, seat upgrades, lounge access, and partner benefits. 1 mile = approximately ₹0.50 in value.",
  },
  {
    q: "Can I change or cancel my booking?",
    a: "Yes. Flexible and Premium fare tickets can be changed or cancelled free of charge up to 24 hours before departure. Economy Light fares have a nominal change fee. Full details are available on your booking confirmation.",
  },
  {
    q: "Do you offer special assistance for passengers?",
    a: "Absolutely. We provide wheelchair assistance, pre-boarding priority, special meals (diabetic, vegan, kosher, etc.), and unaccompanied minor services. Please request special assistance at least 48 hours before departure.",
  },
  {
    q: "How does the seat upgrade process work?",
    a: "You can upgrade your seat during booking, online check-in, or at the airport (subject to availability). SkyRewards members can use miles for upgrades. Business Class upgrades are also available via our bid-upgrade system.",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* FIXED: pure black overlay — theme-independent */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="overflow-hidden">
          <h1
            className={`font-display text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl transition-all duration-700 ${
              isTransitioning
                ? "translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slides[currentSlide].title}
          </h1>
        </div>
        <div className="mt-4 overflow-hidden">
          <p
            className={`text-lg text-white/80 md:text-xl lg:text-2xl transition-all duration-700 delay-100 ${
              isTransitioning
                ? "translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-700 delay-200 ${
            isTransitioning
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
          }`}
        >
          <button
            className="group relative overflow-hidden rounded-full bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[0_0_30px_rgba(51,102,255,0.5)]"
            onClick={() => navigate("/user/search")}
          >
            <span className="relative z-10">Book Your Flight</span>
            <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-full" />
          </button>
          <button
            className="rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
            onClick={() => {
              document
                .getElementById("destinations")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Destinations
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 md:left-8 md:p-4"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 md:right-8 md:p-4"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentSlide(index);
                setTimeout(() => setIsTransitioning(false), 700);
              }
            }}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements — FIXED: from-black instead of from-background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black/40 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black/40 to-transparent" />
    </div>
  );
}
