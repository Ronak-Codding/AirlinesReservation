import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:      #f0f4ff;
    --surface: rgba(255,255,255,0.85);
    --border:  rgba(100,120,200,0.18);
    --accent:  #4f8ef7;
    --accent2: #7c5cfc;
    --text:    #1a1d3a;
    --muted:   rgba(30,40,100,0.52);
    --error:   #e53e3e;
    --success: #1a9e6a;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    padding: 80px 16px 40px;
    position: relative;
    overflow: hidden;
  }

  .rp-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 15% 5%,  rgba(79,142,247,.13) 0%, transparent 65%),
      radial-gradient(ellipse 55% 70% at 85% 95%,  rgba(124,92,252,.11) 0%, transparent 65%);
    pointer-events: none;
  }

  .rp-root::after {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, rgba(79,142,247,.07) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .rp-back {
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
  .rp-back:hover { background: rgba(255,255,255,1); color: var(--text); transform: translateX(-2px); }

  .rp-card {
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
    animation: cardIn .55s cubic-bezier(.16,1,.3,1) both;
  }
  .rp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 44px; right: 44px;
    height: 1px;
    border-radius: 24px 24px 0 0;
    background: linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent);
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .rp-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 28px;
    justify-content: center;
  }
  .rp-brand-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 16px rgba(79,142,247,.35);
  }
  .rp-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--text);
  }

  .rp-icon-ring {
    width: 60px; height: 60px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: rgba(79,142,247,.08);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px;
    box-shadow: 0 0 20px rgba(79,142,247,.12);
    font-size: 26px;
  }
  .rp-icon-ring.error-ring {
    border-color: rgba(229,62,62,.25);
    background: rgba(229,62,62,.07);
    box-shadow: 0 0 20px rgba(229,62,62,.1);
  }
  .rp-icon-ring.success-ring {
    border-color: rgba(26,158,106,.3);
    background: rgba(26,158,106,.08);
    box-shadow: 0 0 20px rgba(26,158,106,.15);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(26,158,106,.3); }
    50%      { box-shadow: 0 0 0 12px rgba(26,158,106,0); }
  }

  .rp-heading {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--text);
    text-align: center;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    line-height: 1.2;
  }
  .rp-heading em {
    font-style: normal;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rp-sub {
    font-size: 13px;
    color: var(--muted);
    text-align: center;
    line-height: 1.6;
    margin-bottom: 28px;
    font-weight: 300;
  }
  .rp-sub strong { color: var(--accent); font-weight: 500; }

  .rp-rule {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin-bottom: 24px;
  }

  .rp-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .rp-field { margin-bottom: 16px; }

  .rp-input {
    width: 100%;
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(100,120,200,0.22);
    border-radius: 11px;
    padding: 12px 15px;
    color: var(--text);
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    outline: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .rp-input::placeholder { color: rgba(30,40,100,0.3); }
  .rp-input:focus {
    border-color: rgba(79,142,247,.6);
    background: rgba(255,255,255,1);
    box-shadow: 0 0 0 3px rgba(79,142,247,.12);
  }
  .rp-input:disabled { opacity: .4; cursor: not-allowed; }

  .rp-hint { font-size: 11px; color: rgba(30,40,100,.38); margin-top: 4px; }

  .rp-pw-bars { display: flex; gap: 5px; margin-top: 8px; }
  .rp-pw-bar {
    flex: 1; height: 3px;
    border-radius: 2px;
    background: rgba(30,40,100,.1);
    transition: background .3s;
  }
  .rp-pw-label { font-size: 11px; margin-top: 4px; font-weight: 500; }

  .rp-error {
    background: rgba(229,62,62,.07);
    border: 1px solid rgba(229,62,62,.22);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
    color: var(--error);
    font-size: 13px;
    margin-bottom: 16px;
  }

  .rp-success-msg {
    background: rgba(26,158,106,.07);
    border: 1px solid rgba(26,158,106,.22);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
    color: var(--success);
    font-size: 13px;
    margin-bottom: 16px;
  }

  .rp-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    border: none;
    border-radius: 13px;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 500;
    letter-spacing: 0.03em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 20px rgba(79,142,247,.28);
    position: relative; overflow: hidden;
    margin-top: 8px;
  }
  .rp-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.18), transparent);
    opacity: 0; transition: opacity .2s;
    pointer-events: none;
  }
  .rp-btn:hover:not(:disabled)::after { opacity: 1; }
  .rp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,142,247,.4); }
  .rp-btn:active:not(:disabled) { transform: translateY(0); }
  .rp-btn:disabled { opacity: .38; cursor: not-allowed; }

  .rp-btn-ghost {
    width: 100%;
    background: rgba(255,255,255,0.6);
    border: 1px solid var(--border);
    border-radius: 13px;
    color: var(--muted);
    font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 400;
    padding: 11px;
    cursor: pointer;
    transition: all .2s;
    display: flex; align-items: center; justify-content: center;
    margin-top: 10px;
  }
  .rp-btn-ghost:hover { background: rgba(255,255,255,1); color: var(--text); }

  .rp-link {
    background: none; border: none;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0; transition: opacity .2s;
  }
  .rp-link:hover { opacity: .7; }

  .rp-center-links {
    text-align: center;
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rp-progress-track {
    width: 100%; height: 3px;
    background: rgba(30,40,100,.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 20px;
  }
  .rp-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 2px;
    animation: progressFill 3s linear forwards;
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: 100%; }
  }

  .spin { display: inline-block; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 500px) {
    .rp-card { padding: 32px 22px 28px; border-radius: 18px; }
    .rp-heading { font-size: 24px; }
  }
