import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Plane, Mail, Lock } from "lucide-react";

const Login = () => {
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || "Invalid credentials" });
        return;
      }
      localStorage.setItem("usertoken", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, role: "user" }),
      );
      window.dispatchEvent(new Event("auth:change"));
      navigate("/");
    } catch {
      setErrors({ general: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          overflow: hidden;
          position: relative;
        }

        .lg-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 15% 5%,  rgba(79,142,247,.13) 0%, transparent 65%),
            radial-gradient(ellipse 55% 70% at 85% 95%,  rgba(124,92,252,.11) 0%, transparent 65%);
          pointer-events: none;
        }

        .lg-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(79,142,247,.07) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }

        .rc-back {
          position: fixed;
          top: 16px; left: 16px;
          z-index: 50;
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(100,120,200,0.18);
          color: rgba(30,40,100,0.52);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(14px);
          transition: all .22s ease;
        }
        .rc-back:hover { background: rgba(255,255,255,1); color: #1a1d3a; transform: translateX(-2px); }

        .lg-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(100,120,200,0.18);
          border-radius: 24px;
          padding: 40px 44px;
          box-shadow: 0 8px 40px rgba(79,100,200,.1), 0 2px 12px rgba(79,100,200,.07), inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(22px);
          animation: lg-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .lg-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent);
        }

        @keyframes lg-rise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lg-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 28px;
          justify-content: center;
        }
        .lg-brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(79,142,247,.35);
        }
        .lg-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 500;
          color: #1a1d3a;
          letter-spacing: 0.01em;
        }

        .lg-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 400;
          color: #1a1d3a;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 5px;
        }
        .lg-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: rgba(30,40,100,0.52);
          text-align: center;
          margin-bottom: 28px;
          font-weight: 300;
        }

        .lg-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(100,120,200,0.18), transparent);
          margin-bottom: 24px;
        }

        .lg-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(229,62,62,.07);
          border: 1px solid rgba(229,62,62,.22);
          border-radius: 10px;
          color: #e53e3e;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          margin-bottom: 16px;
          animation: lg-shake 0.3s ease;
        }
        @keyframes lg-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .lg-field { margin-bottom: 14px; }
        .lg-field label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(1, 3, 13, 0.85);
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lg-input-wrap { position: relative; }
        .lg-input-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          color: rgba(79,142,247,0.5);
          display: flex; align-items: center;
          pointer-events: none;
        }
        .lg-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(100,120,200,0.22);
          border-radius: 11px;
          color: #1a1d3a;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lg-input::placeholder { color: rgba(30,40,100,0.3); }
        .lg-input:focus {
          border-color: rgba(79,142,247,.6);
          background: rgba(255,255,255,1);
          box-shadow: 0 0 0 3px rgba(79,142,247,.12);
        }
        .lg-input.lg-err {
          border-color: rgba(229,62,62,.45);
          background: rgba(229,62,62,.04);
        }
        .lg-input-pass { padding-right: 44px; }
        .lg-eye {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(79,142,247,0.5); cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .lg-eye:hover { color: #4f8ef7; }
        .lg-field-err {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: #e53e3e;
          margin-top: 4px;
          padding-left: 2px;
          display: flex; align-items: center; gap: 4px;
        }

        .lg-forgot {
          text-align: center;
          margin: 12px 0 0;
        }
        .lg-forgot button {
          background: none; border: none;
          color: #4f8ef7; font-family: 'Outfit', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .lg-forgot button:hover { color: #7c5cfc; }

        .lg-submit {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          background: linear-gradient(135deg, #4f8ef7 0%, #7c5cfc 100%);
          border: none;
          border-radius: 13px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(79,142,247,.28);
          position: relative; overflow: hidden;
        }
        .lg-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.18), transparent);
          opacity: 0; transition: opacity .2s;
        }
        .lg-submit:hover:not(:disabled)::after { opacity: 1; }
        .lg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(79,142,247,.4);
        }
        .lg-submit:active:not(:disabled) { transform: translateY(0); }
        .lg-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .lg-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lg-spin 0.6s linear infinite;
        }
        @keyframes lg-spin { to { transform: rotate(360deg); } }

        .lg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 22px 0 14px;
        }
        .lg-divider-line {
          flex: 1; height: 1px;
          background: rgba(100,120,200,0.18);
        }
        .lg-divider-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: rgba(30,40,100,0.4);
          white-space: nowrap;
        }

        .lg-footer-note {
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(30,40,100,0.52);
        }
        .lg-footer-note button {
          background: none; border: none;
          color: #4f8ef7; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
          margin-left: 4px;
        }
        .lg-footer-note button:hover { color: #7c5cfc; }

        @media (max-width: 520px) {
          .lg-card { padding: 28px 22px; margin: 16px; border-radius: 18px; }
        }
      `}</style>

      <div className="lg-root">
        <button className="rc-back" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        <div className="lg-card">
          <div className="lg-brand">
            <div className="lg-brand-icon">
              <Plane size={18} color="#fff" />
            </div>
            <div className="lg-brand-name">Skyjet Airlines</div>
          </div>

          <h2 className="lg-title">Welcome back</h2>
          <p className="lg-subtitle">Sign in to your account</p>
          <div className="lg-rule" />

          {errors.general && (
            <div className="lg-error">
              <span>⚠</span> {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="on">
            <div className="lg-field">
              <label>Email Address</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">
                  <Mail size={14} />
                </span>
                <input
                  className={`lg-input${errors.email ? " lg-err" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <p className="lg-field-err">⚠ {errors.email}</p>}
            </div>

            <div className="lg-field">
              <label>Password</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">
                  <Lock size={14} />
                </span>
                <input
                  className={`lg-input lg-input-pass${errors.password ? " lg-err" : ""}`}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="lg-field-err">⚠ {errors.password}</p>
              )}
            </div>

            <button className="lg-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="lg-spinner" /> Signing in...
                </>
              ) : (
                <>Sign In</>
              )}
            </button>

            <div className="lg-forgot">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="lg-divider">
            <div className="lg-divider-line" />
            <span className="lg-divider-text">New here?</span>
            <div className="lg-divider-line" />
          </div>

          <div className="lg-footer-note">
            Don't have an account?
            <button onClick={() => navigate("/register")}>
              Register here →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
