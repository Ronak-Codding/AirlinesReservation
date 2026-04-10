import { Link } from "react-router-dom";

export default function Breadcrumb({ title }) {
  return (
    <section
      className="relative h-[400px] flex items-center justify-center text-white"
      style={{
        backgroundImage:
          "url( 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative text-center">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>

        <p className="text-lg">
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>{" "}
          • <span className="text-blue-400">{title}</span>
        </p>
      </div>
    </section>
  );
}
