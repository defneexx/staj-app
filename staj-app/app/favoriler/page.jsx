'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { urunlerData } from '@/app/data';

export default function FavorilerPage() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Favori ürünleri ve giriş durumunu yükleme
  const loadFavorites = () => {
    if (typeof window === "undefined") return;

    const loggedIn = Boolean(sessionStorage.getItem("user"));
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const savedIds = JSON.parse(sessionStorage.getItem("favorites") || "[]").map(Number);
      // Data dosyamızdan sadece favori ID'leri eşleşen ürünleri çekiyoruz
      const favs = urunlerData.filter((urun) => savedIds.includes(Number(urun.id)));
      setFavoriteProducts(favs);
    } else {
      setFavoriteProducts([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadFavorites();

    // Favoriler başka bir yerde değişirse (örn: header, alt menü) sayfayı canlı güncelle
    window.addEventListener("favoritesUpdated", loadFavorites);
    return () => window.removeEventListener("favoritesUpdated", loadFavorites);
  }, []);

  // Favoriden Kaldırma Fonksiyonu
  const handleRemoveFavorite = (productId) => {
    if (typeof window === "undefined") return;

    const savedIds = JSON.parse(sessionStorage.getItem("favorites") || "[]").map(Number);
    const updatedIds = savedIds.filter((id) => id !== Number(productId));

    sessionStorage.setItem("favorites", JSON.stringify(updatedIds));
    
    // Değişikliği tüm uygulamaya duyur
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const formatSrc = (src) => (src && !src.startsWith('/') ? `/${src}` : src);

  if (isLoading) {
    return (
      <main className="favorites-container">
        <div className="favorites-loading">Yükleniyor...</div>
      </main>
    );
  }

  // Giriş Yapılmamışsa Gösterilecek Ekran
  if (!isLoggedIn) {
    return (
      <main className="favorites-container">
        <div className="empty-favorites">
          <i className="fa-regular fa-heart empty-icon"></i>
          <h2>Favorilerinizi Görmek İçin Giriş Yapın</h2>
          <p>Beğendiğiniz ürünleri favorilerinize eklemek ve listelemek için lütfen hesabınıza giriş yapın.</p>
          <button 
            className="fav-login-btn"
            onClick={() => window.dispatchEvent(new Event("openLoginModal"))}
          >
            Giriş Yap / Kayıt Ol
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="favorites-container">
      <div className="favorites-header">
        <h1>Favorilerim</h1>
        <span className="fav-count">{favoriteProducts.length} Ürün</span>
      </div>

      {favoriteProducts.length === 0 ? (
        /* Favori Listesi Boşsa */
        <div className="empty-favorites">
          <i className="fa-regular fa-heart empty-icon"></i>
          <h2>Favori Listeniz Henüz Boş</h2>
          <p>Henüz favorilerinize bir ürün eklemediniz. Tarzınıza uygun ürünleri keşfetmeye başlayın!</p>
          <Link href="/urunler" className="browse-btn">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        /* Favori Ürünler Grid Listesi */
        <div className="product-grid">
          {favoriteProducts.map((urun) => (
            <div className="card" key={urun.id}>
              <div className="image-box">
                {/* Kalp İkonu (Tıklayınca Favoriden Çıkarır) */}
                <button 
                  className="heart active"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavorite(urun.id);
                  }}
                  title="Favorilerden Çıkar"
                >
                  <i className="fas fa-heart" style={{ color: "#8b0000" }} />
                </button>

                <Link href={`/urunler/${urun.id}`}>
                  <img src={formatSrc(urun.resimAna)} className="main-img" alt={urun.isim} />
                  <img src={formatSrc(urun.resimHover || urun.resimAna)} className="hover-img" alt={urun.isim} />
                </Link>
              </div>

              <Link href={`/urunler/${urun.id}`}>
                <h4>{urun.isim}</h4>
                {urun.eskiFiyat ? (
                  <div className="price">
                    <p className="sale-price">{urun.fiyat}</p>
                    <p className="old-price">{urun.eskiFiyat}</p>
                  </div>
                ) : (
                  <p>{urun.fiyat}</p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}