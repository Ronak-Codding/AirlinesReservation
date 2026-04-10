import { useState, useEffect, useRef } from "react";
import {
  Linkedin,
  Twitter,
  Mail,
  Shield,
  Clock,
  Smile,
  Globe,
  Target,
  Eye,
  CheckCircle,
  Award,
  TrendingUp,
  Users,
  MapPin,
  Star,
  ChevronRight,
  Plane,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "../components/Breadcrumb";
import "./About.css";

/* ─── DATA ─────────────────────────────────────────────── */

const teamMembers = [
  {
    name: "John Smith",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
    bio: "20+ years in aviation industry",
    social: { linkedin: "#", twitter: "#", email: "#" },
  },
  {
    name: "Sarah Johnson",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
    bio: "Former airline executive",
    social: { linkedin: "#", twitter: "#", email: "#" },
  },
  {
    name: "Michael Chen",
    role: "Customer Experience Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    bio: "Hospitality expert",
    social: { linkedin: "#", twitter: "#", email: "#" },
  },
];

const values = [
  {
    Icon: Shield,
    title: "Safety First",
    description:
      "Your safety is our top priority with rigorous maintenance and training standards.",
  },
  {
    Icon: Clock,
    title: "Punctuality",
    description:
      "We pride ourselves on on-time performance and efficient operations.",
  },
  {
    Icon: Smile,
    title: "Customer Focus",
    description: "Exceptional service that makes every journey memorable.",
  },
  {
    Icon: Globe,
    title: "Global Reach",
    description: "Connecting you to destinations across the world.",
  },
];

const stats = [
  { Icon: MapPin, value: "150+", label: "Destinations" },
  { Icon: Users, value: "2M+", label: "Happy Travelers" },
  { Icon: TrendingUp, value: "99.2%", label: "On-time Rate" },
  { Icon: Plane, value: "16+", label: "Years of Service" },
];

const timeline = [
  {
    year: "2008",
    title: "Founded",
    desc: "Skyjet Airlines launched with 3 aircraft and 5 regional routes.",
  },
  {
    year: "2011",
    title: "Fleet Expansion",
    desc: "Expanded to 20 aircraft and entered international markets.",
  },
  {
    year: "2014",
    title: "Award Winner",
    desc: "Received 'Best Regional Airline' award for three consecutive years.",
  },
  {
    year: "2017",
    title: "Digital Transformation",
    desc: "Launched mobile app and online check-in for seamless travel.",
  },
  {
    year: "2020",
    title: "Sustainability Pledge",
    desc: "Committed to net-zero carbon emissions by 2040.",
  },
  {
    year: "2024",
    title: "Global Network",
    desc: "Now serving 150+ destinations across 6 continents.",
  },
];

const awards = [
  {
    Icon: Award,
    title: "Best Regional Airline",
    org: "Skytrax World Airline Awards",
    year: "2023",
  },
  {
    Icon: Star,
    title: "5-Star Safety Rating",
    org: "IATA Safety Audit (IOSA)",
    year: "2023",
  },
  {
    Icon: Shield,
    title: "Excellence in Customer Service",
    org: "Aviation Business Awards",
    year: "2022",
  },
  {
    Icon: Globe,
    title: "Green Aviation Pioneer",
    org: "Global Sustainability Forum",
    year: "2022",
  },
];

const partners = [
  { name: "Emirates", abbr: "EK", color: "#C60C30", bg: "#fff0f3" },
  { name: "Air India", abbr: "AI", color: "#E4002B", bg: "#fff0f3" },
  { name: "Singapore Airlines", abbr: "SQ", color: "#0033A0", bg: "#eef2ff" },
  { name: "Qatar Airways", abbr: "QR", color: "#5C0632", bg: "#f5eef3" },
  { name: "Lufthansa", abbr: "LH", color: "#05164D", bg: "#eef2ff" },
  { name: "British Airways", abbr: "BA", color: "#2B3B8A", bg: "#eef2ff" },
  { name: "IndiGo", abbr: "6E", color: "#0A2172", bg: "#eef2ff" },
  { name: "Air France", abbr: "AF", color: "#002157", bg: "#eef2ff" },
];

/* ─── COUNTER HOOK ──────────────────────────────────────── */
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isPercent = String(target).includes("%");
    const num = parseInt(String(target).replace(/[^0-9]/g, ""));
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  const suffix = String(target).replace(/[0-9]/g, "");
  return count + suffix;
}

