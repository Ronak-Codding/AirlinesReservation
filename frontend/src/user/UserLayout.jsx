import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  CreditCard,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Plane,
  Bell,
  ChevronRight,
  Moon,
  Sun,
  Ban,
  HomeIcon,
} from "lucide-react";
import "./UserLayout.css";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("userTheme") === "dark",
  );

  // ── user as STATE so it re-renders when profile updates ──
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  // ── Profile photo — read same key as Navbar & UserProfile ────────────────
  const storageKey = user.email ? `profilePhoto_${user.email}` : null;
  const [profilePhoto, setProfilePhoto] = useState(() =>
    storageKey ? localStorage.getItem(storageKey) || null : null,
  );

  // ── Listen for localStorage "user" / photo changes from any page ─────────
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(updated);

      // Re-read photo for updated user
      const key = updated.email ? `profilePhoto_${updated.email}` : null;
      setProfilePhoto(key ? localStorage.getItem(key) || null : null);
    };

    // Custom event — fired from UserProfile after save / photo upload
    window.addEventListener("userUpdated", handleStorageChange);
    // Native storage event — fires when another tab updates
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userUpdated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "user-dark" : "user-light";
    localStorage.setItem("userTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    if (!token) navigate("/login");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:change"));
    navigate("/login");
  };

  // Display name — handle both {firstName} and {fullname} formats
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.fullname || "User";

  const avatarLetter = (user.firstName || user.fullname || "U")
    .charAt(0)
    .toUpperCase();

  // DiceBear fallback
  const fallbackAvatarUrl = displayName
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        displayName,
      )}&backgroundColor=d4a853&textColor=ffffff&fontSize=40&fontWeight=700`
    : null;

  const NAV_ITEMS = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/user/search", label: "Search Flights", icon: Search },
    { path: "/user/bookings", label: "My Bookings", icon: Ticket },
    { path: "/user/payments", label: "Payment History", icon: CreditCard },
    { path: "/user/cancellation", label: " Cancellation & Refund", icon: Ban },
    { path: "/user/profile", label: " My Profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  // ── Sidebar avatar: photo > DiceBear > letter ────────────────────────────
  const SidebarAvatar = () => {
    const imgSrc = profilePhoto || fallbackAvatarUrl;
    return (
      <div
        className="ul-user-avatar"
        style={{
          overflow: "hidden",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={displayName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          avatarLetter
        )}
      </div>
    );
  };

  // ── Topbar avatar: photo > DiceBear > letter ──────────────────────────────
  const TopbarAvatar = () => {
    const imgSrc = profilePhoto || fallbackAvatarUrl;
    return (
      <div
        className="ul-topbar-avatar"
        title={displayName}
        style={{
          overflow: "hidden",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={displayName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            onClick={() => navigate("/user/profile")}
          />
        ) : (
          avatarLetter
        )}
      </div>
    );
  };

  return (
    <div className="ul-root">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="ul-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`ul-sidebar ${sidebarOpen ? "ul-sidebar-open" : ""} ${
          sidebarCollapsed ? "ul-sidebar-collapsed" : ""
        }`}
      >
        {/* Logo */}
        <div className="ul-sidebar-logo">
          <div className="ul-logo-icon">
            <Plane size={20} />
          </div>
          <span className="ul-logo-text">SkyJet</span>
          <button
            className="ul-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card — with profile photo */}
        <div className="ul-user-card">
          <SidebarAvatar />
          <div className="ul-user-info">
            <p className="ul-user-name">{displayName}</p>
            <p className="ul-user-email">{user.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="ul-nav">
          <p className="ul-nav-label">Menu</p>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`ul-nav-item ${
                isActive(path) ? "ul-nav-item-active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive(path) && (
                <ChevronRight size={14} className="ul-nav-chevron" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="ul-sidebar-bottom">
          <button
            className="ul-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="ul-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`ul-main ${sidebarCollapsed ? "ul-main-expanded" : ""}`}>
        {/* Topbar */}
        <header className="ul-topbar">
          <button className="ul-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <button
            className="ul-toggle-btn"
            onClick={() => setSidebarCollapsed((p) => !p)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={20} />
          </button>
          <div className="ul-topbar-title">
            {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ||
              "Dashboard"}
          </div>
          <div className="ul-topbar-right">
            <button
              className="ul-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="ul-icon-btn">
              <Bell size={18} />
            </button>
            {/* Topbar avatar — shows updated photo instantly */}
            <TopbarAvatar />
          </div>
        </header>

        {/* Page Content */}
        <main className="ul-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
