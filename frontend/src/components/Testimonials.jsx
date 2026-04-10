import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Frequent Flyer · Gold Member",
    avatar: "PS",
    stars: 5,
    text: "SkyJet completely transformed my travel experience. The seamless online check-in, premium seat selection and the loyalty rewards made every trip feel first class. Highly recommend!",
  },
  {
    name: "Rahul Mehta",
    role: "Business Traveler",
    avatar: "RM",
    stars: 5,
    text: "I travel twice a month for work and SkyJet is my go-to airline. The app is flawless, customer support is lightning fast, and the Business Class deal saved me a fortune this quarter.",
  },
  {
    name: "Amelia Johnson",
    role: "Solo Traveler",
    avatar: "AJ",
    stars: 5,
    text: "Booked a last-minute trip to Bali and SkyJet had the best prices with incredible service. The in-flight meal I pre-ordered was genuinely delicious. Will fly with them again!",
  },
  {
    name: "Vikram Singh",
    role: "Family Travel Enthusiast",
    avatar: "VS",
    stars: 4,
    text: "Traveling with three kids used to be a nightmare. SkyJet's family check-in and group seating made it so smooth. The baggage tracking feature gave us peace of mind throughout.",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ background: "#f6f8ff" }} className="px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: "#3366ff" }}
          >
            Traveler Stories
          </p>
          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "#0d1526" }}
          >
            What Our <span style={{ color: "#3366ff" }}>Guests Say</span>
          </h2>
        </div>

        {/* Active Testimonial Card */}
        <div
          className="relative mb-6 overflow-hidden rounded-2xl p-8"
          style={{
            background: "#ffffff",
            border: "1px solid #dde5ff",
            boxShadow: "0 8px 32px rgba(51,102,255,0.08)",
          }}
        >
          {/* Top gradient bar */}
          <div
            className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #3366ff, #3b2fc9)" }}
          />

          {/* Quote */}
          <div
            className="mb-4 text-5xl leading-none"
            style={{ color: "#3366ff", opacity: 0.35 }}
          >
            "
          </div>

          <p
            className="mb-8 text-base italic leading-relaxed md:text-lg"
            style={{ color: "#475569" }}
          >
            {testimonials[active].text}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #3366ff, #3b2fc9)",
                }}
              >
                {testimonials[active].avatar}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#0d1526" }}>
                  {testimonials[active].name}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {testimonials[active].role}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1">
              {Array(testimonials[active].stars)
                .fill("★")
                .map((_, i) => (
                  <span
                    key={i}
                    className="text-lg"
                    style={{ color: "#3366ff" }}
                  >
                    ★
                  </span>
                ))}
              {Array(5 - testimonials[active].stars)
                .fill("★")
                .map((_, i) => (
                  <span
                    key={i}
                    className="text-lg"
                    style={{ color: "#e2e6f0" }}
                  >
                    ★
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="mb-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === active ? "2rem" : "0.5rem",
                background: i === active ? "#3366ff" : "#dde5ff",
              }}
            />
          ))}
        </div>

        {/* Testimonial Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-xl p-5 text-left transition-all duration-300"
              style={{
                border:
                  i === active ? "1.5px solid #3366ff" : "1.5px solid #e2e6f0",
                background: i === active ? "#eff4ff" : "#ffffff",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #3366ff, #3b2fc9)",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#0d1526" }}
                  >
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {t.role}
                  </p>
                </div>
              </div>
              <p
                className="line-clamp-2 text-xs leading-relaxed"
                style={{ color: "#64748b" }}
              >
                "{t.text}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
