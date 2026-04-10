import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import "./PrivacyPolicy.css";

const sections = [
  {
    id: "information-collected",
    title: "Information We Collect",
    icon: "✦",
    content: [
      {
        subtitle: "Personal Identification Data",
        text: "We collect your full name, date of birth, passport or national ID number, nationality, and contact details including email address and phone number when you create an account or make a reservation.",
      },
      {
        subtitle: "Travel & Booking Information",
        text: "Flight preferences, seat selections, baggage options, meal preferences, frequent flyer numbers, and travel history are stored to personalize your experience and fulfill your reservations.",
      },
      {
        subtitle: "Payment Information",
        text: "Credit/debit card numbers, billing addresses, and transaction histories are collected through PCI-DSS compliant encrypted channels. We do not store full card numbers on our servers.",
      },
      {
        subtitle: "Technical Data",
        text: "IP addresses, browser type, operating system, device identifiers, cookies, and browsing behavior on our platform are automatically collected to improve our services and detect fraud.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    icon: "◈",
    content: [
      {
        subtitle: "Reservation Processing",
        text: "Your data is used to confirm bookings, issue e-tickets, process check-ins, manage itinerary changes, and coordinate with partner airlines, hotels, and ground transportation providers.",
      },
      {
        subtitle: "Customer Service",
        text: "We use your information to resolve complaints, provide support, send booking confirmations, flight updates, delay notifications, and important safety communications.",
      },
      {
        subtitle: "Personalization",
        text: "Based on your travel history and preferences, we may recommend relevant destinations, upgrades, loyalty programs, and special offers tailored to your profile.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We share passenger name records (PNR) with government agencies, customs, border protection, and immigration authorities as mandated by applicable laws and regulations.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "Data Sharing & Disclosure",
    icon: "⬡",
    content: [
      {
        subtitle: "Partner Airlines & Codeshares",
        text: "For interline and codeshare flights, necessary passenger information is shared with operating carriers to complete your journey and provide a seamless travel experience.",
      },
      {
        subtitle: "Third-Party Service Providers",
        text: "We work with vetted partners for payment processing, IT infrastructure, analytics, and marketing. These parties are contractually bound to protect your data and use it only for specified purposes.",
      },
      {
        subtitle: "Regulatory Authorities",
        text: "Advance Passenger Information (API) and Passenger Name Records (PNR) are transmitted to government authorities of departure, transit, and destination countries as required by law.",
      },
      {
        subtitle: "Business Transfers",
        text: "In the event of a merger, acquisition, or sale of assets, passenger data may be transferred as part of the transaction, subject to equivalent privacy protections.",
      },
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: "⬟",
    content: [
      {
        subtitle: "Encryption Standards",
        text: "All data transmitted through our platforms is protected using TLS 1.3 encryption. Sensitive data at rest is encrypted using AES-256 standards. Our systems undergo regular third-party security audits.",
      },
      {
        subtitle: "Access Controls",
        text: "Employee access to personal data is strictly role-based, logged, and monitored. Only personnel with legitimate business need can access passenger information.",
      },
      {
        subtitle: "Breach Response",
        text: "In the unlikely event of a data breach, we will notify affected individuals and relevant authorities within 72 hours as required by applicable data protection regulations.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: "◇",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to request a copy of all personal data we hold about you, in a structured, machine-readable format, free of charge, within 30 days of your request.",
      },
      {
        subtitle: "Rectification",
        text: "If any information we hold is inaccurate or incomplete, you have the right to request immediate correction. For flight bookings, please contact us at least 24 hours before departure.",
      },
      {
        subtitle: "Erasure",
        text: "You may request deletion of your personal data, subject to our legal obligations to retain certain records (e.g., financial transactions, safety records) for specified minimum periods.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of marketing communications at any time via your account settings or by clicking 'unsubscribe' in any promotional email. Transactional messages related to your bookings cannot be disabled.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    icon: "◉",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "These are necessary for our website to function and cannot be switched off. They are set in response to your actions such as logging in, filling forms, or setting preferences.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "We use analytics tools to understand how visitors interact with our site, which helps us improve our digital services. This data is aggregated and anonymized.",
      },
      {
        subtitle: "Marketing Cookies",
        text: "With your consent, we use targeting cookies to deliver relevant advertisements across the web. You can manage these preferences through our Cookie Preference Center.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact & Complaints",
    icon: "◎",
    content: [
      {
        subtitle: "Data Protection Officer",
        text: "Our dedicated Data Protection Officer oversees all privacy matters. Contact our DPO at privacy@skyreserve.com or by writing to: SkyReserve Airlines, Data Privacy Office, Terminal 1, International Airport Boulevard.",
      },
      {
        subtitle: "Regulatory Complaints",
        text: "If you are unsatisfied with our response, you have the right to lodge a complaint with your national data protection authority. In the EU, this is your local Supervisory Authority under GDPR.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    setActiveSection(id);
  };

  return (
    <div className="privacy-policy-page">
      {/* NAV */}
      <Navbar />

      <Breadcrumb title="Privacy Policy" />
      {/* MAIN */}
      <div className="main-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-title">Contents</div>
          <nav className="sidebar-nav">
            {sections.map((s) => (
              <button
                key={s.id}
                className={`sidebar-item${activeSection === s.id ? " active" : ""}`}
                onClick={() => {
                  setActiveSection(s.id);
                  document
                    .getElementById(s.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span className="item-icon">{s.icon}</span>
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="content">
          <div className="intro-block">
            <p>
              SkyJet Airlines (<strong>"we," "us," or "our"</strong>) is
              committed to protecting your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              data when you use our reservation services, website, or mobile
              application. By booking with us, you agree to the practices
              described herein. We encourage you to read this document
              carefully.
            </p>
          </div>

          {sections.map((section) => {
            const isOpen =
              expandedSections[section.id] !== false &&
              expandedSections[section.id] !== undefined
                ? expandedSections[section.id]
                : true;

            return (
              <div key={section.id} id={section.id} className="section-card">
                <button
                  className={`section-header${isOpen ? " open" : ""}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="section-header-left">
                    <div className="section-icon">{section.icon}</div>
                    <span className="section-title">{section.title}</span>
                  </div>
                  <div className={`section-toggle${isOpen ? " open" : ""}`}>
                    ▼
                  </div>
                </button>

                {isOpen && (
                  <div className="section-body">
                    {section.content.map((item, i) => (
                      <div key={i} className="sub-item">
                        <h4>{item.subtitle}</h4>
                        <p>{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>

      {/* LAST UPDATED */}
      <div className="last-updated">
        <p>
          This policy was last updated on <strong>March 1, 2026</strong>. We
          reserve the right to amend this policy at any time. Material changes
          will be communicated via email or a prominent notice on our website at
          least 30 days prior to taking effect.
        </p>
      </div>

      <Footer />
    </div>
  );
}
