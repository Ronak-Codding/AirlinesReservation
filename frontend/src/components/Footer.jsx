import {
  Plane,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const footerLinks = {
  Quick: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
  ],
  support: [
    { label: "Help Center", href: "/helpcenter" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/termofservice" },
    { label: "Cookie Policy", href: "/cookiepolicy" },
  ],
};

export default function Footer() {
  return (
    <footer
      id="contact"
      style={{
        background: "#0d1526",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a href="/" className="group flex items-center gap-3">
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "#3366ff" }}
              >
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sky<span style={{ color: "#3366ff" }}>Jet</span>
              </span>
            </a>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "#94a3b8" }}
            >
              Experience luxury travel reimagined. Flying you to over 200
              destinations with unmatched comfort and service.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              {[
                { Icon: MapPin, text: "123 Aviation Blvd, Sky City" },
                { Icon: Phone, text: "+1 (800) SKY-JET" },
                { Icon: Mail, text: "hello@skyjet.com" },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "#94a3b8" }}
                >
                  <Icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: "#3366ff" }}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-3">
            {[
              { title: "Quick Links", links: footerLinks.Quick },
              { title: "Support", links: footerLinks.support },
              { title: "Legal", links: footerLinks.legal },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4
                  className="mb-4 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#ffffff" }}
                >
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: "#64748b" }}
                        onMouseEnter={(e) => (e.target.style.color = "#3366ff")}
                        onMouseLeave={(e) => (e.target.style.color = "#64748b")}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm" style={{ color: "#475569" }}>
            &copy; {new Date().getFullYear()} SkyJet Airlines. All rights
            reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#64748b",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3366ff";
                  e.currentTarget.style.color = "#3366ff";
                  e.currentTarget.style.background = "rgba(51,102,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
