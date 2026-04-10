import { useState, useEffect, useRef } from "react";
import "./Services.css";
import Navbar from "./Navbar";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer";
import {
  Plane,
  Luggage,
  Armchair,
  UtensilsCrossed,
  Globe,
  Trophy,
  MapPin,
  Mail,
  MessageCircle,
  X,
  Send,
  Check,
  ChevronDown,
  ArrowRight,
  Copy,
  CheckCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Tag,
  Sparkles,
  Bot,
} from "lucide-react";

/* ─── DATA ─────────────────────────────────────────────── */
const services = [
  {
    id: 1,
    icon: Plane,
    title: "Flight Booking",
    subtitle: "Domestic & International",
    description:
      "Book flights to over 150+ destinations worldwide. Enjoy competitive fares, flexible date options, and seamless checkout with instant e-ticket delivery.",
    features: [
      "150+ Destinations",
      "Best Price Guarantee",
      "Instant E-Ticket",
      "Multi-city Routing",
    ],
    color: "#1a6fc4",
    bg: "#eef5fd",
  },
  {
    id: 2,
    icon: Luggage,
    title: "Baggage Services",
    subtitle: "Flexible Allowance Plans",
    description:
      "Pre-purchase extra baggage, manage your allowance, and track your luggage in real-time from check-in to carousel delivery.",
    features: [
      "Pre-purchase Baggage",
      "Real-time Tracking",
      "Special Items",
      "Lost Bag Assistance",
    ],
    color: "#0e9f6e",
    bg: "#ecfdf5",
  },
  {
    id: 3,
    icon: Armchair,
    title: "Seat Selection",
    subtitle: "Choose Your Perfect Spot",
    description:
      "Pick your preferred seat with our interactive cabin map. Select window, aisle, extra legroom, or premium upgrade seats ahead of time.",
    features: [
      "Interactive Seat Map",
      "Extra Legroom",
      "Premium Upgrade",
      "Group Seating",
    ],
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: 4,
    icon: UtensilsCrossed,
    title: "In-Flight Meals",
    subtitle: "Curated Dining Experience",
    description:
      "Pre-order gourmet meals tailored to your dietary preferences. From vegan and kosher to regional specialties crafted by partner chefs.",
    features: [
      "20+ Meal Options",
      "Dietary Accommodations",
      "Pre-order Available",
      "Premium Menus",
    ],
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: 5,
    icon: Globe,
    title: "Online Check-In",
    subtitle: "Skip the Queue",
    description:
      "Check in online from 48 hours to 1 hour before departure. Download your mobile boarding pass and head straight to the gate.",
    features: [
      "48hr Early Check-in",
      "Mobile Boarding Pass",
      "Family Check-in",
      "Seat Upgrade",
    ],
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    id: 6,
    icon: Trophy,
    title: "Loyalty Rewards",
    subtitle: "Earn Miles, Fly Free",
    description:
      "Join SkyRewards and earn miles on every flight. Unlock elite tiers for lounge access, priority boarding, and exclusive perks worldwide.",
    features: [
      "Miles on Every Flight",
      "4 Elite Tiers",
      "Lounge Access",
      "Partner Benefits",
    ],
    color: "#be185d",
    bg: "#fdf2f8",
  },
];

const stats = [
  { Icon: MapPin, value: 150, suffix: "+", label: "Destinations" },
  { Icon: Users, value: 2, suffix: "M+", label: "Happy Travelers" },
  { Icon: TrendingUp, value: 99, suffix: "%", label: "On-time Rate" },
  { Icon: Clock, value: 24, suffix: "/7", label: "Support" },
  { Icon: Plane, value: 16, suffix: "+", label: "Years of Service" },
];

const destinations = [
  {
    city: "Dubai",
    country: "UAE",
    price: "₹28,500",
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    city: "Paris",
    country: "France",
    price: "₹52,000",
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  },
  {
    city: "Singapore",
    country: "Singapore",
    price: "₹18,200",
    tag: "Best Deal",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    price: "₹41,000",
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  },
  {
    city: "New York",
    country: "USA",
    price: "₹68,000",
    tag: "Premium",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
  },
  {
    city: "Bali",
    country: "Indonesia",
    price: "₹14,900",
    tag: "Best Deal",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  },
  {
    city: "London",
    country: "UK",
    price: "₹55,000",
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
  },
  {
    city: "Maldives",
    country: "Maldives",
    price: "₹22,000",
    tag: "Luxury",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
  },
];


