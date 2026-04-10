import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import {
  Menu,
  X,
  Plane,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Settings,
  Ticket,
  Camera,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Flight Search", href: "/user/search" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

function Avatar({ src, fallbackUrl, fullName, size = "sm" }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "sm" ? "h-7 w-7" : "h-10 w-10";
  useEffect(() => setImgError(false), [src, fallbackUrl]);
  const imgSrc = !imgError && (src || fallbackUrl);
  return (
    <div
      className={`${dim} flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/40`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={fullName}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/60">
          <User
            className={
              size === "sm" ? "h-3.5 w-3.5 text-white" : "h-4 w-4 text-white"
            }
          />
        </div>
      )}
    </div>
  );
}

function UploadableAvatar({
  src,
  fallbackUrl,
  fullName,
  onUpload,
  size = "lg",
}) {
  const fileRef = useRef(null);
  const [hover, setHover] = useState(false);
  const dim = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const imgSrc = src || fallbackUrl;
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="group relative flex-shrink-0"
        title="Change profile photo"
      >
        <div
          className={`${dim} overflow-hidden rounded-full ring-2 ring-primary/50 transition-all duration-200 group-hover:ring-primary`}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/60">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 transition-opacity duration-200 ${hover ? "opacity-100" : "opacity-0"}`}
        >
          <Camera className="h-4 w-4 text-white" />
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Change
          </span>
        </div>
        <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0d1526] bg-primary shadow-md">
          <Camera className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      </button>
    </>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const profileRef = useRef(null);

  // ── Navigate with loader ──────────────────────────────────────────────────
  const handleNavigate = (path) => {
    setNavLoading(true);
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setNavLoading(false);
      navigate(path);
    }, 1400);
  };

  // ─── Auth State ───────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("usertoken");
      const raw = localStorage.getItem("user");
      if (token && raw) {
        try {
          setCurrentUser(JSON.parse(raw));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth:change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth:change", syncAuth);
    };
  }, []);

  const storageKey = currentUser?.email
    ? `profilePhoto_${currentUser.email}`
    : null;
  const [profilePhoto, setProfilePhoto] = useState(null);
  useEffect(() => {
    setProfilePhoto(
      storageKey ? localStorage.getItem(storageKey) || null : null,
    );
  }, [storageKey]);

  const handlePhotoUpload = (base64) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, base64);
      setProfilePhoto(base64);
    } catch {
      alert("Could not save image. Try a smaller file.");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setProfilePhoto(null);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href === "#flight-search") {
      e.preventDefault();
      if (location.pathname === "/") {
        document
          .getElementById("flight-search")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document
            .getElementById("flight-search")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
      setIsMobileMenuOpen(false);
    }
  };

  const fullName = currentUser?.fullname || currentUser?.name || "";
  const email = currentUser?.email || "";
  const displayName = fullName
    ? fullName.split(" ").length > 1
      ? `${fullName.split(" ")[0]} ${fullName.split(" ").slice(-1)[0][0]}.`
      : fullName
    : "";
  const fallbackAvatarUrl = fullName
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=3366ff&textColor=ffffff&fontSize=40&fontWeight=700`
    : null;

  const dropdownItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      onClick: () => {
        navigate("/user/dashboard");
        setIsProfileOpen(false);
      },
    },
    {
      icon: Ticket,
      label: "My Bookings",
      onClick: () => {
        navigate("/user/bookings");
        setIsProfileOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        navigate("/user/settings");
        setIsProfileOpen(false);
      },
    },
  ];

  return (
    <>
      {/* ── Loader overlay on Sign In / Register click ── */}
      {navLoading && <Loader key="nav-loader" />}

      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${isScrolled ? "bg-[#0d1526]/95 py-3 shadow-xl backdrop-blur-lg" : "bg-transparent py-6"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <a href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 rounded-full bg-primary opacity-0 blur-lg transition-opacity group-hover:opacity-50" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Sky<span className="text-primary">Jet</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-3 lg:flex">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium uppercase tracking-wider text-primary transition-all hover:border-primary/60 hover:bg-primary/20"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </button>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((p) => !p)}
                    className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                  >
                    <Avatar
                      src={profilePhoto}
                      fallbackUrl={fallbackAvatarUrl}
                      fullName={fullName}
                      size="sm"
                    />
                  </button>
                  <div
                    className={`absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1526]/98 shadow-2xl backdrop-blur-xl transition-all duration-200 ${isProfileOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
                  >
                    <div className="flex flex-col items-center gap-2 border-b border-white/10 px-4 pb-4 pt-5">
                      <UploadableAvatar
                        src={profilePhoto}
                        fallbackUrl={fallbackAvatarUrl}
                        fullName={fullName}
                        onUpload={handlePhotoUpload}
                      />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                          {fullName}
                        </p>
                        {email && (
                          <p className="text-xs text-white/50">{email}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      {dropdownItems.map(({ icon: Icon, label, onClick }) => (
                        <button
                          key={label}
                          onClick={onClick}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                        >
                          <Icon className="h-4 w-4 text-primary/70" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/10 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ✅ Sign In — with loader */}
                <button
                  className="text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:text-white"
                  onClick={() => handleNavigate("/login")}
                >
                  Sign In
                </button>
                {/* ✅ Register Now — with loader */}
                <button
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(51,102,255,0.4)]"
                  onClick={() => handleNavigate("/register")}
                >
                  Register Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="rounded-lg p-2 text-white lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`absolute left-0 right-0 top-full overflow-hidden bg-[#0d1526]/98 backdrop-blur-xl transition-all duration-500 lg:hidden ${isMobileMenuOpen ? "max-h-[650px] border-b border-white/10" : "max-h-0"}`}
        >
          <div className="flex flex-col gap-1 px-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setIsMobileMenuOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <UploadableAvatar
                      src={profilePhoto}
                      fallbackUrl={fallbackAvatarUrl}
                      fullName={fullName}
                      onUpload={handlePhotoUpload}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {fullName}
                      </p>
                      {email && (
                        <p className="truncate text-xs text-white/50">
                          {email}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-primary/80">
                        Tap photo to change
                      </p>
                    </div>
                  </div>
                  {dropdownItems.map(({ icon: Icon, label, onClick }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-4 w-4 text-primary/70" />
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg border border-red-500/20 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* ✅ Mobile Sign In — with loader */}
                  <button
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium uppercase tracking-wider text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => handleNavigate("/login")}
                  >
                    Sign In
                  </button>
                  {/* ✅ Mobile Register Now — with loader */}
                  <button
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(51,102,255,0.4)]"
                    onClick={() => handleNavigate("/register")}
                  >
                    Register Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
