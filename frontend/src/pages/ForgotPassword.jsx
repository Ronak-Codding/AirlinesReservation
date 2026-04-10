import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

const STEP_EMAIL = 1;
const STEP_OTP = 2;
const STEP_RESET = 3;
const STEP_SUCCESS = 4;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:         #f0f4ff;
    --surface:    rgba(255,255,255,0.85);
    --border:     rgba(100,120,200,0.18);
    --accent:     #4f8ef7;
    --accent2:    #7c5cfc;
    --text:       #1a1d3a;
    --muted:      rgba(30,40,100,0.52);
    --error:      #e53e3e;
    --success:    #1a9e6a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .fp-root {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .fp-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 15% 5%,  rgba(79,142,247,.13) 0%, transparent 65%),
      radial-gradient(ellipse 55% 70% at 85% 95%,  rgba(124,92,252,.11) 0%, transparent 65%);
    pointer-events: none;
  }

  .fp-root::after {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, rgba(79,142,247,.07) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
    opacity: .7;
  }

  .fp-corner {
    position: fixed;
    width: 100px; height: 100px;
    pointer-events: none;
    z-index: 1;
  }
  .fp-corner-tl { top: 24px; left: 24px; border-top: 1px solid var(--border); border-left: 1px solid var(--border); }
  .fp-corner-br { bottom: 24px; right: 24px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }

  .rc-back {
    position: fixed;
    top: 16px; left: 16px;
    z-index: 50;
    display: flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.75);
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    padding: 7px 14px;
    border-radius: 100px;
    cursor: pointer;
    backdrop-filter: blur(14px);
    transition: all .22s ease;
  }
  .rc-back:hover { background: rgba(255,255,255,1); color: var(--text); transform: translateX(-2px); }

  .fp-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(22px);
    padding: 44px 44px 40px;
    box-shadow: 0 8px 40px rgba(79,100,200,.1), 0 2px 12px rgba(79,100,200,.07), inset 0 1px 0 rgba(255,255,255,.9);
  }

  .fp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 44px; right: 44px;
    height: 1px;
    border-radius: 24px 24px 0 0;
    background: linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent);
  }

  .fp-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 28px;
    justify-content: center;
  }
  .fp-brand-mark {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 16px rgba(79,142,247,.35);
    flex-shrink: 0;
  }
  .fp-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--text);
    letter-spacing: 0.01em;
  }

  .fp-steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 28px;
  }
  .fp-step-item {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .fp-step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    color: var(--muted);
    background: rgba(255,255,255,0.6);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  .fp-step-dot.active {
    border-color: var(--accent);
    background: rgba(79,142,247,.1);
    color: var(--accent);
    box-shadow: 0 0 10px rgba(79,142,247,.2);
  }
  .fp-step-dot.done {
    border-color: var(--success);
    background: rgba(26,158,106,.1);
    color: var(--success);
  }
  .fp-step-line {
    flex: 1;
    height: 1px;
    background: var(--border);
    margin: 0 6px;
    transition: background 0.3s;
  }
  .fp-step-line.done { background: rgba(26,158,106,.4); }

  .fp-heading {
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .fp-heading em {
    font-style: normal;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fp-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.65;
    margin-bottom: 24px;
    font-weight: 300;
    text-align: center;
  }
  .fp-desc strong { color: var(--accent); font-weight: 500; }

  .fp-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 7px;
  }

  .fp-input-wrap { position: relative; margin-bottom: 18px; }
  .fp-input-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: rgba(79,142,247,.5);
    pointer-events: none;
    display: flex; align-items: center;
  }
  .fp-input {
    width: 100%;
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(100,120,200,0.22);
    border-radius: 11px;
    padding: 12px 16px;
    color: var(--text);
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .fp-input.has-icon { padding-left: 40px; }
  .fp-input.has-toggle { padding-right: 44px; }
  .fp-input::placeholder { color: rgba(30,40,100,0.3); }
  .fp-input:focus {
    border-color: rgba(79,142,247,.6);
    background: rgba(255,255,255,1);
    box-shadow: 0 0 0 3px rgba(79,142,247,.12);
  }
  .fp-input.err { border-color: rgba(229,62,62,.45); background: rgba(229,62,62,.04); }
  .fp-input.ok  { border-color: rgba(26,158,106,.45); background: rgba(26,158,106,.04); }
  .fp-input:disabled { opacity: .4; cursor: not-allowed; }

  .fp-toggle-btn {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(79,142,247,.5);
    cursor: pointer; padding: 2px;
    display: flex; align-items: center;
    transition: color .2s;
  }
  .fp-toggle-btn:hover { color: var(--accent); }

  .fp-otp-grid {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 16px;
  }
  .fp-otp-cell {
    width: 50px; height: 58px;
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(100,120,200,0.22);
    border-radius: 11px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
    caret-color: var(--accent);
  }
  .fp-otp-cell:focus {
    border-color: rgba(79,142,247,.6);
    box-shadow: 0 0 0 3px rgba(79,142,247,.12);
    background: rgba(255,255,255,1);
  }
  .fp-otp-cell.filled {
    border-color: rgba(79,142,247,.45);
    background: rgba(79,142,247,.05);
  }
  .fp-otp-cell:disabled { opacity: .4; cursor: not-allowed; }

  .fp-strength { margin-top: 8px; margin-bottom: 4px; }
  .fp-strength-bars { display: flex; gap: 5px; margin-bottom: 4px; }
  .fp-strength-bar {
    flex: 1; height: 3px;
    border-radius: 2px;
    background: rgba(30,40,100,.1);
    transition: background .3s;
  }
  .fp-strength-label { font-size: 11px; font-weight: 500; letter-spacing: .04em; }

  .fp-error {
    background: rgba(229,62,62,.07);
    border: 1px solid rgba(229,62,62,.22);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--error);
  }

  .fp-note { font-size: 11px; margin-top: 4px; font-weight: 400; letter-spacing: .01em; }

  .fp-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    border: none;
    border-radius: 13px;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.03em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 20px rgba(79,142,247,.28);
    position: relative;
    overflow: hidden;
  }
  .fp-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.18), transparent);
    opacity: 0; transition: opacity .2s;
    pointer-events: none;
  }
  .fp-btn:hover:not(:disabled)::after { opacity: 1; }
  .fp-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(79,142,247,.4);
  }
  .fp-btn:active:not(:disabled) { transform: translateY(0); }
  .fp-btn:disabled { opacity: .35; cursor: not-allowed; }

  .fp-link {
    background: none; border: none;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0;
    transition: opacity .2s;
  }
  .fp-link:hover { opacity: .7; }
  .fp-link.muted { color: var(--muted); }

  .fp-row-btns {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
  }

  .fp-icon-ring {
    width: 60px; height: 60px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: rgba(79,142,247,.08);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px;
    box-shadow: 0 0 20px rgba(79,142,247,.12);
  }

  .fp-success-ring {
    width: 68px; height: 68px;
    border-radius: 50%;
    border: 1px solid rgba(26,158,106,.35);
    background: rgba(26,158,106,.1);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px;
    box-shadow: 0 0 24px rgba(26,158,106,.18);
  }

  .fp-progress-track {
    width: 100%; height: 3px;
    background: rgba(30,40,100,.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 24px;
  }
  .fp-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 2px;
  }

  .fp-countdown {
    text-align: center;
    margin-top: 16px;
    font-size: 12px;
    color: var(--muted);
  }
  .fp-countdown strong { color: var(--accent); }

  .spin { animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 500px) {
    .fp-card { padding: 32px 22px 28px; border-radius: 18px; }
    .fp-heading { font-size: 24px; }
    .fp-otp-cell { width: 40px; height: 50px; font-size: 18px; }
  }
