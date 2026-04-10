import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "Booking",
    items: [
      {
        q: "How early can I check in online?",
        a: "Online check-in opens 48 hours before your scheduled departure and closes 1 hour before. You can download your mobile boarding pass directly from the SkyJet app or website after completing check-in.",
      },
      {
        q: "Can I change or cancel my booking?",
        a: "Yes. Flexible and Premium fare tickets can be changed or cancelled free of charge up to 24 hours before departure. Economy Light fares have a nominal change fee. Full details are available on your booking confirmation.",
      },
      {
        q: "How do I select my seat after booking?",
        a: "You can select or change your seat anytime after booking via My Bookings section. Seat selection is free for Premium and Business class. Economy passengers can select seats during check-in or pay a small fee in advance.",
      },
    ],
  },
  {
    category: "Baggage",
    items: [
      {
        q: "What is the free baggage allowance?",
        a: "Economy class passengers are entitled to 23 kg checked baggage plus 7 kg cabin baggage. Business Class passengers receive 32 kg checked baggage. Additional baggage can be pre-purchased at discounted rates.",
      },
      {
        q: "What items are not allowed in cabin baggage?",
        a: "Liquids over 100ml, sharp objects, flammable items, and lithium batteries above 100Wh are not permitted in cabin baggage. Please check our full prohibited items list before travelling.",
      },
    ],
  },
  {
    category: "Rewards & Upgrades",
    items: [
      {
        q: "How do I earn and redeem SkyRewards miles?",
        a: "Miles are earned on every SkyJet flight based on distance and fare class. You can redeem miles for free flights, seat upgrades, lounge access, and partner benefits. 1 mile = approximately ₹0.50 in value.",
      },
      {
        q: "How does the seat upgrade process work?",
        a: "You can upgrade your seat during booking, online check-in, or at the airport (subject to availability). SkyRewards members can use miles for upgrades. Business Class upgrades are also available via our bid-upgrade system.",
      },
    ],
  },
  {
    category: "Special Services",
    items: [
      {
        q: "Do you offer special assistance for passengers?",
        a: "Absolutely. We provide wheelchair assistance, pre-boarding priority, special meals (diabetic, vegan, kosher, etc.), and unaccompanied minor services. Please request special assistance at least 48 hours before departure.",
      },
      {
        q: "Are there special deals for group bookings?",
        a: "Yes! Groups of 10 or more passengers qualify for special group fares and dedicated customer support. Contact our group bookings team at groups@skyjet.com for a customised quote.",
      },
    ],
  },
];

export default function FAQs() {
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Booking");

  const activeFaqs =
    faqs.find((f) => f.category === activeCategory)?.items || [];

  const toggle = (index) => setOpenItem(openItem === index ? null : index);

  return (
    <section
      id="faqs"
      style={{ background: "#ffffff" }}
      className="px-4 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: "#3366ff" }}
          >
            Got Questions?
          </p>
          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "#0d1526" }}
          >
            Frequently Asked <span style={{ color: "#3366ff" }}>Questions</span>
          </h2>
          <p className="mt-4" style={{ color: "#64748b" }}>
            Everything you need to know about flying with SkyJet
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {faqs.map(({ category }) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setOpenItem(null);
              }}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={
                activeCategory === category
                  ? {
                      background: "#3366ff",
                      color: "#ffffff",
                      boxShadow: "0 4px 16px rgba(51,102,255,0.3)",
                    }
                  : {
                      background: "#f0f4ff",
                      color: "#3366ff",
                      border: "1.5px solid #dde5ff",
                    }
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {activeFaqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl transition-all duration-300"
              style={{
                border:
                  openItem === index
                    ? "1.5px solid #3366ff"
                    : "1.5px solid #e2e6f0",
                background: openItem === index ? "#eff4ff" : "#ffffff",
              }}
            >
              {/* Question */}
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{
                      background: openItem === index ? "#dde5ff" : "#f0f4ff",
                    }}
                  >
                    <HelpCircle
                      className="h-4 w-4"
                      style={{
                        color: openItem === index ? "#3366ff" : "#94a3b8",
                      }}
                    />
                  </div>
                  <span
                    className="font-medium transition-colors"
                    style={{
                      color: openItem === index ? "#3366ff" : "#0d1526",
                    }}
                  >
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className="h-5 w-5 flex-shrink-0 transition-transform duration-300"
                  style={{
                    color: openItem === index ? "#3366ff" : "#94a3b8",
                    transform:
                      openItem === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Answer */}
              <div
                className="transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openItem === index ? "24rem" : "0",
                  opacity: openItem === index ? 1 : 0,
                  overflow: "hidden",
                }}
              >
                <div className="px-6 pb-5 pl-[68px]">
                  <p className="leading-relaxed" style={{ color: "#475569" }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
