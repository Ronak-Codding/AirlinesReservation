import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

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

  const [otpState, setOtpState] = useState({
    showOtpInput: false,
    otp: "",
    generatedOtp: "",
    isVerified: false,
    timer: 0,
    canResend: true,
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpState.timer > 0) {
      interval = setInterval(() => {
        setOtpState((prev) => ({
          ...prev,
          timer: prev.timer - 1,
          canResend: false,
        }));
      }, 2000);
    } else {
      setOtpState((prev) => ({ ...prev, canResend: true }));
    }
    return () => clearInterval(interval);
  }, [otpState.timer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpState((prev) => ({ ...prev, otp: value }));
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleSendOTP = async () => {
    // Phone validation hata ke email validation karo
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Valid email required" }));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setOtpState((prev) => ({
        ...prev,
        showOtpInput: true,
        timer: 120,
        canResend: false,
      }));

      alert(`OTP sent to ${formData.email}! Check your inbox.`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, otp: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpState.otp) {
      setErrors((prev) => ({ ...prev, otp: "Please enter OTP" }));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpState.otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setOtpState((prev) => ({ ...prev, isVerified: true }));
      setErrors((prev) => ({ ...prev, otp: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, otp: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and number";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    // OTP Verification
    if (!otpState.isVerified) {
      newErrors.otp = "Please verify your mobile number first";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const data = await response.json();

      if (!response.ok) {
        setErrors({ apiError: data.message });
        setIsLoading(false);
        return;
      }

      // Send login details email
      await fetch("http://localhost:5000/api/otp/send-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      setRegistrationSuccess(true);
      setIsLoading(false);

      if (onRegister) {
        onRegister(data.user);
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrors({ apiError: "Server not responding" });
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Back Button */}
      <button className="back-to-landing" onClick={() => navigate("/")}>
        <i className="fas fa-arrow-left"></i>
        Back to Home
      </button>

      <div className="register-wrapper">
        <div className="register-card">
          {registrationSuccess ? (
            <div className="registration-success">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Registration Successful!</h2>
              <p>Your account has been created successfully.</p>
              <p>Redirecting to login...</p>
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            </div>
          ) : (
            <>
              <div className="register-header">
                <h2>Create Your Account</h2>
                <p className="subtitle">
                  Join thousands of travelers worldwide
                </p>
              </div>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className={errors.firstName ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <span className="error-message">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Enter your middle name"
                      className={errors.middleName ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.middleName && (
                      <span className="error-message">{errors.middleName}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className={errors.lastName ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <span className="error-message">{errors.lastName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i> Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className={errors.username ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <span className="error-message">{errors.username}</span>
                    )}
                  </div>
                </div>

                <div className="form-group phone-otp-group">
                  <label>
                    <i className="fas fa-envelope"></i> Email Address
                  </label>
                  <div className="phone-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`phone-input ${errors.email ? "error" : ""} ${otpState.isVerified ? "verified" : ""}`}
                      disabled={isLoading || otpState.isVerified}
                    />
                    {!otpState.isVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={
                          isLoading || !formData.email || otpState.timer > 0
                        }
                        className="send-otp-btn"
                      >
                        {isLoading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : otpState.timer > 0 ? (
                          `${otpState.timer}s`
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    ) : (
                      <span className="verified-badge">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    )}
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* OTP Input Section */}
                {otpState.showOtpInput && !otpState.isVerified && (
                  <div className="otp-verification-section">
                    <div className="otp-input-wrapper">
                      <input
                        type="text"
                        value={otpState.otp}
                        onChange={handleOtpChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        className={`otp-input ${errors.otp ? "error" : ""}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpState.otp.length !== 6 || isLoading}
                        className="verify-otp-btn"
                      >
                        Verify
                      </button>
                    </div>

                    {otpState.timer > 0 && (
                      <p className="otp-timer">
                        Resend OTP in {otpState.timer} seconds
                      </p>
                    )}

                    {otpState.canResend && !otpState.isVerified && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="resend-otp-link"
                      >
                        Resend OTP
                      </button>
                    )}

                    {errors.otp && (
                      <span className="error-message">{errors.otp}</span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    className={errors.phone ? "error" : ""}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-lock"></i> Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={errors.password ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                    <span className="password-hint">
                      Min 8 chars with uppercase, lowercase & number
                    </span>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="fas fa-lock"></i> Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={errors.confirmPassword ? "error" : ""}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group terms-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <span>
                      I agree to the <Link to="/terms">Terms & Conditions</Link>
                      and <Link to="/privacy">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <span className="error-message">
                      {errors.termsAccepted}
                    </span>
                  )}
                </div>

                {errors.apiError && (
                  <div className="error-message api-error">
                    {errors.apiError}
                  </div>
                )}

                <button
                  type="submit"
                  className="register-button"
                  disabled={isLoading || !otpState.isVerified}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Creating
                      Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="divider">
                  <span>Already have an account?</span>
                </div>

                <button
                  type="button"
                  className="login-link-button"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
