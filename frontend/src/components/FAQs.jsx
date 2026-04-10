import React, { useState } from "react";
import "./FAQs.css";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Breadcrumb from "../components/Breadcrumb";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqCategories = [
    {
      category: "Booking & Reservations",
      icon: "fa-ticket-alt",
      faqs: [
        {
          question: "How do I book a flight?",
          answer: "You can book a flight through our website by selecting your travel dates, destinations, and preferred flight options. You can also book through our mobile app or contact our customer service for assistance."
        },
        {
          question: "Can I change or cancel my booking?",
          answer: "Yes, you can modify or cancel your booking through the 'Manage Booking' section on our website. Changes are subject to fare differences and applicable fees. Please check your fare rules for specific conditions."
        },
        {
          question: "How early should I arrive at the airport?",
          answer: "We recommend arriving at least 2 hours before domestic flights and 3 hours before international flights to allow sufficient time for check-in, security screening, and boarding."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and various digital payment methods depending on your location."
        }
      ]
    },
    {
      category: "Baggage",
      icon: "fa-suitcase",
      faqs: [
        {
          question: "What is your baggage allowance?",
          answer: "Baggage allowance varies by fare class and route. Generally, economy class includes 1 carry-on bag (7kg) and 1 checked bag (23kg). Business class includes 2 carry-on bags and 2 checked bags (32kg each)."
        },
        {
          question: "What items are prohibited in baggage?",
          answer: "Prohibited items include flammable materials, explosives, sharp objects, and liquids over 100ml in carry-on baggage. Check our website for a complete list of restricted items."
        },
        {
          question: "Can I purchase additional baggage allowance?",
          answer: "Yes, you can purchase additional baggage allowance during booking or through the 'Manage Booking' section. Prices vary by route and weight."
        },
        {
          question: "What if my baggage is lost or damaged?",
          answer: "In case of lost or damaged baggage, please report immediately to our baggage service office at the airport. You can also file a claim through our website within 7 days of arrival."
        }
      ]
    },
    {
      category: "Check-in & Boarding",
      icon: "fa-check-circle",
      faqs: [
        {
          question: "When does online check-in open?",
          answer: "Online check-in opens 24 hours before departure and closes 60 minutes before departure for domestic flights, and 90 minutes for international flights."
        },
        {
          question: "What do I need for check-in?",
          answer: "You'll need your booking reference or e-ticket number, and valid identification (passport for international flights, government ID for domestic flights)."
        },
        {
          question: "Can I select my seat in advance?",
          answer: "Yes, seat selection is available during booking or through 'Manage Booking'. Some seats may require an additional fee depending on your fare type."
        },
        {
          question: "What is the boarding process?",
          answer: "Boarding begins 45 minutes before departure. We board by zones, starting with passengers needing assistance, followed by business class, then economy class by rows."
        }
      ]
    },
    {
      category: "Travel Requirements",
      icon: "fa-passport",
      faqs: [
        {
          question: "What travel documents do I need?",
          answer: "Requirements vary by destination. Generally, you need a valid passport (with at least 6 months validity), visas if required, and any necessary health certificates."
        },
        {
          question: "Do I need travel insurance?",
          answer: "While not mandatory, we strongly recommend travel insurance to protect against unexpected events like trip cancellations, medical emergencies, or lost baggage."
        },
        {
          question: "Are there special meals available?",
          answer: "Yes, we offer various special meals (vegetarian, vegan, halal, kosher, etc.). These must be requested at least 24 hours before departure through 'Manage Booking'."
        },
        {
          question: "Can I travel with my pet?",
          answer: "Yes, we allow pets in cabin and as checked baggage, subject to specific regulations and fees. Advance notification is required. Contact our customer service for details."
        }
      ]
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (

    <div className="faqs-page">
       <Navbar/>
      {/* Hero Section */}
      <Breadcrumb title="FAQs" />

      {/* Quick Categories */}
      <section className="faqs-categories">
        <div className="faqs-container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {faqCategories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h3>{category.category}</h3>
                <p>{category.faqs.length} questions</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faqs-accordion-section">
        <div className="faqs-container">
          <div className="faqs-accordion">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="faq-category">
                <h3 className="category-title">
                  <i className={`fas ${category.icon}`}></i>
                  {category.category}
                </h3>
                <div className="faq-items">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = `${categoryIndex}-${faqIndex}`;
                    return (
                      <div 
                        key={faqIndex} 
                        className={`faq-item ${activeIndex === globalIndex ? "active" : ""}`}
                      >
                        <div 
                          className="faq-question"
                          onClick={() => toggleFaq(globalIndex)}
                        >
                          <h4>{faq.question}</h4>
                          <i className={`fas ${activeIndex === globalIndex ? "fa-minus" : "fa-plus"}`}></i>
                        </div>
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="faqs-contact">
        <div className="faqs-container">
          <div className="contact-box">
            <h2>Still Have Questions?</h2>
            <p>Can't find the answer you're looking for? Please contact our support team.</p>
            <div className="contact-options">
              <div className="contact-option">
                <i className="fas fa-phone-alt"></i>
                <h4>Call Us</h4>
                <p>24/7 Customer Support</p>
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </div>
              <div className="contact-option">
                <i className="fas fa-envelope"></i>
                <h4>Email Us</h4>
                <p>Get reply within 24 hours</p>
                <a href="mailto:support@skyjet.com">support@skyjet.com</a>
              </div>
              <div className="contact-option">
                <i className="fas fa-comment"></i>
                <h4>Live Chat</h4>
                <p>Instant support</p>
                <button className="chat-btn">Start Chat</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </div>
  );
};

export default FAQs;