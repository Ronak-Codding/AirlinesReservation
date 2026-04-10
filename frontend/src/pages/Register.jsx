import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:      #eef2f7 !important;
    --surface: rgba(255,255,255,0.92) !important;
    --border:  rgba(99,102,241,0.18) !important;
    --accent:  #4f46e5;
    --accent2: #7c3aed;
    --text:    #1e1b4b;
    --muted:   rgba(30,27,75,0.50);
    --error:   #dc2626;
    --success: #16a34a;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rc-page {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Outfit', sans-serif;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 16px 40px;
    position: relative;
    overflow-x: hidden;
  }

  .rc-page::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 10% 0%,  rgba(199,210,254,.55) 0%, transparent 60%),
      radial-gradient(ellipse 55% 60% at 90% 100%, rgba(221,214,254,.45) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(165,180,252,.15) 0%, transparent 70%);
    pointer-events: none;
    animation: meshShift 14s ease-in-out infinite alternate;
  }
  @keyframes meshShift {
    from { opacity:.8; transform:scale(1); }
    to   { opacity:1;  transform:scale(1.05); }
  }

  .rc-page::after {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,.06) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .rc-back {
    position: fixed; top:16px; left:16px; z-index:50;
    display:flex; align-items:center; gap:7px;
    background:rgba(255,255,255,0.80);
    border:1px solid rgba(99,102,241,0.20);
    color:var(--muted);
    font-family:'Outfit',sans-serif; font-size:13px;
    padding:7px 14px; border-radius:100px; cursor:pointer;
    backdrop-filter:blur(14px); transition:all .22s ease;
  }
  .rc-back:hover { background:rgba(99,102,241,.10); color:var(--accent); transform:translateX(-2px); }

  .rc-card {
    position:relative; z-index:10;
    width:100%; max-width:700px;
    background:var(--surface);
    border:1px solid rgba(99,102,241,0.15);
    border-radius:24px;
    backdrop-filter:blur(24px);
    padding:32px 40px 30px;
    animation:cardIn .55s cubic-bezier(.16,1,.3,1) both;
    box-shadow:
      0 20px 60px rgba(99,102,241,.10),
      0 4px 16px rgba(99,102,241,.06),
      inset 0 1px 0 rgba(255,255,255,0.90);
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(32px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .rc-headline {
    font-family:'Playfair Display',serif;
    font-size:30px; font-weight:400;
    color:var(--text); line-height:1.15;
    letter-spacing:-.02em; margin-bottom:4px;
  }
  .rc-headline em {
    font-style:normal;
    background:linear-gradient(90deg,var(--accent),var(--accent2));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .rc-section-tag {
    display:inline-flex; align-items:center; gap:6px;
    font-size:10px; font-weight:600;
    letter-spacing:.14em; text-transform:uppercase;
    color:var(--accent);
    background:rgba(99,102,241,.08);
    border:1px solid rgba(99,102,241,.20);
    border-radius:100px; padding:3px 11px;
    margin-bottom:12px; margin-top:16px;
  }

  .rc-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .rc-field { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }

  .rc-label {
    font-size:11px; font-weight:600;
    letter-spacing:.09em; text-transform:uppercase;
    color:#374151; display:flex; align-items:center; gap:5px;
  }

  .rc-input {
    width:100%;
    background:rgba(249,250,251,1);
    border:1px solid rgba(99,102,241,.20);
    border-radius:10px; padding:10px 13px;
    color:var(--text); font-size:13.5px;
    font-family:'Outfit',sans-serif; font-weight:400;
    outline:none;
    transition:border-color .18s, box-shadow .18s, background .18s;
  }
  .rc-input::placeholder { color:rgba(30,27,75,.25); }
  .rc-input:focus {
    border-color:rgba(99,102,241,.55); background:#fff;
    box-shadow:0 0 0 3px rgba(99,102,241,.12);
  }
  .rc-input.has-error  { border-color:rgba(220,38,38,.45); background:rgba(220,38,38,.03); }
  .rc-input:disabled   { opacity:.45; cursor:not-allowed; }

  .rc-pw-bars { display:flex; gap:4px; margin-top:5px; }
  .rc-pw-bar  { flex:1; height:3px; border-radius:3px; background:rgba(99,102,241,.10); transition:background .25s; }
  .rc-pw-bar.w { background:#dc2626; }
  .rc-pw-bar.m { background:#f59e0b; }
  .rc-pw-bar.s { background:var(--success); }

  .rc-hint  { font-size:11px; color:rgba(30,27,75,.35); margin-top:2px; }
  .rc-error { font-size:12px; color:var(--error); display:flex; align-items:center; gap:4px; margin-top:2px; }

  .rc-terms-row { display:flex; align-items:flex-start; gap:10px; margin:14px 0 4px; }
  .rc-checkbox {
    appearance:none; width:17px; height:17px; min-width:17px;
    background:#f9fafb; border:1px solid rgba(99,102,241,.30);
    border-radius:5px; cursor:pointer; margin-top:1px;
    position:relative; transition:all .18s;
  }
  .rc-checkbox:checked { background:linear-gradient(135deg,var(--accent),var(--accent2)); border-color:transparent; }
  .rc-checkbox:checked::after {
    content:'✓'; position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    color:#fff; font-size:10px; font-weight:800;
  }
  .rc-terms-text { font-size:13px; color:var(--muted); line-height:1.5; }
  .rc-terms-text a { color:var(--accent); text-decoration:none; }
  .rc-terms-text a:hover { text-decoration:underline; }

  .rc-api-err {
    background:rgba(220,38,38,.06); border:1px solid rgba(220,38,38,.20);
    border-radius:10px; padding:10px 13px;
    color:var(--error); font-size:13px; margin-bottom:12px;
    display:flex; align-items:center; gap:8px;
  }

  .rc-submit {
    width:100%; padding:13px;
    background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%);
    border:none; border-radius:12px;
    color:#fff; font-family:'Outfit',sans-serif;
    font-size:14px; font-weight:700; letter-spacing:.04em;
    cursor:pointer; margin-top:6px;
    position:relative; overflow:hidden;
    transition:transform .2s, box-shadow .2s;
    box-shadow:0 4px 20px rgba(79,70,229,.28);
  }
  .rc-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(79,70,229,.40); }
  .rc-submit:active:not(:disabled){ transform:translateY(0); }
  .rc-submit:disabled { opacity:.38; cursor:not-allowed; }

  .rc-divider {
    display:flex; align-items:center; gap:12px;
    margin:16px 0 12px; color:var(--muted); font-size:13px;
  }
  .rc-divider::before,.rc-divider::after { content:''; flex:1; height:1px; background:rgba(99,102,241,.15); }

  .rc-signin-btn {
    width:100%; background:rgba(99,102,241,.05);
    border:1px solid rgba(99,102,241,.18); border-radius:12px;
    color:var(--muted); font-family:'Outfit',sans-serif;
    font-size:14px; font-weight:400; padding:11px; cursor:pointer;
    transition:all .2s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .rc-signin-btn:hover:not(:disabled) { background: rgba(21, 146, 214, 0.4); color:var(--accent); }
  .rc-signin-btn:disabled { opacity:.38; cursor:not-allowed; }

  /* ── OTP OVERLAY ── */
  .otp-overlay {
    position:fixed; inset:0; z-index:100;
    background:rgba(15,10,40,0.55);
    backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center;
    padding:16px;
    animation:fadeIn .25s ease both;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .otp-modal {
    background:#fff;
    border:1px solid rgba(99,102,241,.18);
    border-radius:24px;
    padding:36px 36px 30px;
    width:100%; max-width:420px;
    box-shadow:0 32px 80px rgba(79,70,229,.18), 0 4px 20px rgba(79,70,229,.10);
    animation:modalIn .35s cubic-bezier(.16,1,.3,1) both;
    text-align:center;
  }
  @keyframes modalIn {
    from { opacity:0; transform:scale(.92) translateY(20px); }
    to   { opacity:1; transform:scale(1)   translateY(0); }
  }

  .otp-icon {
    width:64px; height:64px; border-radius:50%;
    background:linear-gradient(135deg,rgba(79,70,229,.12),rgba(124,58,237,.12));
    border:2px solid rgba(99,102,241,.20);
    display:flex; align-items:center; justify-content:center;
    font-size:28px; margin:0 auto 20px;
  }

  .otp-title {
    font-family:'Playfair Display',serif;
    font-size:24px; font-weight:400; color:var(--text);
    margin-bottom:8px;
  }

  .otp-desc {
    font-size:13.5px; color:var(--muted); line-height:1.7;
    margin-bottom:24px;
  }
  .otp-desc strong { color:var(--accent); font-weight:600; }

  .otp-boxes {
    display:flex; gap:10px; justify-content:center;
    margin-bottom:8px;
  }
  .otp-box-input {
    width:46px; height:54px;
    border:1.5px solid rgba(99,102,241,.25);
    border-radius:12px;
    background:#f9fafb;
    text-align:center;
    font-size:22px; font-weight:600; color:var(--text);
    font-family:'Outfit',sans-serif;
    outline:none;
    transition:border-color .18s, box-shadow .18s, background .18s;
    caret-color:transparent;
  }
  .otp-box-input:focus {
    border-color:var(--accent); background:#fff;
    box-shadow:0 0 0 3px rgba(99,102,241,.15);
  }
  .otp-box-input.filled  { border-color:rgba(99,102,241,.55); background:#fff; }
  .otp-box-input.otp-error { border-color:rgba(220,38,38,.50); background:rgba(220,38,38,.03); animation: shake .35s ease; }

  @keyframes shake {
    0%,100%{transform:translateX(0)}
    25%{transform:translateX(-5px)}
    75%{transform:translateX(5px)}
  }

  .otp-err-msg {
    font-size:12.5px; color:var(--error);
    display:flex; align-items:center; justify-content:center; gap:5px;
    margin-bottom:16px; min-height:22px;
  }

  .otp-verify-btn {
    width:100%; padding:13px;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    border:none; border-radius:12px; color:#fff;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:700;
    letter-spacing:.04em; cursor:pointer;
    transition:transform .2s, box-shadow .2s;
    box-shadow:0 4px 20px rgba(79,70,229,.28);
    margin-bottom:14px;
  }
  .otp-verify-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,70,229,.38); }
  .otp-verify-btn:disabled { opacity:.38; cursor:not-allowed; }

  .otp-resend-row {
    display:flex; align-items:center; justify-content:center; gap:6px;
    font-size:13px; color:var(--muted);
  }
  .otp-resend-btn {
    background:none; border:none; color:var(--accent);
    font-size:13px; font-family:'Outfit',sans-serif;
    font-weight:600; cursor:pointer; text-decoration:underline; padding:0;
  }
  .otp-resend-btn:disabled { opacity:.4; cursor:not-allowed; }

  .otp-cancel {
    margin-top:14px; background:none; border:none;
    color:var(--muted); font-size:13px;
    font-family:'Outfit',sans-serif; cursor:pointer;
    text-decoration:underline; padding:0;
    display:block; width:100%; text-align:center;
  }
  .otp-cancel:hover { color:var(--text); }

  /* ── SUCCESS ── */
  .rc-success {
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:48px 20px; text-align:center;
    animation:cardIn .5s ease both;
  }
  .rc-success-ring {
    width:72px; height:72px; border-radius:50%;
    border:2px solid var(--success);
    background:rgba(22,163,74,.08);
    display:flex; align-items:center; justify-content:center;
    font-size:30px; margin-bottom:20px;
    animation:pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { box-shadow:0 0 0 0   rgba(22,163,74,.30); }
    50%      { box-shadow:0 0 0 16px rgba(22,163,74,0); }
  }
  .rc-success h2 {
    font-family:'Playfair Display',serif;
    font-size:28px; font-weight:400; color:var(--text); margin-bottom:8px;
  }
  .rc-success p { color:var(--muted); font-size:14px; line-height:1.6; }

  .spin { display:inline-block; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  @media (max-width:600px) {
    .rc-card    { padding:24px 18px 22px; border-radius:16px; }
    .rc-row     { grid-template-columns:1fr; }
    .rc-headline{ font-size:24px; }
    .otp-modal  { padding:28px 20px 22px; }
    .otp-box-input { width:40px; height:48px; font-size:18px; }
  }
`;

const pwStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const OTP_LEN = 6;

/* ─── OTP Modal ─── */
const OtpModal = ({ email, onVerified, onCancel, onResend }) => {
  const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleDigit = (idx, val) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = ch;
    setDigits(next);
    setOtpError("");
    if (ch && idx < OTP_LEN - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKey = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LEN - 1)
      inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LEN);
    const next = Array(OTP_LEN).fill("");
    paste.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputsRef.current[Math.min(paste.length, OTP_LEN - 1)]?.focus();
  };

  const otp = digits.join("");

  const handleVerify = async () => {
    if (otp.length < OTP_LEN) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Invalid OTP. Please try again.");
      onVerified();
    } catch (err) {
      setOtpError(err.message);
      setDigits(Array(OTP_LEN).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setDigits(Array(OTP_LEN).fill(""));
    setOtpError("");
    await onResend();
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  };

  return (
    <div className="otp-overlay">
      <div className="otp-modal">
        <div className="otp-icon">📧</div>
        <h2 className="otp-title">Verify your email</h2>
        <p className="otp-desc">
          We've sent a 6-digit OTP to
          <br />
          <strong>{email}</strong>
          <br />
          Enter it below to complete registration.
        </p>

        <div className="otp-boxes" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className={`otp-box-input${otpError ? " otp-error" : ""}${d ? " filled" : ""}`}
              disabled={isVerifying}
            />
          ))}
        </div>

        <div className="otp-err-msg">
          {otpError && (
            <>
              <span>⚠</span>
              {otpError}
            </>
          )}
        </div>

        <button
          className="otp-verify-btn"
          onClick={handleVerify}
          disabled={otp.length < OTP_LEN || isVerifying}
        >
          {isVerifying ? (
            <>
              <span className="spin">⟳</span> Verifying…
            </>
          ) : (
            "Verify & Complete Registration"
          )}
        </button>

        <div className="otp-resend-row">
          {timer > 0 ? (
            <span>
              Resend OTP in <strong>{timer}s</strong>
            </span>
          ) : (
            <>
              <span>Didn't receive it?</span>
              <button className="otp-resend-btn" onClick={handleResend}>
                Resend OTP
              </button>
            </>
          )}
        </div>

        <button className="otp-cancel" onClick={onCancel}>
          ← Go back &amp; edit form
        </button>
      </div>
    </div>
  );
};

/* ─── Register Page ─── */
const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registrationSuccess, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    // if (!formData.middleName.trim()) {
    //   newErrors.middleName = "Middle name is required";
    // } else if (formData.middleName.length < 2) {
    //   newErrors.middleName = "First name must be at least 2 characters";
    // }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and number";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }
    return newErrors;
  };

  /* Step 1 – validate → send OTP → show modal */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validateForm();
    if (Object.keys(ve).length > 0) {
      setErrors(ve);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setShowOtpModal(true);
    } catch (err) {
      setErrors({ apiError: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await fetch("http://localhost:5000/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });
  };

  /* Step 2 – OTP verified → register */
  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ apiError: data.message });
        return;
      }
      setSuccess(true);
      if (onRegister) onRegister(data.user);
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setErrors({ apiError: "Server not responding" });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = pwStrength(formData.password);
  const barClass = (i) => {
    if (!formData.password) return "";
    if (strength <= 1) return i < 1 ? "w" : "";
    if (strength <= 2) return i < 2 ? "m" : "";
    return i < 4 ? "s" : "";
  };

  return (
    <>
      <style>{css}</style>
      <div className="rc-page">
        <button className="rc-back" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        <div className="rc-card">
          {registrationSuccess ? (
            <div className="rc-success">
              <div className="rc-success-ring">✓</div>
              <h2>Registration Successful!</h2>
              <p>
                Your account has been created successfully.
                <br />
                Redirecting to login…
              </p>
            </div>
          ) : (
            <>
              <h1 className="rc-headline">
                Create your <em>account</em>
              </h1>

              <form onSubmit={handleSubmit} noValidate>
                <div className="rc-section-tag">Personal Information</div>

                <div className="rc-row">
                  <div className="rc-field">
                    <label className="rc-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className={`rc-input${errors.firstName ? " has-error" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <span className="rc-error">⚠ {errors.firstName}</span>
                    )}
                  </div>
                  <div className="rc-field">
                    <label className="rc-label">
                      Middle Name<span>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Enter your middle name"
                    // className={`rc-input${errors.middleName ? " has-error" : ""}`}
                    className={`rc-input`}
                      disabled={isLoading}
                    />
                     {/* {errors.middleName && (
                      <span className="rc-error">⚠ {errors.middleName}</span>
                    )} */}
                  </div>
                </div>

                <div className="rc-row">
                  <div className="rc-field">
                    <label className="rc-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className={`rc-input${errors.lastName ? " has-error" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <span className="rc-error">⚠ {errors.lastName}</span>
                    )}
                  </div>
                  <div className="rc-field">
                    <label className="rc-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className={`rc-input${errors.username ? " has-error" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <span className="rc-error">⚠ {errors.username}</span>
                    )}
                  </div>
                </div>

                <div className="rc-section-tag">Contact Details</div>

                <div className="rc-field">
                  <label className="rc-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`rc-input${errors.email ? " has-error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="rc-error">⚠ {errors.email}</span>
                  )}
                </div>

                <div className="rc-field">
                  <label className="rc-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    className={`rc-input${errors.phone ? " has-error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <span className="rc-error">⚠ {errors.phone}</span>
                  )}
                </div>

                <div className="rc-section-tag">Security</div>

                <div className="rc-row">
                  <div className="rc-field">
                    <label className="rc-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={`rc-input${errors.password ? " has-error" : ""}`}
                      disabled={isLoading}
                    />
                    {formData.password && (
                      <div className="rc-pw-bars">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className={`rc-pw-bar ${barClass(i)}`} />
                        ))}
                      </div>
                    )}
                    {errors.password ? (
                      <span className="rc-error">⚠ {errors.password}</span>
                    ) : (
                      <span className="rc-hint">
                        Min 8 chars with uppercase, lowercase &amp; number
                      </span>
                    )}
                  </div>
                  <div className="rc-field">
                    <label className="rc-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`rc-input${errors.confirmPassword ? " has-error" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <span className="rc-error">
                        ⚠ {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rc-terms-row">
                  <input
                    type="checkbox"
                    className="rc-checkbox"
                    id="rc-terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="rc-terms" className="rc-terms-text">
                    I agree to the{" "}
                    <Link to="/termofservice">Terms &amp; Conditions</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <span
                    className="rc-error"
                    style={{ marginBottom: 8, display: "flex" }}
                  >
                    ⚠ {errors.termsAccepted}
                  </span>
                )}

                {errors.apiError && (
                  <div className="rc-api-err">⚠ {errors.apiError}</div>
                )}

                <button
                  type="submit"
                  className="rc-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spin">⟳</span> Sending OTP…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="rc-divider">
                  <span>Already have an account?</span>
                </div>

                <button
                  type="button"
                  className="rc-signin-btn"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </form>
            </>
          )}
        </div>

        {showOtpModal && (
          <OtpModal
            email={formData.email}
            onVerified={handleOtpVerified}
            onCancel={() => setShowOtpModal(false)}
            onResend={handleResendOtp}
          />
        )}
      </div>
    </>
  );
};

export default Register;
