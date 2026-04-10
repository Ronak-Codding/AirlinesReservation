import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Plane } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      localStorage.removeItem("usertoken");
      localStorage.removeItem("user");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem(
        "admin",
        JSON.stringify({ ...data.user, role: "admin" }),
      );
      navigate("/admin");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080b12;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Background grid */
        .al-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
        }

        /* Ambient glow blobs */
        .al-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }
        .al-blob-1 {
          width: 500px; height: 500px;
          background: rgba(108,99,255,0.12);
          top: -100px; left: -100px;
        }
        .al-blob-2 {
          width: 400px; height: 400px;
          background: rgba(16,185,129,0.06);
          bottom: -80px; right: -80px;
        }

        /* Card */
        .al-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: #0c1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px 52px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.08);
          animation: al-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .al-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          border-radius: 20px 20px 0 0;
          background: linear-gradient(90deg, transparent, rgba(108,99,255,0.5), transparent);
        }

        @keyframes al-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Brand at top of card */
        .al-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .al-brand-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .al-brand-name {
          font-family: 'Times New Roman', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .al-brand-sub {
          font-size: 0.6rem;
          color: #6c63ff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .al-form-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.2);
          border-radius: 20px;
          font-size: 0.72rem;
          color: #a78bfa;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .al-form-title {
          font-family: 'Times New Roman', serif;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
          text-align: center;
        }

        .al-form-subtitle {
          font-size: 0.875rem;
          color: #f7f7fa;
          margin-bottom: 20px;
          text-align: center;
        }

        .al-field {
          margin-bottom: 10px;
        }

        .al-field label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #f9fafe;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .al-input-wrap {
          position: relative;
        }

        .al-input {
          width: 100%;
          padding: 11px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-family: 'Times New Roman', serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .al-input::placeholder { color: #3a4060; }

        .al-input:focus {
          border-color: rgba(108,99,255,0.5);
          background: rgba(108,99,255,0.05);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }

        .al-input-pass { padding-right: 48px; }

        .al-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: #3a4060; cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .al-eye:hover { color: #a78bfa; }

        .al-forgot {
          text-align: right;
          margin: -4px 0 24px;
        }
        .al-forgot button {
          background: none; border: none;
          color: #6c63ff; font-size: 0.8rem;
          cursor: pointer;  font-family: 'Times New Roman', serif;
          transition: color 0.2s;
        }
        .al-forgot button:hover { color: #a78bfa; }

        .al-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.82rem;
          margin-bottom: 16px;
          animation: al-shake 0.3s ease;
        }

        @keyframes al-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .al-submit {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Times New Roman', serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 24px rgba(108,99,255,0.3);
        }

        .al-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(108,99,255,0.45);
        }

        .al-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .al-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: al-spin 0.6s linear infinite;
        }
        @keyframes al-spin { to { transform: rotate(360deg); } }

        .al-footer-note {
          margin-top: 16px;
          text-align: center;
          font-size: 0.75rem;
          color: #2a3050;
        }
        .al-footer-note span { color: #4a5070; }

        @media (max-width: 520px) {
          .al-card { padding: 36px 28px; margin: 16px; }
        }
      `}</style>

      <div className="al-root">
        <div className="al-bg-grid" />
        <div className="al-blob al-blob-1" />
        <div className="al-blob al-blob-2" />

        <div className="al-card">
          {/* Brand */}
          <div className="al-brand">
            <div className="al-brand-icon">
              <Plane size={18} color="#fff" />
            </div>
            <div>
              <div className="al-brand-name">SkyJet Airlines</div>
              {/* <div className="al-brand-sub">Control Tower</div> */}
            </div>
          </div>

          {/* <div className="al-form-badge">
            <Shield size={11} /> Secure Admin Access
          </div> */}
          <h2 className="al-form-title">Welcome back</h2>
          <p className="al-form-subtitle">Sign in to your admin dashboard</p>

          {error && (
            <div className="al-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="al-field">
              <label>Email Address</label>
              <div className="al-input-wrap">
                <input
                  className="al-input"
                  type="email"
                  placeholder="admin@skyjet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="al-field">
              <label>Password</label>
              <div className="al-input-wrap">
                <input
                  className="al-input al-input-pass"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-eye"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="al-forgot">
              {/* <button
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button> */}
            </div>

            <button className="al-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="al-spinner" /> Authenticating...
                </>
              ) : (
                <>
                  <Shield size={15} /> Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <p className="al-footer-note">
            <span>Protected by 256-bit encryption · SkyJet Admin v2.0</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
