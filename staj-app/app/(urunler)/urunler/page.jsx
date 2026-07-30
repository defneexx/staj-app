'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { urunlerData } from "@/app/data";

function UrunlerContent() {
  const searchParams = useSearchParams();
  const [favorites, setFavorites] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Seçilen Filtreler State'i
  const [filters, setFilters] = useState({
    gender: [],
    category: [],
    price: [],
    color: [],
    size: []
  });

  // URL'den gelen kategori ve cinsiyet parametrelerini bağımsız yakalama
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const genderParam = searchParams.get('gender');

    setFilters((prev) => ({
      ...prev,
      category: categoryParam ? [categoryParam] : [],
      gender: genderParam ? [genderParam] : []
    }));
  }, [searchParams]);

  // Favori Dinleme
  useEffect(() => {
    const updateFavsFromStorage = () => {
      const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");
      isLoggedIn
        ? setFavorites(JSON.parse(sessionStorage.getItem("favorites") || "[]"))
        : setFavorites([]);
    };

    updateFavsFromStorage();
    window.addEventListener("favoritesUpdated", updateFavsFromStorage);
    return () => window.removeEventListener("favoritesUpdated", updateFavsFromStorage);
  }, []);

  // Checkbox Değişim Mantığı
  const handleFilterChange = (categoryKey, value) => {
    setFilters((prev) => {
      const currentList = prev[categoryKey];
      const updatedList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];

      return { ...prev, [categoryKey]: updatedList };
    });
  };

  // Favori Tıklama
  const handleFavClick = (productId) => {
    const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");

    if (isLoggedIn) {
      setFavorites((prev) => {
        const isExist = prev.includes(productId);
        const updated = isExist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];

        sessionStorage.setItem("favorites", JSON.stringify(updated));
        setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);
        return updated;
      });
    } else {
      setTimeout(() => window.dispatchEvent(new Event("openLoginModal")), 0);
    }
  };

  // Fiyat Aralığı Değerlendirme
  const checkPriceRange = (productPrice, range) => {
    switch (range) {
      case 'Under $500': return productPrice < 500;
      case '$500-$1000': return productPrice >= 500 && productPrice <= 1000;
      case '$1000-$1500': return productPrice >= 1000 && productPrice <= 1500;
      case '$1500-$2000': return productPrice >= 1500 && productPrice <= 2000;
      case '$2000-$2500': return productPrice >= 2000 && productPrice <= 2500;
      case '$2500+': return productPrice > 2500;
      default: return true;
    }
  };

  // Filtreleme Algoritması
  const filteredProducts = useMemo(() => {
    return urunlerData.filter((urun) => {
      // 0. Bestseller Ürünlerini Katalog Sayfasında Gizle
      if (urun.isBestseller) {
        return false;
      }

      // 1. Cinsiyet Filtresi
      if (filters.gender.length > 0 && !filters.gender.includes(urun.cinsiyet)) {
        return false;
      }

      // 2. Kategori Filtresi
      if (filters.category.length > 0 && !filters.category.includes(urun.kategori)) {
        return false;
      }

      // 3. Renk Filtresi
      if (filters.color.length > 0 && !filters.color.includes(urun.renk)) {
        return false;
      }

      // 4. Beden Filtresi
      if (filters.size.length > 0) {
        const hasSize = urun.beden?.some((b) => filters.size.includes(b));
        if (!hasSize) return false;
      }

      // 5. Fiyat Filtresi
      if (filters.price.length > 0) {
        const matchesPrice = filters.price.some((range) => checkPriceRange(urun.fiyatSayisal, range));
        if (!matchesPrice) return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <>
      <div className="top-banner">
        <p>
          ✨ 2026 YAZ SEZONU BAŞLADI! SEÇİLİ ÜRÜNLERDE %30'A VARAN İNDİRİMLERİ KAÇIRMAYIN ✨
        </p>
      </div>
      <div className="banner-container">
        <img src="/image/banner2.png" alt="Banner" className="banner-img" />
      </div>
      <button
        id="filterBtn"
        className="filter-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        suppressHydrationWarning
      >
        <i className="fa-solid fa-sliders" />
      </button>

      <main className="shop-container">
        <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div id="overlay" onClick={() => setIsSidebarOpen(false)} />
          <h3>Filtered by:</h3>

          {/* Gender Filter */}
          <div className="filter-group">
            <h4>Gender</h4>
            {['Men', 'Women', 'Unisex'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.gender.includes(item)}
                  onChange={() => handleFilterChange('gender', item)}
                />{' '}
                {item}
              </label>
            ))}
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4>Categories</h4>
            {['Jackets', 'Dresses', 'T-Shirt', 'Tops', 'Pants', 'Jewelry', 'Bags', 'Accessories'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.category.includes(item)}
                  onChange={() => handleFilterChange('category', item)}
                />{' '}
                {item}
              </label>
            ))}
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <h4>Price</h4>
            {[
              'Under $500',
              '$500-$1000',
              '$1000-$1500',
              '$1500-$2000',
              '$2000-$2500',
              '$2500+'
            ].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.price.includes(item)}
                  onChange={() => handleFilterChange('price', item)}
                />{' '}
                {item}
              </label>
            ))}
          </div>

          {/* Color Filter */}
          <div className="filter-group">
            <h4>Color</h4>
            {['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Brown', 'Grey'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.color.includes(item)}
                  onChange={() => handleFilterChange('color', item)}
                />{' '}
                {item}
              </label>
            ))}
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <h4>Size</h4>
            {['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.size.includes(item)}
                  onChange={() => handleFilterChange('size', item)}
                />{' '}
                {item}
              </label>
            ))}
          </div>
        </aside>

        {/* Product List */}
        <section className="products">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((urun) => (
              <div className="card" key={urun.id}>
                <div className="image-box">
                  <button
                    className="heart"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavClick(urun.id);
                    }}
                  >
                    <i
                      className={favorites.includes(urun.id) ? "fas fa-heart" : "far fa-heart"}
                      style={{ color: favorites.includes(urun.id) ? "#8b0000" : "inherit" }}
                    />
                  </button>
                  <Link href={`/urunler/${urun.id}`}>
                    <img src={urun.resimAna} className="main-img" alt={urun.isim} />
                    <img src={urun.resimHover} className="hover-img" alt={urun.isim} />
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
                    <p className="price">{urun.fiyat}</p>
                  )}
                </Link>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
              Aradığınız filtrelere uygun ürün bulunamadı.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// Next.js static build hatalarını önlemek için Suspense boundary
export default function UrunlerPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>}>
      <UrunlerContent />
    </Suspense>
  );
}