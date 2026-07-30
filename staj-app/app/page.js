"use client";
import Link from 'next/link';
import { useState, useEffect } from "react";
import { urunlerData } from './data';

function HomePage() {
  const [favorites, setFavorites] = useState([]);

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

  const handleFavClick = (productId) => {
    const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");

    isLoggedIn
      ? setFavorites((prev) => {
          const isExist = prev.includes(productId);
          const updated = isExist
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];

          sessionStorage.setItem("favorites", JSON.stringify(updated));
          setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);
          return updated;
        })
      : setTimeout(() => window.dispatchEvent(new Event("openLoginModal")), 0);
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
            We are a leading fashion brand that offers high-quality apparel
            crafted for your unique style. Explore our curated collection of
            contemporary designs, premium leather jackets, and timeless statements
            tailored for every occasion.
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

      <section className="best-seller">
        <h2 className="bs-title">BESTSELLER</h2>
        <div className="slider-container">
          <button className="slider-btn prev hidden">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="slider-bs">
            {bestsellerProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              return (
                <div key={product.id} className="product-card">
                  <div className="image-holder">
                    <button className="fav-btn" onClick={() => handleFavClick(product.id)}>
                      <i 
                        className={isFav ? "fas fa-heart" : "far fa-heart"} 
                        style={{ color: isFav ? "#8b0000" : "inherit" }}
                      />
                    </button>
                    <img src={product.resimAna} alt={product.isim} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.isim}</h3>
                    <p className="product-category">{product.kategori}</p>
                    <div className="product-meta">
                      <span className="product-price">{product.fiyat}</span>
                      <span className="product-rating">
                        <i className="fas fa-star" /> 4.8
                      </span>
                    </div>
                  </div>
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
          <h2 className="titlen">SALE NOW</h2>
          <a href="#" className="sale-btn">
            SEE COLLECTION
          </a>
          <h2 className="titley">UP TO 50% OFF</h2>
        </div>
      </section>

      {/* KATEGORİLER ALANI (LİNKLER UPDATE EDİLDİ) */}
      <section className="categories">
        <h2 className="cat-title">CATEGORIES</h2>
        <div className="slider-c">
          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/dress.png" alt="Dresses" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Dresses" className="product-link">
                Dresses <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/shirt.png" alt="Shirts" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Tops" className="product-link">
                Shirts <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/acc.jpeg" alt="Jewelry" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Jewelry" className="product-link">
                Jewelry <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/shoe.png" alt="Shoes" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Shoes" className="product-link">
                Shoes <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/jacket.png" alt="Jacket" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Jackets" className="product-link">
                Jackets <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/bag.png" alt="Bags" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Bags" className="product-link">
                Bags <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/pant9.png" alt="Pants" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Pants" className="product-link">
                Pants <span>→</span>
              </Link>
            </div>
          </div>

          <div className="product-card1">
            <div className="image-holder1">
              <img src="image/polo.png" alt="Sweater" />
            </div>
            <div className="category-info">
              <Link href="/urunler?category=Tops" className="product-link">
                Sweater <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;