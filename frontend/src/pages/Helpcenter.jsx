import { useState } from "react";
import {
  Plane,
  Ticket,
  Luggage,
  Armchair,
  CreditCard,
  Globe,
  Phone,
  MessageCircle,
  Mail,
  Twitter,
  AlertCircle,
  X,
  ArrowRight,
  Star,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Headphones,
  Shield,
  Award,
  CheckCircle,
} from "lucide-react";
import "./HelpCenter.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

/* ───── Data ───── */
const CATEGORIES = [
  {
    id: 1,
    icon: Plane,
    color: "blue",
    title: "Booking & Reservations",
    desc: "Manage your flights, seat selection, and booking modifications.",
    count: "42 articles",
  },
  {
    id: 2,
    icon: Ticket,
    color: "gold",
    title: "Check-in & Boarding",
    desc: "Online check-in, boarding pass, and gate information.",
    count: "28 articles",
  },
  {
    id: 3,
    icon: Luggage,
    color: "teal",
    title: "Baggage & Allowances",
    desc: "Carry-on rules, checked bags, fees and lost luggage claims.",
    count: "35 articles",
  },
  {
    id: 4,
    icon: Armchair,
    color: "purple",
    title: "Seat Upgrades",
    desc: "Upgrade to business or first class and loyalty rewards.",
    count: "19 articles",
  },
  {
    id: 5,
    icon: CreditCard,
    color: "green",
    title: "Payments & Refunds",
    desc: "Payment methods, cancellation policies and refund timelines.",
    count: "31 articles",
  },
  {
    id: 6,
    icon: Globe,
    color: "red",
    title: "Special Assistance",
    desc: "Accessibility services, unaccompanied minors and medical needs.",
    count: "24 articles",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    cat: "booking",
    q: "How do I change or cancel my flight booking?",
    a: "You can change or cancel your flight through My Bookings on our website or app up to 2 hours before departure. Fees may apply based on your fare type. Flexible and premium fares allow free changes, while basic economy may incur a fee.",
  },
  {
    id: 2,
    cat: "checkin",
    q: "When does online check-in open?",
    a: "Online check-in opens 48 hours before departure and closes 90 minutes before domestic flights and 60 minutes before international flights. You can check in via our website, mobile app, or airport kiosk.",
  },
  {
    id: 3,
    cat: "baggage",
    q: "What is the baggage allowance for my ticket?",
    a: "Economy class includes 1 carry-on (7 kg) and 1 personal item. Checked baggage allowance varies: Basic allows 1×23 kg, Standard 1×23 kg, and Flex includes 2×23 kg. Additional bags can be added during booking.",
  },
  {
    id: 4,
    cat: "booking",
    q: "Can I select my seat after booking?",
    a: "Yes, you can select or change your seat through Manage Booking at any time before check-in. Premium seats (extra legroom, front rows) are available for an additional fee. Random seat assignment is available for free during check-in.",
  },
  {
    id: 5,
    cat: "payment",
    q: "How long does a refund take to process?",
    a: "Refunds are processed within 7–10 business days for credit/debit cards and 3–5 days for cash payments. During peak periods it may take up to 15 business days. You'll receive an email confirmation once processed.",
  },
  {
    id: 6,
    cat: "checkin",
    q: "What documents do I need at the airport?",
    a: "You'll need a valid government-issued photo ID (passport for international flights) and your boarding pass (digital or printed). Some destinations require additional travel documents — check our destination guide.",
  },
];

const STATUS_ITEMS = [
  {
    name: "Online Booking",
    msg: "All systems operational",
    status: "ok",
    badge: "Operational",
  },
  {
    name: "Mobile App",
    msg: "All systems operational",
    status: "ok",
    badge: "Operational",
  },
  {
    name: "Check-in Kiosks",
    msg: "Minor delays at Terminal B",
    status: "warn",
    badge: "Degraded",
  },
  {
    name: "Flight Info Board",
    msg: "All systems operational",
    status: "ok",
    badge: "Operational",
  },
  {
    name: "Baggage Tracking",
    msg: "System under maintenance",
    status: "down",
    badge: "Outage",
  },
  {
    name: "Live Chat",
    msg: "High volume — avg 8 min wait",
    status: "warn",
    badge: "High Load",
  },
];

const CONTACT_METHODS = [
  {
    icon: Phone,
    method: "Phone Support",
    detail: "1-800-FLY-ALTA\nAvailable in 12 languages",
    avail: "24 / 7",
  },
  {
    icon: MessageCircle,
    method: "Live Chat",
    detail: "Connect with an agent instantly through our app or website",
    avail: "Daily 6AM – Midnight",
  },
  {
    icon: Mail,
    method: "Email Us",
    detail: "support@skyjet.com\nResponse within 4 hours",
    avail: "Response in 4 hrs",
  },
  {
    icon: Twitter,
    method: "Social Media",
    detail: "@SkyjetAirlines on X and Facebook for quick updates",
    avail: "Daily 7AM – 10PM",
  },
];

