"use client";

import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    const profileIcon = document.getElementById("profileIcon");
    const loginPopup = document.getElementById("authOverlay");
    const signupPopup = document.getElementById("signup");
    const openSignup = document.getElementById("openSignup");
    const openLogin = document.getElementById("openLogin");
    const slider = document.querySelector(".slider-bs");
    const next = document.querySelector(".next");
    const prev = document.querySelector(".prev");
    const favButtons = document.querySelectorAll(".fav-btn");
    const authCloseButtons = document.querySelectorAll(".auth-close");

    function openProfile(e) {
      e.preventDefault();
      loginPopup?.classList.add("active");
    }

    function loginToSignup(e) {
      e.preventDefault();
      loginPopup?.classList.remove("active");
      signupPopup?.classList.add("active");
    }

    function signupToLogin(e) {
      e.preventDefault();
      signupPopup?.classList.remove("active");
      loginPopup?.classList.add("active");
    }

    function closePopup() {
      loginPopup?.classList.remove("active");
      signupPopup?.classList.remove("active");
    }

    function outsideClick(e) {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove("active");
      }
    }

    function nextSlide() {
      if (!slider) return;
      slider.scrollBy({ left: slider.clientWidth, behavior: "smooth" });
      prev?.classList.remove("hidden");
      next?.classList.add("hidden");
    }

    function prevSlide() {
      if (!slider) return;
      slider.scrollBy({ left: -slider.clientWidth, behavior: "smooth" });
      next?.classList.remove("hidden");
      prev?.classList.add("hidden");
    }

    // Dinleyicileri Ekle
    profileIcon?.addEventListener("click", openProfile);
    openSignup?.addEventListener("click", loginToSignup);
    openLogin?.addEventListener("click", signupToLogin);
    next?.addEventListener("click", nextSlide);
    prev?.addEventListener("click", prevSlide);

    authCloseButtons.forEach((btn) => btn.addEventListener("click", closePopup));
    [loginPopup, signupPopup].forEach((popup) => popup?.addEventListener("click", outsideClick));
    favButtons.forEach((btn) => btn.addEventListener("click", openProfile));

    if (prev) {
      prev.classList.add("hidden");
    }

    // Temizleme Fonksiyonu (Component unmount olduğunda çalışır)
    return () => {
      profileIcon?.removeEventListener("click", openProfile);
      openSignup?.removeEventListener("removeEventListener", loginToSignup);
      openLogin?.removeEventListener("click", signupToLogin);
      next?.removeEventListener("click", nextSlide);
      prev?.removeEventListener("click", prevSlide);
      authCloseButtons.forEach((btn) => btn.removeEventListener("click", closePopup));
      [loginPopup, signupPopup].forEach((popup) => popup?.removeEventListener("click", outsideClick));
      favButtons.forEach((btn) => btn.removeEventListener("click", openProfile));
    };
  }, []);

  return null; // Ekrana bir şey basmaz, sadece scriptleri çalıştırır
}