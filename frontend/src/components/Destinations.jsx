import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const destinations = [
  {
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    price: "From ₹41,000",
  },
  {
    city: "Tokyo",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    price: "From ₹74,000",
  },
  {
    city: "Dubai",
    country: "UAE",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    price: "From ₹54,000",
  },
  {
    city: "New York",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    price: "From ₹29,000",
  },
  {
    city: "Maldives",
    country: "Maldives",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
    price: "From ₹99,000",
  },
  {
    city: "Sydney",
    country: "Australia",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80",
    price: "From ₹87,000",
  },
];

export default function Destinations() {
  const navigate = useNavigate();

  return (
    <section
      id="destinations"
      style={{ background: "#f6f8ff" }}
      className="px-4 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#3366ff" }}
            >
              Explore the World
            </p>
            <h2
              className="text-4xl font-bold tracking-tight md:text-5xl"
              style={{ color: "#0d1526" }}
            >
              Popular Destinations
            </h2>
          </div>
          <a
            href="#"
            className="group flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-colors"
            style={{ color: "#3366ff" }}
          >
            View All Destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Destinations Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <a
              key={dest.city}
              href="#"
              className="group relative overflow-hidden rounded-2xl"
              style={{ boxShadow: "0 4px 20px rgba(13,21,38,0.10)" }}
            >
              <div className="relative aspect-[4/3] w-full">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        {dest.city}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70">
                        {dest.country}
                      </p>
                    </div>
                    <div
                      className="self-start sm:self-auto rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold whitespace-nowrap"
                      style={{ background: "#3366ff", color: "#ffffff" }}
                    >
                      {dest.price}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "rgba(51,102,255,0.25)" }}
                >
                  <span
                    className="rounded-full border-2 border-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white"
                    onClick={() => navigate("/user/search")}
                  >
                    Explore
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