const ARTICLES = [
  {
    title: "How to add extra baggage to your booking",
    views: "48.2k views",
    tag: "baggage",
  },
  {
    title: "Step-by-step guide: Online check-in",
    views: "41.7k views",
    tag: "checkin",
  },
  {
    title: "Understanding flexible fare policies",
    views: "37.1k views",
    tag: "booking",
  },
  {
    title: "How to request a refund for a cancelled flight",
    views: "33.5k views",
    tag: "payment",
  },
  {
    title: "Seat upgrade options and prices",
    views: "29.8k views",
    tag: "upgrade",
  },
  {
    title: "Travelling with pets: complete guide",
    views: "26.3k views",
    tag: "special",
  },
  {
    title: "Lost or delayed baggage – what to do",
    views: "24.9k views",
    tag: "baggage",
  },
];

/* ───── Component ───── */
export default function HelpCenter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [faqFilter, setFaqFilter] = useState("all");
  const [alertVisible, setAlertVisible] = useState(true);

  const toggleFaq = (id) => setOpenFaq((prev) => (prev === id ? null : id));

  const filteredFaq = FAQ_ITEMS.filter(
    (f) =>
      (faqFilter === "all" || f.cat === faqFilter) &&
      (search === "" || f.q.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="help-center-page">
      <Navbar />
      <Breadcrumb title="Help Center" />

      {/* ── Stats Strip ── */}
      <div className="stats-strip">
        {[
          { num: "99.2%", label: "Customer Satisfaction", icon: Star },
          { num: "< 2 min", label: "Average Response Time", icon: Clock },
          { num: "24 / 7", label: "Support Available", icon: Headphones },
          { num: "180+", label: "Destinations Supported", icon: Globe },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-icon">
              <s.icon size={20} strokeWidth={1.5} />
            </div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main className="help-main">
        {/* Travel Alert */}
        {alertVisible && (
          <div className="alert-banner">
            <span className="alert-icon">
              <AlertCircle size={18} />
            </span>
            <div className="alert-content">
              <div className="alert-title">
                Travel Advisory — Updated March 12, 2026
              </div>
              <div className="alert-text">
                New entry requirements apply to selected Asia-Pacific routes.
                Passengers are advised to carry proof of travel insurance and
                updated vaccination certificates. Visit our Travel Requirements
                page for destination-specific details.
              </div>
            </div>
            <button
              className="alert-close"
              onClick={() => setAlertVisible(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Browse by Topic */}
        <div className="section-heading">
          <span className="section-tag">
            <BookOpen size={12} />
            Browse Topics
          </span>
          <h2>What do you need help with?</h2>
          <p>
            Select a category to find guides and answers specific to your needs.
          </p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.id} href="#" className="cat-card">
                <div className={`cat-icon ${c.color}`}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="cat-title">{c.title}</div>
                <div className="cat-desc">{c.desc}</div>
                <div className="cat-count">{c.count}</div>
                <span className="cat-arrow">
                  <ChevronRight size={16} />
                </span>
              </a>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className="section-heading">
          <span className="section-tag">
            <TrendingUp size={12} />
            Top Articles
          </span>
          <h2>Popular Help Articles</h2>
          <p>The most-read guides from our knowledge base this month.</p>
        </div>

        <div className="articles-list">
          {ARTICLES.map((a, i) => (
            <a key={i} href="#" className="article-item">
              <span className="article-rank">0{i + 1}</span>
              <div className="article-info">
                <div className="article-title">{a.title}</div>
                <div className="article-meta">{a.views}</div>
              </div>
              <span className="article-icon">
                <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>

        {/* Contact Methods */}
        <div className="section-heading">
          <span className="section-tag">
            <MessageSquare size={12} />
            Get in Touch
          </span>
          <h2>Contact Our Support Team</h2>
          <p>
            Choose the channel that works best for you — we're here around the
            clock.
          </p>
        </div>

        <div className="contact-grid">
          {CONTACT_METHODS.map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.method} href="#" className="contact-card">
                <span className="contact-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <div className="contact-method">{c.method}</div>
                <div
                  className="contact-detail"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {c.detail}
                </div>
                <div className="contact-avail">{c.avail}</div>
              </a>
            );
          })}
        </div>

        {/* FAQ Section (Optional - can be uncommented) */}
        {/* <div className="section-heading">
          <span className="section-tag">
            <HelpCircle size={12} />
            Frequently Asked
          </span>
          <h2>Common Questions</h2>
          <p>Quick answers to our most frequently asked questions.</p>
        </div>

        <div className="faq-grid">
          {FAQ_ITEMS.map((faq) => (
            <div
              key={faq.id}
              className={`faq-item ${openFaq === faq.id ? "open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.q}</span>
                <ChevronRight
                  size={16}
                  className={`faq-icon ${openFaq === faq.id ? "open" : ""}`}
                />
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div> */}
      </main>

      <Footer />
    </div>
  );
}