const coupons = [
  {
    code: "EARLY30",
    disc: "30% OFF",
    title: "Early Bird Special",
    desc: "Book 60+ days ahead",
    validity: "Valid till Apr 30",
    color: "#1a6fc4",
    bg: "#eef5fd",
  },
  {
    code: "WKND20",
    disc: "20% OFF",
    title: "Weekend Getaway",
    desc: "Fri–Sun flights only",
    validity: "Every Weekend",
    color: "#0e9f6e",
    bg: "#ecfdf5",
  },
  {
    code: "STUDY25",
    disc: "25% OFF",
    title: "Student Fare",
    desc: "Valid student ID req'd",
    validity: "Year Round",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    code: "BIZ15",
    disc: "15% OFF",
    title: "Business Class Deal",
    desc: "Limited seats/flight",
    validity: "Valid till Mar 31",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const plans = [
  {
    name: "Economy",
    icon: Plane,
    price: "₹4,999",
    popular: false,
    color: "#1a6fc4",
    features: [
      { label: "Cabin Baggage", val: "7 kg" },
      { label: "Check-in Baggage", val: "23 kg" },
      { label: "Seat Selection", val: "Paid" },
      { label: "Meal", val: "Standard" },
      { label: "Lounge Access", val: false },
      { label: "Priority Boarding", val: false },
      { label: "Miles Earned", val: "1× base" },
      { label: "Cancellation", val: "₹500 fee" },
    ],
  },
  {
    name: "Business",
    icon: Shield,
    price: "₹18,999",
    popular: true,
    color: "#7c3aed",
    features: [
      { label: "Cabin Baggage", val: "15 kg" },
      { label: "Check-in Baggage", val: "32 kg" },
      { label: "Seat Selection", val: "Free" },
      { label: "Meal", val: "Premium" },
      { label: "Lounge Access", val: true },
      { label: "Priority Boarding", val: true },
      { label: "Miles Earned", val: "3× base" },
      { label: "Cancellation", val: "Free" },
    ],
  },
  {
    name: "First Class",
    icon: Sparkles,
    price: "₹42,999",
    popular: false,
    color: "#d97706",
    features: [
      { label: "Cabin Baggage", val: "20 kg" },
      { label: "Check-in Baggage", val: "50 kg" },
      { label: "Seat Selection", val: "Suite" },
      { label: "Meal", val: "Gourmet" },
      { label: "Lounge Access", val: true },
      { label: "Priority Boarding", val: true },
      { label: "Miles Earned", val: "5× base" },
      { label: "Cancellation", val: "Free anytime" },
    ],
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Frequent Flyer · Gold Member",
    avatar: "PS",
    stars: 5,
    text: "Skyjet completely transformed my travel experience. The seamless online check-in, premium seat selection and the loyalty rewards made every trip feel first class. Highly recommend!",
  },
  {
    name: "Rahul Mehta",
    role: "Business Traveler",
    avatar: "RM",
    stars: 5,
    text: "I travel twice a month for work and Skyjet is my go-to airline. The app is flawless, customer support is lightning fast, and the Business Class deal saved me a fortune this quarter.",
  },
  {
    name: "Amelia Johnson",
    role: "Solo Traveler",
    avatar: "AJ",
    stars: 5,
    text: "Booked a last-minute trip to Bali and Skyjet had the best prices with incredible service. The in-flight meal I pre-ordered was genuinely delicious. Will fly with them again!",
  },
  {
    name: "Vikram Singh",
    role: "Family Travel Enthusiast",
    avatar: "VS",
    stars: 4,
    text: "Traveling with three kids used to be a nightmare. Skyjet's family check-in and group seating made it so smooth. The baggage tracking feature gave us peace of mind throughout.",
  },
  {
    name: "Lena Fischer",
    role: "Digital Nomad",
    avatar: "LF",
    stars: 5,
    text: "As someone who flies every month, Skyjet's loyalty program has been a game changer. I've already earned two free flights just from regular bookings. The app experience is top-notch.",
  },
];

const faqs = [
  {
    q: "How early can I check in online?",
    a: "Online check-in opens 48 hours before your scheduled departure and closes 1 hour before. You can download your mobile boarding pass directly from the Skyjet app or website after completing check-in.",
  },
  {
    q: "What is the free baggage allowance?",
    a: "Economy passengers get 23 kg checked + 7 kg cabin. Business Class gets 32 kg checked. Additional baggage can be pre-purchased at discounted rates via our app.",
  },
  {
    q: "How do I earn and redeem SkyRewards miles?",
    a: "Miles are earned on every Skyjet flight based on distance and fare class. Redeem for free flights, upgrades, lounge access, and partner benefits. 1 mile ≈ ₹0.50 in value.",
  },
  {
    q: "Can I change or cancel my booking?",
    a: "Flexible and Premium fares can be changed or cancelled free up to 24 hours before departure. Economy Light has a nominal change fee. Details are on your booking confirmation.",
  },
  {
    q: "Do you offer special assistance?",
    a: "Yes — wheelchair assistance, pre-boarding priority, special meals (diabetic, vegan, kosher), and unaccompanied minor services. Request at least 48 hours before departure.",
  },
  {
    q: "How does the seat upgrade process work?",
    a: "Upgrade during booking, online check-in, or at the airport. SkyRewards members can use miles. Business Class upgrades are also available via our bid-upgrade system.",
  },
];

/* ─── COUNTER HOOK ──────────────────────────────────────── */
function useCounter(target, suffix, duration, start) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count + suffix;
}

function StatCard({ Icon, value, suffix, label, animate }) {
  const display = useCounter(value, suffix, 1800, animate);
  return (
    <div className="sv-stat-card">
      <div className="sv-stat-icon">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <p className="sv-stat-value">{display}</p>
      <p className="sv-stat-label">{label}</p>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────────────── */
export default function Services() {
  const [activeCard, setActiveCard] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      from: "bot",
      text: "Hello! 👋 I'm Skyjet's AI assistant powered by Claude. Ask me anything about flights, baggage, deals, or our services!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [testiIdx, setTestiIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const chatEndRef = useRef(null);
  const statsRef = useRef(null);


  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const t = setInterval(
      () => setTestiIdx((p) => (p + 1) % testimonials.length),
      5500,
    );
    return () => clearInterval(t);
  }, []);

  /* Claude AI */
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages((m) => [...m, { from: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are Skyjet Airlines' friendly AI assistant. Answer questions about flights, baggage, seat selection, meals, check-in, loyalty rewards, and travel tips concisely (2-3 sentences). Be warm and professional.",
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.[0]?.text ||
        "Let me connect you with our support team for more details.";
      setChatMessages((m) => [...m, { from: "bot", text: reply }]);
    } catch {
      setChatMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Sorry, I'm having trouble right now. Please call 1800-SKY-ARC or try again shortly.",
        },
      ]);
    }
    setChatLoading(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="sv-root">
      <Navbar />
      <Breadcrumb title="Our Services" />

      {/* ── SERVICES GRID ── */}
      <section className="sv-section sv-services-section">
        <div className="sv-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow">What We Offer</span>
            <h2 className="sv-section-title">
              Our <span className="sv-highlight">Services</span>
            </h2>
            <p className="sv-section-sub">
              Every service is designed with precision to ensure your travel
              experience is nothing short of extraordinary.
            </p>
          </div>
          <div className="sv-services-grid">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className={`sv-service-card${activeCard === svc.id ? " sv-service-card--active" : ""}`}
                  style={{
                    "--svc-color": svc.color,
                    "--svc-bg": svc.bg,
                    animationDelay: `${0.08 * idx}s`,
                  }}
                  onMouseEnter={() => setActiveCard(svc.id)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div
                    className="sv-svc-bar"
                    style={{ background: svc.color }}
                  />
                  <div
                    className="sv-svc-icon"
                    style={{ background: svc.bg, color: svc.color }}
                  >
                    <Icon size={26} strokeWidth={1.6} />
                  </div>
                  <span
                    className="sv-svc-subtitle"
                    style={{ color: svc.color }}
                  >
                    {svc.subtitle}
                  </span>
                  <h3 className="sv-svc-title">{svc.title}</h3>
                  <p className="sv-svc-desc">{svc.description}</p>
                  <div className="sv-svc-features">
                    {svc.features.map((f) => (
                      <span
                        key={f}
                        className="sv-feat-tag"
                        style={{
                          background: svc.bg,
                          color: svc.color,
                          borderColor: svc.color + "33",
                        }}
                      >
                        <Check size={11} strokeWidth={2.5} /> {f}
                      </span>
                    ))}
                  </div>
                  <button
                    className="sv-svc-btn"
                    style={{ borderColor: svc.color, color: svc.color }}
                  >
                    Learn More <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="sv-stats-section" ref={statsRef}>
        <div className="sv-container">
          <div className="sv-stats-grid">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} animate={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO COUPONS ── */}
      <section className="sv-section sv-promo-section">
        <div className="sv-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow">Limited Time Offers</span>
            <h2 className="sv-section-title">
              Exclusive <span className="sv-highlight">Deals</span>
            </h2>
            <p className="sv-section-sub">
              Grab these coupons before they expire. Apply at checkout to save
              instantly.
            </p>
          </div>
          <div className="sv-coupons-grid">
            {coupons.map((c, i) => (
              <div
                key={i}
                className="sv-coupon-card"
                style={{ "--cp-color": c.color }}
              >
                <div
                  className="sv-coupon-strip"
                  style={{ background: c.color }}
                />
                <div className="sv-coupon-left">
                  <div
                    className="sv-coupon-disc"
                    style={{
                      background: c.bg,
                      color: c.color,
                      borderColor: c.color + "44",
                    }}
                  >
                    {c.disc}
                  </div>
                  <h4 className="sv-coupon-title">{c.title}</h4>
                  <p className="sv-coupon-desc">{c.desc}</p>
                  <span className="sv-coupon-validity">
                    <Clock size={12} /> {c.validity}
                  </span>
                </div>
                <div className="sv-coupon-divider" />
                <div className="sv-coupon-right">
                  <p className="sv-coupon-code-label">Promo Code</p>
                  <div
                    className="sv-coupon-code-box"
                    style={{ borderColor: c.color + "55", background: c.bg }}
                  >
                    <Tag size={13} style={{ color: c.color }} />
                    <span className="sv-coupon-code" style={{ color: c.color }}>
                      {c.code}
                    </span>
                  </div>
                  <button
                    className="sv-copy-btn"
                    style={{
                      background: copiedCode === c.code ? "#22c55e" : c.color,
                    }}
                    onClick={() => copyCode(c.code)}
                  >
                    {copiedCode === c.code ? (
                      <>
                        <CheckCircle size={14} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARE PLANS ── */}
      <section className="sv-section sv-plans-section">
        <div className="sv-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow">Choose Your Class</span>
            <h2 className="sv-section-title">
              Compare <span className="sv-highlight">Plans</span>
            </h2>
            <p className="sv-section-sub">
              Find the perfect fare class that suits your travel style and
              budget.
            </p>
          </div>
          <div className="sv-plans-grid">
            {plans.map((plan, pi) => {
              const PIcon = plan.icon;
              return (
                <div
                  key={pi}
                  className={`sv-plan-card${plan.popular ? " sv-plan-card--popular" : ""}`}
                  style={{ "--pl-color": plan.color }}
                >
                  {plan.popular && (
                    <div className="sv-plan-badge">
                      <Zap size={12} /> Most Popular
                    </div>
                  )}
                  <div
                    className="sv-plan-header"
                    style={{ background: plan.color }}
                  >
                    <div className="sv-plan-icon-wrap">
                      <PIcon size={24} strokeWidth={1.8} />
                    </div>
                    <h3 className="sv-plan-name">{plan.name}</h3>
                    <p className="sv-plan-price">
                      {plan.price}
                      <span> /person</span>
                    </p>
                  </div>
                  <ul className="sv-plan-features">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="sv-plan-row">
                        <span className="sv-plan-label">{f.label}</span>
                        <span className="sv-plan-val">
                          {f.val === true ? (
                            <CheckCircle size={16} className="sv-val-yes" />
                          ) : f.val === false ? (
                            <X size={16} className="sv-val-no" />
                          ) : (
                            f.val
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="sv-plan-btn"
                    style={{
                      background: plan.popular ? plan.color : "transparent",
                      color: plan.popular ? "#fff" : plan.color,
                      borderColor: plan.color,
                    }}
                  >
                    Book {plan.name} <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="sv-section sv-testi-section">
        <div className="sv-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow">Traveler Stories</span>
            <h2 className="sv-section-title">
              What Our <span className="sv-highlight">Guests Say</span>
            </h2>
          </div>
          <div className="sv-testi-layout">
            <div className="sv-testi-main">
              <div className="sv-testi-quote">"</div>
              <p className="sv-testi-text">{testimonials[testiIdx].text}</p>
              <div className="sv-testi-meta">
                <div className="sv-testi-author">
                  <div className="sv-testi-avatar">
                    {testimonials[testiIdx].avatar}
                  </div>
                  <div>
                    <p className="sv-testi-name">
                      {testimonials[testiIdx].name}
                    </p>
                    <p className="sv-testi-role">
                      {testimonials[testiIdx].role}
                    </p>
                  </div>
                </div>
                <div className="sv-testi-stars">
                  {Array(testimonials[testiIdx].stars)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" stroke="none" />
                    ))}
                </div>
              </div>
              <div className="sv-testi-controls">
                <button
                  className="sv-testi-arrow"
                  onClick={() =>
                    setTestiIdx(
                      (p) =>
                        (p - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="sv-testi-dots">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      className={`sv-testi-dot${i === testiIdx ? " sv-testi-dot--active" : ""}`}
                      onClick={() => setTestiIdx(i)}
                    />
                  ))}
                </div>
                <button
                  className="sv-testi-arrow"
                  onClick={() =>
                    setTestiIdx((p) => (p + 1) % testimonials.length)
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="sv-testi-thumbs">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`sv-testi-thumb${i === testiIdx ? " sv-testi-thumb--active" : ""}`}
                  onClick={() => setTestiIdx(i)}
                >
                  <div className="sv-testi-thumb-av">{t.avatar}</div>
                  <div className="sv-testi-thumb-info">
                    <p className="sv-testi-thumb-name">{t.name}</p>
                    <p className="sv-testi-thumb-role">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sv-section sv-faq-section">
        <div className="sv-faq-container">
          <div className="sv-section-head">
            <span className="sv-eyebrow">Got Questions?</span>
            <h2 className="sv-section-title">
              Frequently <span className="sv-highlight">Asked</span>
            </h2>
          </div>
          <div className="sv-faq-list">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`sv-faq-item${openFaq === i ? " sv-faq-item--open" : ""}`}
              >
                <button
                  className="sv-faq-trigger"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="sv-faq-q">{f.q}</span>
                  <span
                    className={`sv-faq-chevron${openFaq === i ? " sv-faq-chevron--open" : ""}`}
                  >
                    <ChevronDown size={18} strokeWidth={2} />
                  </span>
                </button>
                <div
                  className={`sv-faq-body${openFaq === i ? " sv-faq-body--open" : ""}`}
                >
                  <p className="sv-faq-a">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="sv-newsletter-section">
        <div className="sv-container">
          <div className="sv-nl-box">
            <div className="sv-nl-icon-wrap">
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <h3 className="sv-nl-title">
              Get <span className="sv-highlight">Exclusive</span> Flight Deals
            </h3>
            <p className="sv-nl-sub">
              Subscribe and be the first to know about flash sales, new routes,
              and special offers. No spam, ever.
            </p>
            {subscribed ? (
              <div className="sv-nl-success">
                <CheckCircle size={18} /> You're subscribed! Watch your inbox
                for exclusive deals.
              </div>
            ) : (
              <div className="sv-nl-form">
                <input
                  type="email"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  placeholder="Enter your email address"
                  className="sv-nl-input"
                />
                <button
                  className="sv-nl-btn"
                  onClick={() =>
                    newsletter.includes("@") && setSubscribed(true)
                  }
                >
                  Subscribe <ArrowRight size={15} />
                </button>
              </div>
            )}
            <p className="sv-nl-note">
              By subscribing you agree to our Privacy Policy. Unsubscribe
              anytime.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── CHAT FAB ── */}
      <button className="sv-chat-fab" onClick={() => setChatOpen((p) => !p)}>
        {chatOpen ? (
          <X size={22} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={24} strokeWidth={2} />
        )}
      </button>

      {/* ── CHAT PANEL ── */}
      {chatOpen && (
        <div className="sv-chat-panel">
          <div className="sv-chat-header">
            <div className="sv-chat-hicon">
              <Bot size={18} strokeWidth={2} />
            </div>
            <div className="sv-chat-htext">
              <p className="sv-chat-htitle">Skyjet AI Support</p>
              <p className="sv-chat-hsub">
                <span className="sv-chat-dot" />
                Powered by Claude AI
              </p>
            </div>
            <button className="sv-chat-xbtn" onClick={() => setChatOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="sv-chat-msgs">
            {chatMessages.map((m, i) => (
              <div key={i} className={`sv-chat-row sv-chat-row--${m.from}`}>
                {m.from === "bot" && (
                  <div className="sv-chat-bot-av">
                    <Bot size={12} />
                  </div>
                )}
                <div className="sv-chat-bubble sv-chat-bubble--${m.from}">
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="sv-chat-row sv-chat-row--bot">
                <div className="sv-chat-bot-av">
                  <Bot size={12} />
                </div>
                <div className="sv-chat-bubble sv-chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="sv-chat-suggestions">
            {["Baggage allowance", "Check-in timing", "Best deals"].map((s) => (
              <button
                key={s}
                className="sv-chat-chip"
                onClick={() => setChatInput(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="sv-chat-inputrow">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask anything…"
              className="sv-chat-input"
            />
            <button
              className="sv-chat-send"
              onClick={sendChat}
              disabled={chatLoading}
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
