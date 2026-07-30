"use client";

import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    // --- Element Seçimleri ---
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
    
    // Alt kısımdaki yeni eklenen elementler
    const btn = document.getElementById("filterBtn");
    const sidebar = document.querySelector(".sidebar");
    const footer = document.querySelector("footer");
    const heartButtons = document.querySelectorAll(".heart");

    // --- Fonksiyon Tanımlamaları ---
    function openProfile(e) {
      e.preventDefault();
      loginPopup?.classList.add("active");
    }

    // .heart butonları için de aynı fonksiyonu kullanabiliriz
    function handleHeartClick(e) {
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

    function toggleSidebar() {
      sidebar?.classList.toggle("active");
    }

    function handleScroll() {
      if (!footer || !btn) return;
      const footerTop = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (footerTop < windowHeight) {
        btn.style.position = "absolute";
        btn.style.top = (window.scrollY + footerTop - 80) + "px";
      } else {
        btn.style.position = "fixed";
        btn.style.bottom = "25px";
        btn.style.top = "";
      }
    }

    // --- Olay Dinleyicilerini Ekleme ---
    profileIcon?.addEventListener("click", openProfile);
    openSignup?.addEventListener("click", loginToSignup);
    openLogin?.addEventListener("click", signupToLogin);
    next?.addEventListener("click", nextSlide);
    prev?.addEventListener("click", prevSlide);
    btn?.addEventListener("click", toggleSidebar);
    window.addEventListener("scroll", handleScroll);

    authCloseButtons.forEach((b) => b.addEventListener("click", closePopup));
    [loginPopup, signupPopup].forEach((popup) => popup?.addEventListener("click", outsideClick));
    favButtons.forEach((b) => b.addEventListener("click", openProfile));
    heartButtons.forEach((b) => b.addEventListener("click", handleHeartClick));

    if (prev) {
      prev.classList.add("hidden");
    }

    // --- TEMİZLEME (CLEANUP) FONKSİYONU ---
    // (Her zaman useEffect'in en altında yer almalıdır)
    return () => {
      profileIcon?.removeEventListener("click", openProfile);
      openSignup?.removeEventListener("click", loginToSignup);
      openLogin?.removeEventListener("click", signupToLogin);
      next?.removeEventListener("click", nextSlide);
      prev?.removeEventListener("click", prevSlide);
      btn?.removeEventListener("click", toggleSidebar);
      window.removeEventListener("scroll", handleScroll);

      authCloseButtons.forEach((b) => b.removeEventListener("click", closePopup));
      [loginPopup, signupPopup].forEach((popup) => popup?.removeEventListener("click", outsideClick));
      favButtons.forEach((b) => b.removeEventListener("click", openProfile));
      heartButtons.forEach((b) => b.removeEventListener("click", handleHeartClick));
    };
  }, []);

  return null;
}