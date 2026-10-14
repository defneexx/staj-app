"use client";

import { useState } from "react";

const ContactPage = () => {
  const [isimSoy, setisimSoy] = useState("");
  const [epost, setepost] = useState("");
  const [konu, setkonu] = useState("");
  const [mesaj, setmesaj] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Hata durumları
  const [errors, setErrors] = useState({});

 const onaylatusu = (e) => {
  e.preventDefault();

  let newErrors = {};

  if (!isimSoy.trim()) {
    newErrors.isimSoy = "Please enter your full name.";
  }

  // E-posta boş mu ve geçerli bir formatta mı kontrolü:
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!epost.trim()) {
    newErrors.epost = "Please enter your email address.";
  } else if (!emailRegex.test(epost)) {
    newErrors.epost = "Please enter a valid email address (e.g. example@mail.com).";
  }

  if (!konu.trim()) {
    newErrors.konu = "Please enter a subject.";
  }
  if (!mesaj.trim()) {
    newErrors.mesaj = "Please enter your message.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    setIsVisible(true);
  }
};

  const geriDon = () => {
    setisimSoy("");
    setepost("");
    setkonu("");
    setmesaj("");
    setErrors({});
    setIsVisible(false);
  };

  return (
    <>
      <section className="contact-section">
        <div className="contact-title">
          <h2>Get in Touch</h2>
        </div>
        <div className="contact-container">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="info-box">
              <i className="fa-solid fa-location-dot" />
              <span>Ankara, Türkiye</span>
            </div>
            <div className="info-box">
              <i className="fa-solid fa-envelope" />
              <span>info@modashop.com</span>
            </div>
            <div className="info-box">
              <i className="fa-solid fa-phone" />
              <span>+90 555 123 45 67</span>
            </div>
            <div className="info-box">
              <i className="fa-solid fa-clock" />
              <span>Mon - Fri | 09:00 - 18:00</span>
            </div>
          </div>

          <div className="contact-form">
            {!isVisible ? (
              <form onSubmit={onaylatusu} noValidate>
                <div className="field-block">
                  <input
                    type="text"
                    onChange={(e) => setisimSoy(e.target.value)}
                    placeholder="Full Name"
                    value={isimSoy}
                    className={errors.isimSoy ? "input-error" : ""}
                  />
                  {errors.isimSoy && (
                    <span className="error-text">{errors.isimSoy}</span>
                  )}
                </div>

                <div className="field-block">
                  <input
                    type="email"
                    onChange={(e) => setepost(e.target.value)}
                    placeholder="Email"
                    value={epost}
                    className={errors.epost ? "input-error" : ""}
                  />
                  {errors.epost && (
                    <span className="error-text">{errors.epost}</span>
                  )}
                </div>

                <div className="field-block">
                  <input
                    type="text"
                    onChange={(e) => setkonu(e.target.value)}
                    placeholder="Subject"
                    value={konu}
                    className={errors.konu ? "input-error" : ""}
                  />
                  {errors.konu && (
                    <span className="error-text">{errors.konu}</span>
                  )}
                </div>

                <div className="field-block">
                  <textarea
                    placeholder="Your Message"
                    value={mesaj}
                    onChange={(e) => setmesaj(e.target.value)}
                    className={errors.mesaj ? "input-error" : ""}
                  />
                  {errors.mesaj && (
                    <span className="error-text">{errors.mesaj}</span>
                  )}
                </div>

                <button type="submit">Send Message</button>
              </form>
            ) : (
// ... üst kısımlar aynı
  <div className="contact-form1">
    {/* Onay İkonu */}
    <div className="success-icon">
      <i className="fa-solid fa-circle-check" />
    </div>

    <h1>Thank You!</h1>
    <p>Your message has been received. We'll get back to you as soon as possible.</p>

    <button type="button" onClick={geriDon}>
      Go Back
    </button>
  </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;