`;

const pwScore = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 8) s++;
  if (/[!@#$%^&*]/.test(p)) s++;
  return s;
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/user/verify-reset-token/${token}`,
        );
        const data = await res.json();
        if (data.success) {
          setIsValidToken(true);
          setUserEmail(data.user.email);
        } else {
          setError(data.message || "Invalid or expired reset link");
        }
      } catch {
        setError("Failed to verify reset token");
      } finally {
        setIsVerifying(false);
      }
    };
    if (token) verifyToken();
    else {
      setError("No reset token provided");
      setIsVerifying(false);
    }
  }, [token]);

  const validatePassword = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validatePassword()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/user/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: password, confirmPassword }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }
      setSuccess("Password reset successful! Redirecting to login...");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const score = pwScore(password);
  const barColors = ["#e53e3e", "#d97706", "#1a9e6a"];
  const barLabels = ["Weak", "Fair", "Strong"];
  const barColor = score > 0 ? barColors[score - 1] : undefined;

  /* ── Verifying state ── */
  if (isVerifying) {
    return (
      <>
        <style>{css}</style>
        <div className="rp-root">
          <div className="rp-card" style={{ textAlign: "center" }}>
            <div className="rp-brand">
              <div className="rp-brand-icon">✈</div>
              <span className="rp-brand-name">Wanderlux</span>
            </div>
            <div className="rp-icon-ring" style={{ marginBottom: 18 }}>
              <span className="spin" style={{ fontSize: 22 }}>
                ⟳
              </span>
            </div>
            <h2 className="rp-heading">
              Verifying <em>link</em>
            </h2>
            <p className="rp-sub">
              Please wait while we verify your reset link…
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Invalid token state ── */
  if (!isValidToken) {
    return (
      <>
        <style>{css}</style>
        <div className="rp-root">
          <div className="rp-card" style={{ textAlign: "center" }}>
            <div className="rp-brand">
              <div className="rp-brand-icon">✈</div>
              <span className="rp-brand-name">Wanderlux</span>
            </div>
            <div className="rp-icon-ring error-ring">⚠</div>
            <h2 className="rp-heading">
              Invalid or <em>Expired</em> Link
            </h2>
            <p className="rp-sub">
              {error || "This password reset link is invalid or has expired."}
            </p>
            <button
              className="rp-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Request New Reset Link
            </button>
            <button className="rp-btn-ghost" onClick={() => navigate("/login")}>
              ← Back to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Success state ── */
  if (success) {
    return (
      <>
        <style>{css}</style>
        <div className="rp-root">
          <div className="rp-card" style={{ textAlign: "center" }}>
            <div className="rp-brand">
              <div className="rp-brand-icon">✈</div>
              <span className="rp-brand-name">Wanderlux</span>
            </div>
            <div className="rp-icon-ring success-ring">✓</div>
            <h2 className="rp-heading">
              Password <em>reset!</em>
            </h2>
            <p className="rp-sub">
              Your password has been updated successfully.
              <br />
              Redirecting you to login…
            </p>
            <div className="rp-progress-track">
              <div className="rp-progress-fill" />
            </div>
            <p
              style={{ fontSize: "11px", color: "var(--muted)", marginTop: 8 }}
            >
              Redirecting in 3 seconds…
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Reset form ── */
  return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        <button className="rp-back" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>

        <div className="rp-card">
          <div className="rp-brand">
            <div className="rp-brand-icon">✈</div>
            <span className="rp-brand-name">Wanderlux</span>
          </div>

          <div className="rp-icon-ring">🔒</div>
          <h2 className="rp-heading">
            Create new <em>password</em>
          </h2>
          <p className="rp-sub">
            {userEmail ? (
              <>
                For <strong>{userEmail}</strong>
              </>
            ) : (
              "Choose a strong new password for your account."
            )}
          </p>
          <div className="rp-rule" />

          <form onSubmit={handleSubmit}>
            <div className="rp-field">
              <label className="rp-label">New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                disabled={isLoading}
                className="rp-input"
              />
              {password && (
                <>
                  <div className="rp-pw-bars">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rp-pw-bar"
                        style={{ background: i < score ? barColor : undefined }}
                      />
                    ))}
                  </div>
                  {score > 0 && (
                    <p className="rp-pw-label" style={{ color: barColor }}>
                      {barLabels[score - 1]} password
                    </p>
                  )}
                </>
              )}
              {!password && (
                <p className="rp-hint">Must be at least 6 characters long</p>
              )}
            </div>

            <div className="rp-field">
              <label className="rp-label">Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm new password"
                disabled={isLoading}
                className="rp-input"
                style={
                  confirmPassword
                    ? password === confirmPassword
                      ? {
                          borderColor: "rgba(26,158,106,.45)",
                          background: "rgba(26,158,106,.04)",
                        }
                      : {
                          borderColor: "rgba(229,62,62,.45)",
                          background: "rgba(229,62,62,.04)",
                        }
                    : {}
                }
              />
              {confirmPassword && password !== confirmPassword && (
                <p
                  style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}
                >
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--success)",
                    marginTop: 4,
                  }}
                >
                  ✓ Passwords match
                </p>
              )}
            </div>

            {error && (
              <div className="rp-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="rp-btn">
              {isLoading ? (
                <>
                  <span className="spin">⟳</span> Resetting Password…
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="rp-center-links">
            <button
              className="rp-link"
              style={{ justifyContent: "center" }}
              onClick={() => navigate("/forgot-password")}
            >
              Request new reset link
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
