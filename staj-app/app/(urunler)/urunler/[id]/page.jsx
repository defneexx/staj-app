'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { urunlerData } from '@/app/data';

// Ekranda gösterilecek standart butonlar (Kısaltma olarak)
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// Ekranda gösterilen butonlar ile data.js içerisindeki tam metinlerin eşleşme haritası
const SIZE_MAP = {
  'XS': 'Extra Small',
  'S': 'Small',
  'M': 'Medium',
  'L': 'Large',
  'XL': 'Extra Large'
};

export default function UrunDetay() {
  const params = useParams();
  const router = useRouter();

  // String dönüşümü ile güvenli arama
  const urun = urunlerData.find((item) => String(item.id) === String(params?.id));

  // --- FAVORİ STATE'İ VE TAKİBİ ---
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const updateFavsFromStorage = () => {
      const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");
      
      if (isLoggedIn) {
        const saved = JSON.parse(sessionStorage.getItem("favorites") || "[]");
        setFavorites(saved);
      } else {
        setFavorites([]);
      }
    };

    updateFavsFromStorage();

    window.addEventListener("favoritesUpdated", updateFavsFromStorage);
    return () => window.removeEventListener("favoritesUpdated", updateFavsFromStorage);
  }, []);

  // FAVORİ TIKLAMA FONKSİYONU
  const handleFavClick = (productId) => {
    const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");

    if (isLoggedIn) {
      setFavorites((prev) => {
        const isExist = prev.map(Number).includes(Number(productId));
        const updated = isExist
          ? prev.filter((id) => Number(id) !== Number(productId))
          : [...prev, productId];

        sessionStorage.setItem("favorites", JSON.stringify(updated));

        setTimeout(() => {
          window.dispatchEvent(new Event("favoritesUpdated"));
        }, 0);

        return updated;
      });
    } else {
      setTimeout(() => {
        window.dispatchEvent(new Event("openLoginModal"));
      }, 0);
    }
  };

  // --- YORUM SİSTEMİ STATE'LERİ ---
  const [comments, setComments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Silme Onay Modalı için State
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // --- GELİNCE HABER VER STATE'LERİ ---
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Yorumları localStorage'dan yükleme ve oturum kontrolü
  useEffect(() => {
    if (typeof window === "undefined" || !urun) return;

    const user = sessionStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(user);
        const name = parsedUser.name || parsedUser.username || parsedUser.email || 'Kullanıcı';
        setUserName(name);
        if (parsedUser.email) setNotifyEmail(parsedUser.email);
      } catch {
        setUserName(user);
        if (typeof user === 'string' && user.includes('@')) setNotifyEmail(user);
      }
    }

    const savedComments = JSON.parse(localStorage.getItem(`comments_product_${urun.id}`) || "[]");
    setComments(savedComments);
  }, [urun]);

  // Yorum Gönderme Fonksiyonu
  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;
    if (!isLoggedIn && !userName.trim()) return;

    const newComment = {
      id: Date.now(),
      name: isLoggedIn ? userName : (userName.trim() || "Misafir Kullanıcı"),
      text: commentText.trim(),
      rating: rating,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_product_${urun.id}`, JSON.stringify(updatedComments));

    setCommentText('');
    if (!isLoggedIn) setUserName('');
    setShowForm(false);
  };

  // YORUMU SİL
  const confirmDeleteComment = () => {
    if (!deletingCommentId) return;
    const updatedComments = comments.filter((c) => c.id !== deletingCommentId);
    setComments(updatedComments);
    localStorage.setItem(`comments_product_${urun.id}`, JSON.stringify(updatedComments));
    setDeletingCommentId(null);
  };

  if (!urun) {
    return (
      <main style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Ürün Bulunamadı!</h2>
        <p>Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/urunler" style={{ textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
          Tüm Ürünlere Geri Dön
        </Link>
      </main>
    );
  }

  const formatSrc = (src) => (src && !src.startsWith('/') ? `/${src}` : src);

  const defaultImages = [
    urun.resimAna,
    urun.resimHover,
    urun.resim3,
    urun.resim4,
    ...(urun.ekstraResimler || [])
  ].filter(Boolean).map(formatSrc);

  const getImagesForColor = (color) => {
    if (urun.renkResimleri && urun.renkResimleri[color]) {
      return urun.renkResimleri[color].map(formatSrc);
    }
    return defaultImages;
  };

  // --- PRODUCT STATE'LERİ ---
  const [selectedColor, setSelectedColor] = useState(urun.renkler ? urun.renkler[0] : urun.renk || '');
  const initialImages = getImagesForColor(selectedColor);
  const [activeImageList, setActiveImageList] = useState(initialImages);
  const [currentMainImg, setCurrentMainImg] = useState(initialImages[0] || formatSrc(urun.resimAna));

  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);

  // Data'da tutulan bedenler
  const rawProductSizes = Array.isArray(urun.beden)
    ? urun.beden
    : Array.isArray(urun.bedenler)
    ? urun.bedenler
    : [];

  // Bir bedenin ürün stoğunda var olup olmadığını hem kısaltma hem tam kelime olarak kontrol eden yardımcı fonksiyon
  const checkSizeAvailable = (sizeLabel) => {
    const fullName = SIZE_MAP[sizeLabel] || sizeLabel;
    return rawProductSizes.includes(sizeLabel) || rawProductSizes.includes(fullName);
  };

  const isSelectedSizeAvailable = selectedSize ? checkSizeAvailable(selectedSize) : true;

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    const newImages = getImagesForColor(colorName);
    setActiveImageList(newImages);
    if (newImages.length > 0) {
      setCurrentMainImg(newImages[0]);
    }
  };

  const handleAddToCart = () => {
    if (typeof window === "undefined") return false;

    const loggedIn = sessionStorage.getItem("user");
    if (!loggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return false;
    }

    if (!selectedSize) {
      setSizeError(true);
      return false;
    }

    if (!isSelectedSizeAvailable) {
      return false;
    }

    setSizeError(false);

    try {
      const currentCart = JSON.parse(sessionStorage.getItem("cart") || "[]");

      const cartItem = {
        id: urun.id,
        isim: urun.isim,
        fiyat: urun.fiyat,
        eskiFiyat: urun.eskiFiyat,
        resim: currentMainImg,
        selectedColor,
        selectedSize,
        quantity: 1
      };

      const existingIndex = currentCart.findIndex(
        (item) => item.id === cartItem.id && item.selectedSize === cartItem.selectedSize && item.selectedColor === cartItem.selectedColor
      );

      if (existingIndex > -1) {
        currentCart[existingIndex].quantity += 1;
      } else {
        currentCart.push(cartItem);
      }

      sessionStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (e) {
      console.error("Sepete eklenirken hata oluştu:", e);
      return false;
    }
  };

  const handleBuyNow = (e) => {
    if (e) e.preventDefault();

    if (typeof window !== "undefined" && !sessionStorage.getItem("user")) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    if (!isSelectedSizeAvailable) {
      return;
    }

    handleAddToCart();
    router.push("/odeme");
  };

  // Gelince Haber Ver Kayıt Mantığı
  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;

    const newAlert = {
      productId: urun.id,
      productName: urun.isim,
      size: selectedSize,
      email: notifyEmail,
      date: new Date().toISOString()
    };

    const existingAlerts = JSON.parse(localStorage.getItem('stockAlerts') || '[]');
    localStorage.setItem('stockAlerts', JSON.stringify([...existingAlerts, newAlert]));

    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setShowNotifyModal(false);
    }, 2000);
  };

  const benzerUrunler = urunlerData.filter((item) => String(item.id) !== String(urun.id)).slice(0, 4);
  const isMainProductFav = favorites.map(Number).includes(Number(urun.id));
  const displayedComments = showAllComments ? comments : comments.slice(0, 4);

  return (
    <main>
      <section className="productp">
        <div className="gallery">
          <div className="thumbnails">
            {activeImageList.map((imgSrc, idx) => (
              <img
                key={idx}
                src={imgSrc}
                alt={`${urun.isim} - ${idx + 1}`}
                className={currentMainImg === imgSrc ? 'active' : ''}
                onClick={() => setCurrentMainImg(imgSrc)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>

          <div className="main-image">
            <img id="mainImg" src={currentMainImg} alt={urun.isim} />
          </div>
        </div>

        <div className="productp-info">
          <span className="badge">New Arrival</span>
          <h1>{urun.isim}</h1>
          
          <div className="rating">
            ★★★★★
            <span>4.8 ({128 + comments.length} reviews)</span>
          </div>

          <div className="price">
            <span className="new-price">{urun.fiyat}</span>
            {urun.eskiFiyat && <span className="old-price">{urun.eskiFiyat}</span>}
          </div>

          <p className="description">
            {urun.aciklama || "Şık tasarımı ve kaliteli kumaşıyla günlük kullanım ve özel davetler için harika bir tercih."}
          </p>

          {/* RENK SEÇİMİ */}
          {urun.renkler && urun.renkler.length > 0 && (
            <>
              <h4>Color</h4>
              <div className="colors">
                {urun.renkler.map((colorName) => (
                  <span
                    key={colorName}
                    className={`color ${colorName.toLowerCase()} ${selectedColor === colorName ? 'active' : ''}`}
                    onClick={() => handleColorChange(colorName)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </>
          )}

          {/* BEDEN SEÇİMİ (STOK KONTROLÜ İLE) */}
          <h4 style={{ color: sizeError ? '#d9534f' : 'inherit', transition: 'color 0.2s' }}>
            Size {sizeError && <span style={{ fontSize: '13px', fontWeight: 'normal', marginLeft: '8px' }}>(Lütfen beden seçiniz!)</span>}
          </h4>
          <div className="sizes">
            {ALL_SIZES.map((sizeLabel) => {
              // Beden data içerisinde mevcut mu kontrol ediyoruz
              const isAvailable = checkSizeAvailable(sizeLabel);

              return (
                <button
                  key={sizeLabel}
                  className={`size-btn ${selectedSize === sizeLabel ? 'active' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                  onClick={() => {
                    setSelectedSize(sizeLabel);
                    setSizeError(false);
                  }}
                  style={{
                    border: sizeError ? '1px solid #d9534f' : undefined,
                    cursor: 'pointer',
                    opacity: isAvailable ? 1 : 0.6,
                    textDecoration: isAvailable ? 'none' : 'line-through',
                    backgroundColor: !isAvailable && selectedSize === sizeLabel ? '#fff0f0' : !isAvailable ? '#f8f8f8' : undefined,
                    color: !isAvailable ? '#888' : undefined
                  }}
                >
                  {sizeLabel}
                </button>
              );
            })}
          </div>

          {/* DİNAMİK BUTON ALANI */}
          <div className="product-buttons">
            {selectedSize && !isSelectedSizeAvailable ? (
              /* Stokta olmayan beden seçildiğinde "Gelince Haber Ver" Butonu */
              <button 
                className="notify-btn" 
                onClick={() => setShowNotifyModal(true)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-regular fa-bell"></i>
                Gelince Haber Ver ({selectedSize} Beden)
              </button>
            ) : (
              /* Stokta var ise veya beden seçilmediyse */
              <>
                <button className="cart-btn" onClick={handleAddToCart}>Add to Cart</button>
                <button className="buy-btn" onClick={handleBuyNow}>Buy Now</button>
              </>
            )}

            <button className="fav-btn1" onClick={() => handleFavClick(urun.id)}>
              <i 
                className={isMainProductFav ? "fas fa-heart" : "far fa-heart"} 
                style={{ color: isMainProductFav ? "#8b0000" : "inherit" }} 
              />
            </button>
          </div>
        </div>
      </section>

      {/* MÜŞTERİ YORUMLARI SEKSİYONU */}
      <section className="reviews">
        <h2>Müşteri Yorumları</h2>
        <div className="reviews-box">
          
          {comments.length === 0 ? (
            <p className="comments-empty-text">Henüz bu ürün için yorum yapılmamış.</p>
          ) : (
            <>
              <div className="comments-grid">
                {displayedComments.map((item) => (
                  <div key={item.id} className="comment-card">
                    <button 
                      className="delete-comment-btn" 
                      onClick={() => setDeletingCommentId(item.id)}
                      title="Yorumu Sil"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>

                    <div>
                      <div className="comment-header">
                        <strong className="comment-author">{item.name}</strong>
                        <span className="comment-date">{item.date}</span>
                      </div>
                      <div className="comment-stars">
                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                      </div>
                      <p className="comment-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {comments.length > 4 && (
                <div className="toggle-comments-container">
                  <button 
                    className="toggle-comments-btn"
                    onClick={() => setShowAllComments(!showAllComments)}
                  >
                    {showAllComments ? 'Daha Az Göster ▲' : `Tüm Yorumları Gör (${comments.length}) ▼`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* YORUM YAZ FORM */}
          <div className="review-action-wrapper">
            {!showForm ? (
              <button className="review-btn" onClick={() => setShowForm(true)}>
                Yorum Yaz
              </button>
            ) : (
              <form onSubmit={handleCommentSubmit} className="comment-form-container">
                
                {!isLoggedIn && (
                  <div className="form-group">
                    <label>İsminiz:</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Adınızı giriniz"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Puanınız:</label>
                  <div className="rating-stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} onClick={() => setRating(star)}>
                        {star <= rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Yorumunuz:</label>
                  <textarea
                    required
                    rows={4}
                    className="form-textarea"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ürün hakkındaki deneyimlerinizi paylaşın..."
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="review-btn submit-btn">
                    Gönder
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* SİLME ONAY MODALI */}
      {deletingCommentId !== null && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <p>Bu yorumu silmek istediğinize emin misiniz?</p>
            <div className="custom-modal-buttons">
              <button className="modal-btn-confirm" onClick={confirmDeleteComment}>
                Evet, Sil
              </button>
              <button className="modal-btn-cancel" onClick={() => setDeletingCommentId(null)}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GELİNCE HABER VER MODALI */}
      {showNotifyModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card" style={{ maxWidth: '400px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '10px' }}>Stok Bildirimi</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#555' }}>
              <strong>{urun.isim}</strong> ürününün <strong>{selectedSize}</strong> bedeni tekrar stoğa girdiğinde e-posta ile haberdar olmak ister misiniz?
            </p>

            {notifySuccess ? (
              <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', textAlign: 'center' }}>
                ✓ Talebiniz alındı! Stok yenilendiğinde haber vereceğiz.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>E-Posta Adresiniz:</label>
                  <input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div className="custom-modal-buttons" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="modal-btn-cancel" onClick={() => setShowNotifyModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="modal-btn-confirm" style={{ backgroundColor: '#222' }}>
                    Kaydet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BENZER ÜRÜNLER */}
      <section className="similar-products">
        <h2>Similar Products</h2>
        <div className="product-grid">
          {benzerUrunler.map((benzer) => {
            const isBenzerFav = favorites.map(Number).includes(Number(benzer.id));
            return (
              <div className="card" key={benzer.id}>
                <div className="image-box">
                  <button 
                    className="heart"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavClick(benzer.id);
                    }}
                  >
                    <i 
                      className={isBenzerFav ? "fas fa-heart" : "far fa-heart"} 
                      style={{ color: isBenzerFav ? "#8b0000" : "inherit" }}
                    />
                  </button>
                  <Link href={`/urunler/${benzer.id}`}>
                    <img src={formatSrc(benzer.resimAna)} className="main-img" alt={benzer.isim} />
                    <img src={formatSrc(benzer.resimHover)} className="hover-img" alt={benzer.isim} />
                  </Link>
                </div>

                <Link href={`/urunler/${benzer.id}`}>
                  <h4>{benzer.isim}</h4>
                  {benzer.eskiFiyat ? (
                    <div className="price">
                      <p className="sale-price">{benzer.fiyat}</p>
                      <p className="old-price">{benzer.eskiFiyat}</p>
                    </div>
                  ) : (
                    <p>{benzer.fiyat}</p>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}