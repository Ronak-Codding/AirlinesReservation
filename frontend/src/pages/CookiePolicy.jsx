import { useState, useEffect, useRef } from "react";
import {
  Cookie,
  Settings,
  BarChart3,
  Megaphone,
  X,
  ChevronDown,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Info,
  ExternalLink,
  Sliders,
  RefreshCw,
  Save,
  AlertCircle,
} from "lucide-react";
import "./CookiePolicy.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

const TOC_ITEMS = [
  { id: "what-are-cookies", label: "What Are Cookies" },
  { id: "types-we-use", label: "Types We Use" },
  { id: "cookie-table", label: "Cookie Directory" },
  { id: "third-party", label: "Third-Party Cookies" },
  { id: "your-choices", label: "Your Choices" },
  { id: "updates", label: "Policy Updates" },
  { id: "contact", label: "Contact Us" },
];

const COOKIE_ROWS = [
  {
    name: "session_id",
    type: "Essential",
    purpose: "Maintains your login session during flight search & booking",
    duration: "Session",
    badge: "badge-essential",
  },
  {
    name: "booking_token",
    type: "Essential",
    purpose: "Secures your reservation data during checkout",
    duration: "1 hour",
    badge: "badge-essential",
  },
  {
    name: "currency_pref",
    type: "Functional",
    purpose: "Remembers your preferred currency (USD, EUR, GBP…)",
    duration: "90 days",
    badge: "badge-functional",
  },
  {
    name: "lang_pref",
    type: "Functional",
    purpose: "Stores your language selection across visits",
    duration: "1 year",
    badge: "badge-functional",
  },
  {
    name: "_ga",
    type: "Analytics",
    purpose:
      "Google Analytics — measures site usage and flight-search patterns",
    duration: "2 years",
    badge: "badge-analytics",
  },
  {
    name: "_fbp",
    type: "Marketing",
    purpose: "Facebook Pixel — delivers personalised flight deal ads",
    duration: "90 days",
    badge: "badge-marketing",
  },
  {
    name: "price_watch",
    type: "Functional",
    purpose: "Tracks routes you've searched to show fare alerts",
    duration: "30 days",
    badge: "badge-functional",
  },
  {
    name: "ab_variant",
    type: "Analytics",
    purpose: "Records which UI variant you see for A/B testing",
    duration: "Session",
    badge: "badge-analytics",
  },
];

const ACCORDION_ITEMS = [
  {
    icon: Shield,
    title: "Essential Cookies",
    body: "These cookies are strictly necessary for the skyjet website to function. They enable core features such as passenger authentication, booking session management, and fraud prevention during payment. You cannot opt out of these cookies as the site would not work without them.",
  },
  {
    icon: Settings,
    title: "Functional Cookies",
    body: "Functional cookies enable enhanced, personalised features. For example, remembering your preferred cabin class, meal preferences, or frequent-flyer number so you don't have to re-enter them. Disabling these cookies may mean some features do not work as expected.",
  },
  {
    icon: BarChart3,
    title: "Analytics Cookies",
    body: "We use analytics cookies (Google Analytics, Hotjar) to understand how travellers interact with our booking platform — which search filters are popular, where people drop off in checkout, and how we can improve the experience. All data is aggregated and anonymised.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Advertising Cookies",
    body: "Marketing cookies track your browsing activity to show relevant flight promotions on partner sites. We work with Google Ads, Meta, and select travel affiliates. You can opt out via the Manage Preferences panel at any time.",
  },
];

const TOGGLE_PREFS = [
  {
    id: "essential",
    label: "Essential",
    desc: "Required for booking & security. Always active.",
    disabled: true,
    defaultOn: true,
  },
  {
    id: "functional",
    label: "Functional",
    desc: "Remembers your preferences and personalises your experience.",
    disabled: false,
    defaultOn: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    desc: "Helps us improve the site using anonymous usage data.",
    disabled: false,
    defaultOn: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    desc: "Used to show you relevant flight deals on other sites.",
    disabled: false,
    defaultOn: false,
  },
];

