'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { urunlerData } from "@/app/data";

// Filtre değerleri veriyle eşleştiği için Türkçe kalıyor; sayfada bu etiketler görünüyor
const FILTER_LABELS = {
  gender: {
    'Erkek': 'Men',
    'Kadın': 'Women',
    'Unisex': 'Unisex'
  },
  category: {
    'Ceketler': 'Jackets',
    'Elbiseler': 'Dresses & Skirts',
    'T-Shirt': 'T-Shirts',
    'Tops': 'Tops',
    'Pantolonlar': 'Trousers',
    'Mücevherat': 'Jewelry',
    'Çantalar': 'Bags',
    'Aksesuarlar': 'Accessories'
  },
  price: {
    '500₺ altı': 'Under 500₺',
    '500₺-1000₺': '500₺ - 1000₺',
    '1000₺-1500₺': '1000₺ - 1500₺',
    '1500₺-2000₺': '1500₺ - 2000₺',
    '2000₺-2500₺': '2000₺ - 2500₺',
    '2500₺+': '2500₺+'
  },
  color: {
    'Kırmızı': 'Red',
    'Mavi': 'Blue',
    'Yeşil': 'Green',
    'Sarı': 'Yellow',
    'Siyah': 'Black',
    'Beyaz': 'White',
    'Pembe': 'Pink',
    'Mor': 'Purple',
    'Kahverengi': 'Brown',
    'Gri': 'Grey'
  }
};

const getLabel = (group, value) => FILTER_LABELS[group]?.[value] || value;

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
      let isAdded = false;
      setFavorites((prev) => {
        const isExist = prev.includes(productId);
        isAdded = !isExist;
        const updated = isExist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];

        sessionStorage.setItem("favorites", JSON.stringify(updated));

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("favoritesUpdated", {
            detail: {
              message: isAdded ? "Product added to favorites!" : "Product removed from favorites.",
              type: isAdded ? "success" : "error"
            }
          }));
        }, 0);

        return updated;
      });
    } else {
      setTimeout(() => window.dispatchEvent(new Event("openLoginModal")), 0);
    }
  };

  // Fiyat Aralığı Değerlendirme
  const checkPriceRange = (productPrice, range) => {
    switch (range) {
      case '500₺ altı': return productPrice < 500;
      case '500₺-1000₺': return productPrice >= 500 && productPrice <= 1000;
      case '1000₺-1500₺': return productPrice >= 1000 && productPrice <= 1500;
      case '1500₺-2000₺': return productPrice >= 1500 && productPrice <= 2000;
      case '2000₺-2500₺': return productPrice >= 2000 && productPrice <= 2500;
      case '2500₺+': return productPrice > 2500;
      default: return true;
    }
  };

  // Filtreleme Algoritması
  const filteredProducts = useMemo(() => {
    return urunlerData.filter((urun) => {
      if (urun.isBestseller) return false;

      if (filters.gender.length > 0 && !filters.gender.includes(urun.cinsiyet)) return false;
      if (filters.category.length > 0 && !filters.category.includes(urun.kategori)) return false;
      if (filters.color.length > 0 && !filters.color.includes(urun.renk)) return false;

      if (filters.size.length > 0) {
        const hasSize = urun.beden?.some((b) => filters.size.includes(b));
        if (!hasSize) return false;
      }

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
          ✨ THE 2026 SUMMER SEASON IS HERE! DON&apos;T MISS UP TO 30% OFF SELECTED ITEMS ✨
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
          <h3>Filter:</h3>

          <div className="filter-group">
            <h4>Gender</h4>
            {['Erkek', 'Kadın', 'Unisex'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.gender.includes(item)}
                  onChange={() => handleFilterChange('gender', item)}
                />{' '}
                {getLabel('gender', item)}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            {['Ceketler', 'Elbiseler', 'T-Shirt', 'Tops', 'Pantolonlar', 'Mücevherat', 'Çantalar', 'Aksesuarlar'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.category.includes(item)}
                  onChange={() => handleFilterChange('category', item)}
                />{' '}
                {getLabel('category', item)}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            {[
              '500₺ altı',
              '500₺-1000₺',
              '1000₺-1500₺',
              '1500₺-2000₺',
              '2000₺-2500₺',
              '2500₺+'
            ].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.price.includes(item)}
                  onChange={() => handleFilterChange('price', item)}
                />{' '}
                {getLabel('price', item)}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Color</h4>
            {['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Siyah', 'Beyaz', 'Pembe', 'Mor', 'Kahverengi', 'Gri'].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={filters.color.includes(item)}
                  onChange={() => handleFilterChange('color', item)}
                />{' '}
                {getLabel('color', item)}
              </label>
            ))}
          </div>

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
              No products match the selected filters.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default function UrunlerPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <UrunlerContent />
    </Suspense>
  );
}