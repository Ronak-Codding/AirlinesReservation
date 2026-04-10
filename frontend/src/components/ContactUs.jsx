import React, { useState } from "react";
import "./Contact.css";
import { validateForm } from "../utils/formValidator";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Contact = () => {
  const [errors, setErrors] = useState({});
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value,
    });
  };
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(contactForm);

    if (Object.keys(validationErrors).length === 0) {
      alert("Form Valid ✅");
      console.log(contactForm);
    } else {
      setErrors(validationErrors);
    }

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormStatus({
          submitted: true,
          success: false,
          message: data.message || "Failed to send message",
        });
        return;
      }

      setFormStatus({
        submitted: true,
        success: true,
        message: "Message sent successfully!",
      });

      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: "",
        });
      }, 3000);
    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">
       <Breadcrumb title="Contact Us" />

        {/* Contact Information Cards */}
        <section className="contact-info-section">
          <div className="container">
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <h3>Call Us</h3>
                <p>24/7 Customer Support</p>
                <a href="tel:+1234567890">+1 (234) 567-890</a>
                <a href="tel:+1987654321">+1 (987) 654-321</a>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>Email Us</h3>
                <p>Get quick response via email</p>
                <a href="mailto:support@skyjet.com">support@skyjet.com</a>
                <a href="mailto:info@skyjet.com">info@skyjet.com</a>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>Visit Us</h3>
                <p>Main Office</p>
                <address>
                  123 Aviation Avenue
                  <br />
                  Skyline District
                  <br />
                  New York, NY 10001
                  <br />
                  United States
                </address>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <div className="container">
            <div className="form-container">
              <div className="form-header">
                <h2>Send Us a Message</h2>
              </div>

              {formStatus.submitted && (
                <div
                  className={`alert ${formStatus.success ? "alert-success" : "alert-error"}`}
                >
                  {formStatus.message}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Enter your full name"
                    />
                    <p style={{ color: "red" }}>{errors.name}</p>
                  </div>

                  <div className="form-group">
                    <label className="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Enter your email"
                    />
                    <p style={{ color: "red" }}>{errors.email}</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      placeholder="Enter your phone number"
                    />
                    <p style={{ color: "red" }}>{errors.phone}</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>

                    <div className="select-wrapper">
                      <select
                        id="subject"
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleContactChange}
                      >
                        <option value="">Select a subject</option>
                        <option value="booking">Flight Booking</option>
                        <option value="cancellation">
                          Cancellation / Change
                        </option>
                        <option value="baggage">Baggage Inquiry</option>
                        <option value="refund">Refund Request</option>
                        <option value="feedback">Feedback / Complaint</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows="3"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <button type="submit" className="submit-btn">
                    Send Message <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="container">
            <div className="map-container">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059445135!2d-74.25986548248684!3d40.697149422326044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1644262073400!5m2!1sen!2s"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="contact-faq">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How quickly do you respond?</h3>
                <p>
                  We aim to respond to all inquiries within 24 hours during
                  business days.
                </p>
              </div>
              <div className="faq-item">
                <h3>Do you have 24/7 support?</h3>
                <p>
                  Yes, our customer support is available 24/7 for urgent
                  matters.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I book over the phone?</h3>
                <p>
                  Absolutely! Our representatives can help you book flights over
                  the phone.
                </p>
              </div>
              <div className="faq-item">
                <h3>What are your office hours?</h3>
                <p>
                  Monday-Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer></Footer>
    </>
  );
};

export default Contact;