`;

/* ─── OTP INPUT ─────────────────────────────────────────────────────────── */
const OTPInput = ({ value, onChange, disabled }) => {
  const inputsRef = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val && e.nativeEvent.inputType !== "deleteContentBackward") return;
    const newDigits = [...digits];
    newDigits[idx] = val;
    const newOtp = newDigits.join("").slice(0, 6);
    onChange(newOtp);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="fp-otp-grid">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`fp-otp-cell${digit ? " filled" : ""}`}
        />
      ))}
    </div>
  );
};

/* ─── PASSWORD STRENGTH ─────────────────────────────────────────────────── */
const PasswordStrength = ({ password }) => {
  const checks = [
    { ok: password.length >= 6 },
    { ok: password.length >= 8 },
    { ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#e53e3e", "#d97706", "#1a9e6a"];
  const labels = ["Weak", "Fair", "Strong"];
  const color = score > 0 ? colors[score - 1] : "transparent";

  return (
    <div className="fp-strength">
      <div className="fp-strength-bars">
        {checks.map((_, i) => (
          <div
            key={i}
            className="fp-strength-bar"
            style={{ background: i < score ? color : undefined }}
          />
        ))}
      </div>
      {score > 0 && (
        <span className="fp-strength-label" style={{ color }}>
          {labels[score - 1]} password
        </span>
      )}
    </div>
  );
};

/* ─── STEP TRACKER ──────────────────────────────────────────────────────── */
const StepTracker = ({ step }) => {
  const steps = [STEP_EMAIL, STEP_OTP, STEP_RESET];
  const labels = ["1", "2", "3"];
  return (
    <div className="fp-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="fp-step-item">
            <div
              className={`fp-step-dot${step === s ? " active" : ""}${step > s ? " done" : ""}`}
            >
              {step > s ? "✓" : labels[i]}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`fp-step-line${step > s ? " done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─── MAIN ──────────────────────────────────────────────────────────────── */
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email address");
    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/user/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Something went wrong");
      setStep(STEP_OTP);
      setCountdown(60);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (otp.length < 6)
      return setError("Please enter the complete 6-digit OTP");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid OTP");
      setStep(STEP_RESET);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");
    if (!newPassword) return setError("Password is required");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to reset password");
      setStep(STEP_SUCCESS);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 28, filter: "blur(4px)" },
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      x: -28,
      filter: "blur(4px)",
      transition: { duration: 0.22 },
    },
  };

  return (
    <>
      <style>{css}</style>
      <div className="fp-root">
        <div className="fp-corner fp-corner-tl" />
        <div className="fp-corner fp-corner-br" />

        <button className="rc-back" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>

        <motion.div
          className="fp-card"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Brand */}
          <div className="fp-brand">
            <div className="fp-brand-mark">✈</div>
            <span className="fp-brand-name">Skyjet Airlines</span>
          </div>

          {step < STEP_SUCCESS && <StepTracker step={step} />}

          <AnimatePresence mode="wait">
            {/* ── Step 1: Email ── */}
            {step === STEP_EMAIL && (
              <motion.div
                key="email"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h1 className="fp-heading">
                  Forgot your <em>password?</em>
                </h1>
                <p className="fp-desc">
                  Enter your registered email and we'll send you a verification
                  code.
                </p>

                <form onSubmit={handleSendOtp}>
                  <label className="fp-label">Email Address</label>
                  <div className="fp-input-wrap">
                    <Mail size={15} className="fp-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="your@email.com"
                      disabled={isLoading}
                      className="fp-input has-icon"
                    />
                  </div>

                  {error && (
                    <div className="fp-error">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="fp-btn">
                    {isLoading ? (
                      <>
                        <Loader size={15} className="spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Mail size={15} /> Send Verification Code
                      </>
                    )}
                  </button>
                </form>

                <div
                  className="fp-row-btns"
                  style={{ justifyContent: "center", marginTop: 20 }}
                >
                  <button
                    onClick={() => navigate("/login")}
                    className="fp-link muted"
                  >
                    <ArrowLeft size={13} /> Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === STEP_OTP && (
              <motion.div
                key="otp"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="fp-icon-ring">
                  <ShieldCheck size={24} color="#4f8ef7" />
                </div>
                <h1 className="fp-heading">
                  <em>Verify</em> your identity
                </h1>
                <p className="fp-desc">
                  A 6-digit code was sent to
                  <br />
                  <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerifyOtp}>
                  <OTPInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      setError("");
                    }}
                    disabled={isLoading}
                  />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "11px",
                      color: "var(--muted)",
                      marginBottom: 18,
                    }}
                  >
                    Code expires in 10 minutes
                  </p>

                  {error && (
                    <div className="fp-error">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="fp-btn"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={15} className="spin" /> Verifying…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={15} /> Verify Code
                      </>
                    )}
                  </button>
                </form>

                <div className="fp-countdown">
                  {countdown > 0 ? (
                    <>
                      Resend code in <strong>{countdown}s</strong>
                    </>
                  ) : (
                    <button onClick={handleSendOtp} className="fp-link">
                      Resend Code
                    </button>
                  )}
                </div>

                <div
                  className="fp-row-btns"
                  style={{ justifyContent: "center", marginTop: 12 }}
                >
                  <button
                    onClick={() => {
                      setStep(STEP_EMAIL);
                      setOtp("");
                      setError("");
                    }}
                    className="fp-link muted"
                  >
                    <ArrowLeft size={13} /> Change Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Reset Password ── */}
            {step === STEP_RESET && (
              <motion.div
                key="reset"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="fp-icon-ring">
                  <Lock size={22} color="#4f8ef7" />
                </div>
                <h1 className="fp-heading">
                  Set new <em>password</em>
                </h1>
                <p className="fp-desc">
                  Identity confirmed. Choose a strong new password for your
                  account.
                </p>

                <form onSubmit={handleResetPassword}>
                  <label className="fp-label">New Password</label>
                  <div className="fp-input-wrap" style={{ marginBottom: 6 }}>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Create a strong password"
                      disabled={isLoading}
                      className="fp-input has-toggle"
                    />
                    <button
                      type="button"
                      className="fp-toggle-btn"
                      onClick={() => setShowNew((v) => !v)}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrength password={newPassword} />}
                  <div style={{ marginBottom: 16 }} />

                  <label className="fp-label">Confirm Password</label>
                  <div className="fp-input-wrap" style={{ marginBottom: 4 }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Re-enter your password"
                      disabled={isLoading}
                      className={`fp-input has-toggle${
                        confirmPassword
                          ? newPassword !== confirmPassword
                            ? " err"
                            : " ok"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="fp-toggle-btn"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p
                      className="fp-note"
                      style={{ color: "var(--error)", marginBottom: 14 }}
                    >
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p
                      className="fp-note"
                      style={{ color: "var(--success)", marginBottom: 14 }}
                    >
                      ✓ Passwords match
                    </p>
                  )}
                  {!confirmPassword && <div style={{ marginBottom: 18 }} />}

                  {error && (
                    <div className="fp-error">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="fp-btn">
                    {isLoading ? (
                      <>
                        <Loader size={15} className="spin" /> Updating…
                      </>
                    ) : (
                      <>
                        <Lock size={15} /> Reset Password
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 4: Success ── */}
            {step === STEP_SUCCESS && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  className="fp-success-ring"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, delay: 0.18 }}
                >
                  <CheckCircle size={32} color="#1a9e6a" />
                </motion.div>

                <h1 className="fp-heading" style={{ marginBottom: 8 }}>
                  Password <em>reset!</em>
                </h1>
                <p className="fp-desc">
                  Your password has been updated successfully.
                  <br />
                  Redirecting you to login…
                </p>

                <div className="fp-progress-track">
                  <motion.div
                    className="fp-progress-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginTop: 8,
                  }}
                >
                  Redirecting in 3 seconds…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
