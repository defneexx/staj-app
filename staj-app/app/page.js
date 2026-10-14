"use client";
import Link from 'next/link';
import { useState, useEffect } from "react";
import { urunlerData } from './data';

function HomePage() {
  const [favorites, setFavorites] = useState([]);

  // Kullanıcıya özel dinamik anahtar oluşturan fonksiyon
  const getFavKey = () => {
    if (typeof window === "undefined") return "favorites_guest";
    const user = sessionStorage.getItem("user");
    if (!user) return "favorites_guest";
    
    try {
      const parsedUser = JSON.parse(user);
      const identifier = parsedUser.id || parsedUser.email || parsedUser.username || "default";
      return `favorites_${identifier}`;
    } catch {
      return `favorites_${user}`;
    }
  };

  useEffect(() => {
    const updateFavsFromStorage = () => {
      const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");
      if (isLoggedIn) {
        const userFavKey = getFavKey();
        const saved = JSON.parse(localStorage.getItem(userFavKey) || "[]");
        setFavorites(saved);
      } else {
        setFavorites([]);
      }
    };

    updateFavsFromStorage();
    window.addEventListener("favoritesUpdated", updateFavsFromStorage);
    return () => window.removeEventListener("favoritesUpdated", updateFavsFromStorage);
  }, []);

  const handleFavClick = (e, productId) => {
    // Tıklamanın Link bileşenine sıçrayıp sayfayı değiştirmesini engelliyoruz
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");

    if (isLoggedIn) {
      const userFavKey = getFavKey();
      let isAdded = false;

      setFavorites((prev) => {
        const isExist = prev.includes(productId);
        isAdded = !isExist;
        const updated = isExist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];

        // Ortak key yerine kullanıcıya özel key ile localStorage'a kaydediyoruz
        localStorage.setItem(userFavKey, JSON.stringify(updated));

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

  const bestsellerProducts = urunlerData.filter((item) => item.isBestseller === true);

  return (
    <main>
      <section className="first">
        <img src="image/brand7.png" alt="Brand" className="image" />
        <div className="mobile">
          <img src="image/mob2.png" alt="mobile" className="mobile-image" />
        </div>
        <div className="content">
          <h1 className="title">DISCOVER YOUR STYLE</h1>
          <p className="description">
            We are a leading fashion brand offering high-quality clothing, carefully designed for your unique style. 
            Explore our curated collection, from modern designs and premium leather jackets
            to timeless pieces for every occasion.
          </p>
          <div className="button-container">
            <Link href="/urunler" className="button-shop">
              SHOP NOW
            </Link>
            <a href="/about" className="button-learn">
              LEARN MORE
            </a>
          </div>
        </div>
      </section>

      {/* ÇOK SATANLAR ALANI */}
      <section className="best-seller">
        <h2 className="bs-title">BEST SELLERS</h2>
        <div className="slider-container">
          <button className="slider-btn prev hidden">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="slider-bs">
            {bestsellerProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              return (
                <div key={product.id} className="product-card">
                  <Link 
                    href={`/urunler/${product.id}`} 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                  >
                    <div className="image-holder">
                      <button className="fav-btn" onClick={(e) => handleFavClick(e, product.id)}>
                        <i
                          className={isFav ? "fas fa-heart" : "far fa-heart"}
                          style={{ color: isFav ? "#8b0000" : "inherit" }}
                        />
                      </button>
                      <img src={product.resimAna} alt={product.isim} />
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.isim}</h3>
                      <div className="product-meta">
                        <span className="product-price">{product.fiyat}</span>
                        <span className="product-rating">
                          <i className="fas fa-star" /> 4.8
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          <button className="slider-btn next">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
        <div className="view-all-container">
          <Link href="/urunler" className="view-all-btn">
            VIEW ALL
          </Link>
        </div>
      </section>

      <section className="second">
        <div className="ads">
          <img src="image/111.jpg" alt="adone" className="mobile-image" />
          <img src="image/222.jpg" alt="adtwo" className="mobile-image" />
          <img src="image/444.jpg" alt="adthre" className="mobile-image" />
        </div>
        <div className="contentn">
          <h2 className="titlen">ON SALE NOW</h2>
          <Link href="/urunler" className="sale-btn">
            SHOP THE COLLECTION
          </Link>
          <h2 className="titley">UP TO 50% OFF</h2>
        </div>
      </section>

      {/* KATEGORİLER ALANI */}
      <section className="categories">
        <h2 className="cat-title">CATEGORIES</h2>
        <div className="slider-c">
          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/dress.png" alt="Dresses" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Elbiseler" className="product-link">
                Dresses <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/shirt.png" alt="Shirts" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=T-Shirt" className="product-link">
                Tops <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/acc.jpeg" alt="Jewelry" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Aksesuarlar" className="product-link">
                Jewelry <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/shoe.png" alt="Shoes" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Ayakkabılar" className="product-link">
                Shoes <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/jacket.png" alt="Jacket" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Ceketler" className="product-link">
                Jackets <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/bag.png" alt="Bags" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Çantalar" className="product-link">
                Bags <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/pant9.png" alt="Pants" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Pantolonlar" className="product-link">
                Trousers <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/polo.png" alt="Sweater" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Tops" className="product-link">
                Sweatshirts <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;