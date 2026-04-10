import { Shield, Award, Headphones, CreditCard } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your safety is our top priority with industry-leading security protocols.",
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Recognized globally for exceptional service and customer satisfaction.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is always available to assist you anytime, anywhere.",
  },
  {
    icon: CreditCard,
    title: "Best Prices",
    description: "Competitive fares with no hidden fees. Price match guarantee included.",
  },
];

export default function Features() {
  return (
    <section id="experience" className="relative overflow-hidden bg-secondary/30 px-4 py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Why Choose Us
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            The SkyJet Difference
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_40px_rgba(212,168,83,0.1)]"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
              
              {/* Number */}
              <span className="absolute right-4 top-4 font-display text-6xl font-bold text-border/30">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