/* ─── Components ─────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="hero">
      <div className="hero-dots" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="dot" />
        ))}
      </div>
      <div className="hero-badge">
        <Shield size={12} />
        Legal & Privacy
      </div>
      <h1 className="hero-title">
        Cookie <span className="accent">Policy</span>
        <span className="line2">Skyjet Airlines</span>
      </h1>
      <p className="hero-subtitle">
        We believe in total transparency about how we use cookies to power your
        booking experience, keep you secure, and make our platform better.
      </p>
      <div className="hero-meta">
        <div className="meta-item">
          <div className="meta-dot" /> Last updated: June 1, 2025
        </div>
        <div className="meta-item">
          <div className="meta-dot" /> Effective: June 1, 2025
        </div>
        <div className="meta-item">
          <div className="meta-dot" /> Version 3.2
        </div>
      </div>
    </section>
  );
}

function TOCSidebar({ active, onSelect, progress }) {
  return (
    <aside className="toc-sidebar" aria-label="Table of contents">
      <div className="toc-title">
        <Info size={14} />
        Contents
      </div>
      <ul className="toc-list">
        {TOC_ITEMS.map((item, i) => (
          <li
            key={item.id}
            className={`toc-item${active === item.id ? " active" : ""}`}
          >
            <button onClick={() => onSelect(item.id)}>
              <span className="toc-num">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="toc-progress">
        <div className="toc-progress-label">Reading progress</div>
        <div className="toc-progress-bar">
          <div
            className="toc-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  return (
    <div className={`accordion-item${open ? " open" : ""}`}>
      <button
        className="accordion-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="accordion-trigger-title">
          <span className="accordion-trigger-icon">
            <Icon size={18} />
          </span>
          {item.title}
        </span>
        <span className="accordion-chevron">
          <ChevronDown size={14} />
        </span>
      </button>
      <div className="accordion-body">
        <p className="accordion-content">{item.body}</p>
      </div>
    </div>
  );
}

function ManageModal({ open, onClose }) {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(TOGGLE_PREFS.map((p) => [p.id, p.defaultOn])),
  );
  const toggle = (id) => setPrefs((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <Sliders size={18} />
            Manage Cookie Preferences
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {TOGGLE_PREFS.map((p) => (
          <div key={p.id} className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">{p.label}</div>
              <div className="toggle-desc">{p.desc}</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs[p.id]}
                disabled={p.disabled}
                onChange={() => !p.disabled && toggle(p.id)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            <Save size={14} />
            Save Preferences
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPrefs(
                Object.fromEntries(TOGGLE_PREFS.map((p) => [p.id, true])),
              );
              onClose();
            }}
          >
            <Check size={14} />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

function ConsentBanner({ onManage, onAccept }) {
  const [hidden, setHidden] = useState(false);
  const accept = () => {
    setHidden(true);
    onAccept();
  };
  if (hidden) return null;
  return (
    <div
      className={`consent-banner${hidden ? " hidden" : ""}`}
      role="region"
      aria-label="Cookie consent"
    >
      <div className="consent-inner">
        <div className="consent-text">
          <p>
            <strong>Skyjet uses cookies</strong> — We use essential,
            functional, analytics, and marketing cookies to keep your booking
            experience seamless and to show you relevant flight deals. By
            continuing, you agree to our{" "}
            <a href="#">Cookie Policy</a>.
          </p>
        </div>
        <div className="consent-actions">
          <button className="btn btn-ghost" onClick={() => setHidden(true)}>
            <X size={12} />
            Reject Optional
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              onManage();
            }}
          >
            <Sliders size={12} />
            Manage
          </button>
          <button className="btn btn-primary" onClick={accept}>
            <Check size={12} />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState(TOC_ITEMS[0].id);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const contentRef = useRef(null);

  // scroll spy + progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));

      for (const item of [...TOC_ITEMS].reverse()) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(item.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="cookie-policy-page">
        <Navbar />
        <Breadcrumb title="Cookie Policy" />
        <div className="page-wrap">
          <TOCSidebar
            active={activeSection}
            onSelect={scrollTo}
            progress={progress}
          />

          <main className="content-area" ref={contentRef}>
            {/* Intro */}
            <div className="intro-card">
              <div className="intro-icon">
                <Cookie size={28} />
              </div>
              <p>
                This Cookie Policy explains how{" "}
                <strong>Skyjet Airlines Ltd</strong> ("we", "us", "our") uses
                cookies and similar tracking technologies when you use our
                website at <strong>skyjet.com</strong> — including flight
                search, booking, check-in, and account management. Please read
                this policy alongside our <a href="#">Privacy Policy</a>.
              </p>
            </div>

            {/* 1 */}
            <section id="what-are-cookies" className="policy-section">
              <div className="section-header">
                <div className="section-number">1</div>
                <h2 className="section-title">What Are Cookies?</h2>
              </div>
              <div className="section-body">
                <p>
                  Cookies are small text files that a website saves on your
                  browser or device when you visit. They are widely used to make
                  websites work efficiently and to provide information to the
                  site's owners.
                </p>
                <p>
                  In addition to cookies, we may use <strong>pixel tags</strong>{" "}
                  (web beacons), <strong>local storage</strong>, and{" "}
                  <strong>session storage</strong> — collectively referred to as
                  "cookies" in this policy — to collect information about how
                  you interact with our booking platform.
                </p>
                <p>
                  Cookies can be <em>first-party</em> (set by Skyjet directly)
                  or <em>third-party</em> (set by our trusted partners such as
                  payment processors and analytics providers). They can be{" "}
                  <em>session cookies</em> (deleted when you close your browser)
                  or <em>persistent cookies</em> (which remain for a defined
                  period).
                </p>
              </div>
            </section>

            {/* 2 */}
            <section id="types-we-use" className="policy-section">
              <div className="section-header">
                <div className="section-number">2</div>
                <h2 className="section-title">Types We Use</h2>
              </div>
              <div className="section-body">
                <p>
                  We use four categories of cookies, each serving a different
                  purpose in delivering your Skyjet experience:
                </p>
              </div>
              <div className="accordion">
                {ACCORDION_ITEMS.map((item) => (
                  <AccordionItem key={item.title} item={item} />
                ))}
              </div>
            </section>

            {/* 3 */}
            <section id="cookie-table" className="policy-section">
              <div className="section-header">
                <div className="section-number">3</div>
                <h2 className="section-title">Cookie Directory</h2>
              </div>
              <div className="section-body">
                <p>
                  The table below lists the specific cookies we currently set on
                  skyjet.com:
                </p>
              </div>
              <div className="cookie-table-wrap">
                <table className="cookie-table">
                  <thead>
                    <tr>
                      <th>Cookie Name</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_ROWS.map((row) => (
                      <tr key={row.name}>
                        <td>
                          <code>{row.name}</code>
                        </td>
                        <td>
                          <span className={`badge ${row.badge}`}>
                            {row.type}
                          </span>
                        </td>
                        <td>{row.purpose}</td>
                        <td className="duration-cell">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4 */}
            <section id="third-party" className="policy-section">
              <div className="section-header">
                <div className="section-number">4</div>
                <h2 className="section-title">Third-Party Cookies</h2>
              </div>
              <div className="section-body">
                <p>
                  Certain features on our site embed content or scripts from
                  trusted third-party providers. These providers may set their
                  own cookies on your device, subject to their own privacy
                  policies. Our key third-party providers include:
                </p>
                <p>
                  <strong>Google Analytics &amp; Ads</strong> — Usage analytics
                  and remarketing ads. Learn more:{" "}
                  <a
                    href="https://policies.google.com/technologies/cookies"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Cookie Policy
                    <ExternalLink size={12} />
                  </a>
                  .
                </p>
                <p>
                  <strong>Meta (Facebook) Pixel</strong> — Conversion tracking
                  and custom audience targeting. Learn more:{" "}
                  <a
                    href="https://www.facebook.com/policy/cookies"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Meta Cookie Policy
                    <ExternalLink size={12} />
                  </a>
                  .
                </p>
                <p>
                  <strong>Stripe</strong> — Payment processing. Stripe uses
                  cookies solely for fraud detection and security during
                  transactions.
                </p>
                <p>
                  <strong>Hotjar</strong> — Heatmaps and session recordings
                  (anonymised) to improve our booking funnel. You can opt out at{" "}
                  <a
                    href="https://www.hotjar.com/legal/compliance/opt-out"
                    target="_blank"
                    rel="noreferrer"
                  >
                    hotjar.com/opt-out
                    <ExternalLink size={12} />
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* 5 */}
            <section id="your-choices" className="policy-section">
              <div className="section-header">
                <div className="section-number">5</div>
                <h2 className="section-title">Your Choices</h2>
              </div>
              <div className="section-body">
                <p>
                  You have full control over non-essential cookies. You can
                  manage your preferences at any time using the button below,
                  which opens our cookie preference centre:
                </p>
                <p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => setModalOpen(true)}
                  >
                    <Sliders size={14} />
                    Manage Cookie Preferences
                  </button>
                </p>
                <p style={{ marginTop: "1rem" }}>
                  You can also control cookies through your{" "}
                  <strong>browser settings</strong>. Most browsers allow you to
                  refuse cookies, delete existing cookies, and set preferences
                  for specific sites. Note that disabling essential cookies will
                  prevent the booking process from working correctly.
                </p>
                <p>
                  For opt-out links for specific advertising networks, visit{" "}
                  <a
                    href="https://www.youronlinechoices.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Your Online Choices
                    <ExternalLink size={12} />
                  </a>{" "}
                  (EU) or the{" "}
                  <a
                    href="https://optout.networkadvertising.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NAI opt-out page
                    <ExternalLink size={12} />
                  </a>{" "}
                  (US).
                </p>
              </div>
            </section>

            {/* 6 */}
            <section id="updates" className="policy-section">
              <div className="section-header">
                <div className="section-number">6</div>
                <h2 className="section-title">Policy Updates</h2>
              </div>
              <div className="section-body">
                <p>
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices, technology, legal requirements, or
                  other factors. When we make material changes, we will update
                  the "Last updated" date at the top of this page and, where
                  appropriate, notify you via email or an in-site banner.
                </p>
                <p>
                  We encourage you to review this page periodically. Your
                  continued use of the Skyjet website after any update
                  constitutes your acceptance of the revised policy.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section id="contact" className="policy-section">
              <div className="section-header">
                <div className="section-number">7</div>
                <h2 className="section-title">Contact Us</h2>
              </div>
              <div className="section-body">
                <p>
                  If you have questions about this Cookie Policy or our data
                  practices, please contact our Data Protection Officer:
                </p>
                <div className="contact-info">
                  <p>
                    <strong>Skyjet Airlines — Data Protection Office</strong>
                  </p>
                  <p>
                    <Mail size={14} />
                    <a href="mailto:privacy@skyjet.com">privacy@skyjet.com</a>
                  </p>
                  <p>
                    <MapPin size={14} />
                    Skyjet House, Terminal 2, London Heathrow, TW6 1AP, United
                    Kingdom
                  </p>
                  <p>
                    <Phone size={14} />
                    +44 (0) 20 7946 0321
                  </p>
                </div>
                <p>
                  You also have the right to lodge a complaint with the UK
                  Information Commissioner's Office (ICO) at{" "}
                  <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
                    ico.org.uk
                    <ExternalLink size={12} />
                  </a>{" "}
                  or the relevant supervisory authority in your country of
                  residence.
                </p>
              </div>
            </section>
          </main>
        </div>

        <Footer />

        <ConsentBanner
          onManage={() => setModalOpen(true)}
          onAccept={() => {}}
        />
        <ManageModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </>
  );
}