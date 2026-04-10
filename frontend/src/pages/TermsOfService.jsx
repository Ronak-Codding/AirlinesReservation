import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import "./TermsOfService.css";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    content: `By accessing or using Skyjet Airlines Reservation Services ("the Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you ("Passenger" or "User") and Skyjet Airlines, Inc. ("Skyjet," "we," "us," or "our").

If you do not agree with any part of these Terms, you must discontinue use of the Service immediately. Continued use of our reservation platform following any modifications to these Terms constitutes your acceptance of the revised Terms.

These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and contributors of content.`,
  },
  {
    id: "reservations",
    number: "02",
    title: "Reservation & Booking Policy",
    content: `All flight reservations made through Skyjet are subject to availability and fare conditions at the time of booking. Reservations are not confirmed until full payment is received and a booking confirmation number has been issued.

Passengers are responsible for ensuring all personal information submitted during booking — including legal name, date of birth, passport details, and contact information — is accurate and matches official identification documents. Skyjet is not liable for denied boarding or refused entry resulting from inaccurate passenger data.

Prices displayed are inclusive of base fare and applicable taxes unless otherwise stated. Additional fees may apply for seat selection, baggage, meal preferences, and other optional services. Booking fees are non-refundable once a transaction has been completed.`,
  },
  {
    id: "cancellations",
    number: "03",
    title: "Cancellations & Modifications",
    content: `Cancellation and modification policies vary by fare class and ticket type. Refundable tickets may be cancelled for a full or partial refund subject to applicable service charges. Non-refundable tickets are not eligible for monetary refunds but may qualify for travel credit at Skyjet's discretion.

Changes to existing reservations, including date, time, or destination modifications, are subject to fare difference charges and applicable change fees. Modifications must be requested no later than 24 hours prior to scheduled departure. Same-day changes are subject to availability and additional fees.

In the event that Skyjet cancels or significantly alters a flight, passengers are entitled to a full refund of the original fare or rebooking on the next available flight at no additional charge. Skyjet is not responsible for incidental expenses incurred by passengers as a result of flight disruptions.`,
  },
  {
    id: "baggage",
    number: "04",
    title: "Baggage Policy",
    content: `Baggage allowances are determined by your fare class and frequent flyer status. Carry-on baggage is limited to one item not exceeding 10kg (22 lbs) and fitting within the overhead compartment dimensions of 55 × 40 × 23 cm. One personal item such as a handbag or laptop bag is permitted under the seat.

Checked baggage fees apply based on weight, size, and the number of bags checked. Oversize and overweight items are subject to additional charges. Prohibited items, including hazardous materials, flammable substances, and restricted goods, may not be transported under any circumstances.

Skyjet accepts limited liability for lost, delayed, or damaged baggage in accordance with applicable international conventions. Passengers are advised to retain baggage receipts and report any issues at the destination airport's baggage service desk within 7 days of arrival.`,
  },
  {
    id: "conduct",
    number: "05",
    title: "Passenger Conduct",
    content: `All passengers are expected to conduct themselves in a manner that is respectful, lawful, and considerate of the safety and comfort of other passengers and crew members. Skyjet reserves the right to refuse service or remove any passenger from a flight for behavior deemed disruptive, threatening, or in violation of applicable laws.

Passengers must comply with all instructions issued by the flight crew, airport staff, and relevant security authorities. The consumption of excessive alcohol, use of unauthorized electronic devices, and interference with aircraft equipment are strictly prohibited.

Verbal or physical abuse directed at Skyjet staff or fellow passengers will result in immediate removal from the aircraft, potential ban from future travel, and may be reported to law enforcement authorities. Skyjet will not provide refunds to passengers removed due to misconduct.`,
  },
  {
    id: "privacy",
    number: "06",
    title: "Privacy & Data Use",
    content: `Skyjet collects and processes personal data in accordance with our Privacy Policy and applicable data protection laws. By using the Service, you consent to the collection, storage, and processing of your personal information for the purposes of reservation management, customer service, marketing communications (where opted in), and legal compliance.

Passenger data may be shared with third parties including partner airlines, airport authorities, customs and immigration agencies, and payment processors solely as required to provide the Service or comply with legal obligations. We do not sell personal data to unaffiliated third parties for advertising purposes.

You retain the right to access, correct, or request deletion of your personal data subject to applicable law. To exercise these rights or to opt out of marketing communications, contact our Data Protection Officer at privacy@Skyjet.com.`,
  },
  {
    id: "liability",
    number: "07",
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, Skyjet's total liability to any passenger for any claim arising from or related to these Terms or the Service shall not exceed the total amount paid by the passenger for the specific transaction giving rise to the claim.

Skyjet shall not be liable for indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, loss of goodwill, or service interruption, regardless of the cause or theory of liability. This limitation applies even if Skyjet has been advised of the possibility of such damages.

Nothing in these Terms shall limit or exclude liability for death or personal injury caused by Skyjet's negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited under applicable law.`,
  },
  {
    id: "governing",
    number: "08",
    title: "Governing Law & Disputes",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any dispute arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in Wilmington, Delaware.

Before initiating formal proceedings, both parties agree to attempt resolution through good-faith negotiation for a period of 30 days following written notice of the dispute. If mediation is unsuccessful, disputes shall be resolved through binding arbitration conducted under the rules of the American Arbitration Association.

Class action lawsuits and class-wide arbitration are waived. Each party agrees to pursue claims on an individual basis only. This waiver is a material term of these Terms, and its invalidity shall not affect the enforceability of the remaining arbitration provisions.`,
  },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastScrollY = useRef(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollY / docHeight) * 100);
      setHeaderVisible(scrollY < lastScrollY.current || scrollY < 80);
      lastScrollY.current = scrollY;

      const sectionEls = sections.map((s) => document.getElementById(s.id));
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        if (sectionEls[i] && sectionEls[i].getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
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
    setMobileNavOpen(false);
  };

  return (
    <>
      <div className="terms-of-service-page">
        <Navbar />

        {/* Hero */}
        <Breadcrumb title="Term of Service" />
        {/* <section className="hero">
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-eyebrow">Legal Documentation</div>
          <h1>Terms of <span>Service</span></h1>
          <p className="hero-desc">
            Please read these terms carefully before using Skyjet's reservation
            platform. They outline your rights, responsibilities, and the conditions
            governing your use of our services.
          </p>
          <div className="hero-meta">
            <div className="meta-item"><div className="meta-dot" />Effective: January 1, 2025</div>
            <div className="meta-item"><div className="meta-dot" />Version 4.2</div>
            <div className="meta-item"><div className="meta-dot" />8 Sections</div>
          </div>
        </div>
      </section> */}

        {/* Main layout */}
        <main className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <p className="sidebar-label">Contents</p>
            <ul className="nav-list">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className={`nav-item${activeSection === s.id ? " active" : ""}`}
                >
                  <button onClick={() => scrollTo(s.id)}>
                    <span className="nav-num">{s.number}</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
            <div className="sidebar-divider" />
            <div className="sidebar-notice">
              <p>
                <strong>Questions?</strong> For legal inquiries, contact{" "}
                <strong>legal@Skyjet.com</strong> or call our passenger services
                team at 1-800-SKY-VAULT.
              </p>
            </div>
          </aside>

          {/* Content */}
          <div className="content" ref={contentRef}>
            {sections.map((s) => (
              <article className="section-card" key={s.id} id={s.id}>
                <div className="section-header">
                  <span className="section-num-badge">{s.number}</span>
                  <h2 className="section-title">{s.title}</h2>
                </div>
                <div className="section-body">
                  {s.content.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