/* ─── STAT CARD ─────────────────────────────────────────── */
function StatCard({ Icon, value, label, animate }) {
  const display = useCounter(value, 1800, animate);
  return (
    <div className="ab-stat-card">
      <div className="ab-stat-icon">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <p className="ab-stat-value">{display}</p>
      <p className="ab-stat-label">{label}</p>
    </div>
  );
}

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function About() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="ab-page">
        {/* ── BREADCRUMB ── */}
        <Breadcrumb title="About Us" />

        {/* ── MISSION & VISION ── */}
        <section className="ab-section ab-mission-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">Who We Are</span>
              <h2 className="ab-section-title">Driven by Purpose</h2>
            </div>
            <div className="ab-mission-grid">
              <div className="ab-mission-card">
                <div className="ab-mission-icon">
                  <Target size={28} strokeWidth={1.8} />
                </div>
                <h3>Our Mission</h3>
                <p>
                  To provide safe, reliable, and comfortable air travel
                  experiences that connect people and cultures while maintaining
                  the highest standards of service excellence.
                </p>
              </div>
              <div className="ab-mission-card ab-mission-card--alt">
                <div className="ab-mission-icon ab-mission-icon--alt">
                  <Eye size={28} strokeWidth={1.8} />
                </div>
                <h3>Our Vision</h3>
                <p>
                  To become the world's most trusted and preferred airline,
                  known for innovation, sustainability, and exceptional customer
                  experiences in every journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="ab-stats-section" ref={statsRef}>
          <div className="ab-container">
            <div className="ab-stats-grid">
              {stats.map((s, i) => (
                <StatCard key={i} {...s} animate={statsVisible} />
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="ab-section ab-story-section">
          <div className="ab-container">
            <div className="ab-story-grid">
              <div className="ab-story-text">
                <span className="ab-eyebrow">Our Story</span>
                <h2 className="ab-section-title ab-section-title--left">
                  Our Journey
                </h2>
                <p className="ab-story-para">
                  Founded in 2008, Skyjet Airlines began with a simple vision:
                  to make air travel accessible, comfortable, and enjoyable for
                  everyone. What started as a small fleet of 3 aircraft serving
                  regional routes has grown into one of the most respected
                  airlines in the industry.
                </p>
                <p className="ab-story-para">
                  Over the years, we've carried millions of passengers to their
                  dream destinations, built lasting relationships with our
                  customers, and maintained an impeccable safety record. Our
                  commitment to innovation has led us to introduce
                  state-of-the-art aircraft, cutting-edge entertainment systems,
                  and sustainable practices that reduce our environmental
                  footprint.
                </p>
                <div className="ab-story-features">
                  {["Modern Fleet", "Expert Crew", "Global Network"].map(
                    (f) => (
                      <div className="ab-story-feature" key={f}>
                        <CheckCircle
                          size={17}
                          strokeWidth={2}
                          className="ab-check"
                        />
                        <span>{f}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="ab-story-image">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
                  alt="Airplane flying"
                />
                <div className="ab-story-badge">
                  <Plane size={20} strokeWidth={1.8} />
                  <span>16+ Years in the Sky</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="ab-section ab-timeline-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">History</span>
              <h2 className="ab-section-title">Company Timeline</h2>
              <p className="ab-section-sub">
                Milestones that shaped who we are today.
              </p>
            </div>
            <div className="ab-timeline">
              {timeline.map((item, i) => (
                <div
                  className={`ab-timeline-item ${i % 2 === 0 ? "ab-tl-left" : "ab-tl-right"}`}
                  key={i}
                >
                  <div className="ab-tl-dot">
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </div>
                  <div className="ab-tl-card">
                    <span className="ab-tl-year">{item.year}</span>
                    <h4 className="ab-tl-title">{item.title}</h4>
                    <p className="ab-tl-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="ab-tl-line" />
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="ab-section ab-values-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">What We Stand For</span>
              <h2 className="ab-section-title">Our Core Values</h2>
              <p className="ab-section-sub">
                The principles that guide everything we do.
              </p>
            </div>
            <div className="ab-values-grid">
              {values.map(({ Icon, title, description }, i) => (
                <div className="ab-value-card" key={i}>
                  <div className="ab-value-icon">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className="ab-value-title">{title}</h3>
                  <p className="ab-value-desc">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AWARDS ── */}
        <section className="ab-section ab-awards-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">Recognition</span>
              <h2 className="ab-section-title">Awards & Certifications</h2>
              <p className="ab-section-sub">
                Industry recognition for our commitment to excellence.
              </p>
            </div>
            <div className="ab-awards-grid">
              {awards.map(({ Icon, title, org, year }, i) => (
                <div className="ab-award-card" key={i}>
                  <div className="ab-award-icon">
                    <Icon size={28} strokeWidth={1.6} />
                  </div>
                  <div className="ab-award-info">
                    <h4 className="ab-award-title">{title}</h4>
                    <p className="ab-award-org">{org}</p>
                    <span className="ab-award-year">{year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="ab-section ab-team-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">The People</span>
              <h2 className="ab-section-title">Meet Our Leadership</h2>
              <p className="ab-section-sub">
                Dedicated professionals committed to your comfort and safety.
              </p>
            </div>
            <div className="ab-team-grid">
              {teamMembers.map((member, i) => (
                <div className="ab-team-card" key={i}>
                  <div className="ab-team-avatar">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="ab-team-info">
                    <h3 className="ab-team-name">{member.name}</h3>
                    <p className="ab-team-role">{member.role}</p>
                    <span className="ab-team-bio">{member.bio}</span>
                    <div className="ab-team-socials">
                      <a
                        href={member.social.linkedin}
                        className="ab-social-btn"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={15} strokeWidth={2} />
                      </a>
                      <a
                        href={member.social.twitter}
                        className="ab-social-btn"
                        aria-label="Twitter"
                      >
                        <Twitter size={15} strokeWidth={2} />
                      </a>
                      <a
                        href={member.social.email}
                        className="ab-social-btn"
                        aria-label="Email"
                      >
                        <Mail size={15} strokeWidth={2} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTNERS ── */}
        <section className="ab-section ab-partners-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-eyebrow">Trusted By</span>
              <h2 className="ab-section-title">Airline Partners</h2>
              <p className="ab-section-sub">
                We work with the world's leading airlines to bring you the best
                network coverage.
              </p>
            </div>
            <div className="ab-partners-track-wrap">
              <div className="ab-partners-track">
                {[...partners, ...partners].map((p, i) => (
                  <div
                    className="ab-partner-logo"
                    key={i}
                    style={{ background: p.bg }}
                  >
                    <span
                      className="ab-partner-abbr"
                      style={{ color: p.color }}
                    >
                      {p.abbr}
                    </span>
                    <span
                      className="ab-partner-name"
                      style={{ color: p.color }}
                    >
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        {/* <section className="ab-cta-section">
          <div className="ab-container">
            <div className="ab-cta-box">
              <Plane size={36} strokeWidth={1.5} className="ab-cta-plane" />
              <h2 className="ab-cta-title">Ready to Fly With Us?</h2>
              <p className="ab-cta-sub">
                Experience the Skyjet difference. Book your next journey today.
              </p>
              <button className="ab-cta-btn">
                Book Your Flight <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section> */}
      </div>
      <Footer />
    </>
  );
}
