'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { urunlerData } from '@/app/data';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const SIZE_MAP = {
  'XS': 'Extra Small',
  'S': 'Small',
  'M': 'Medium',
  'L': 'Large',
  'XL': 'Extra Large'
};

const formatSrc = (src) => (src && !src.startsWith('/') ? `/${src}` : src);

export default function UrunDetay() {
  const params = useParams();
  const router = useRouter();

  const urun = urunlerData.find((item) => String(item.id) === String(params?.id));

  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToastNotification = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 5000);
  };

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

  const handleFavClick = (productId) => {
    const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("user");

    if (isLoggedIn) {
      let isAdded = false;
      setFavorites((prev) => {
        const isExist = prev.map(Number).includes(Number(productId));
        isAdded = !isExist;
        const updated = isExist
          ? prev.filter((id) => Number(id) !== Number(productId))
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
      setTimeout(() => {
        window.dispatchEvent(new Event("openLoginModal"));
      }, 0);
    }
  };

  const [comments, setComments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // YORUM FORMU HATA STATE'İ
  const [commentErrors, setCommentErrors] = useState({ name: '', text: '' });

  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // GÖRSEL, RENK VE BEDEN STATE'LERİ
  // (Hook'lar her render'da aynı sırada çağrılmalı, bu yüzden "ürün bulunamadı" return'ünden önce tanımlandı)
  const defaultImages = urun
    ? [
        urun.resimAna,
        urun.resimHover,
        urun.resim3,
        urun.resim4,
        ...(urun.ekstraResimler || [])
      ].filter(Boolean).map(formatSrc)
    : [];

  const getImagesForColor = (color) => {
    if (urun?.renkResimleri && urun.renkResimleri[color]) {
      return urun.renkResimleri[color].map(formatSrc);
    }
    return defaultImages;
  };

  const [selectedColor, setSelectedColor] = useState(urun?.renkler ? urun.renkler[0] : urun?.renk || '');
  const initialImages = getImagesForColor(selectedColor);
  const [activeImageList, setActiveImageList] = useState(initialImages);
  const [currentMainImg, setCurrentMainImg] = useState(initialImages[0] || formatSrc(urun?.resimAna));

  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !urun) return;

    const user = sessionStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(user);
        const name = parsedUser.name || parsedUser.username || parsedUser.email || 'User';
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

  // YORUM GÖNDERME İŞLEMİ (Özel Validation ile)
  const handleCommentSubmit = (e) => {
    e.preventDefault();

    let errors = {};
    if (!isLoggedIn && !userName.trim()) {
      errors.name = 'Please enter your full name.';
    }
    if (!commentText.trim()) {
      errors.text = 'Please enter your review.';
    }

    if (Object.keys(errors).length > 0) {
      setCommentErrors(errors);
      return;
    }

    const newComment = {
      id: Date.now(),
      name: isLoggedIn ? userName : (userName.trim() || "Guest User"),
      text: commentText.trim(),
      rating: rating,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_product_${urun.id}`, JSON.stringify(updatedComments));

    setCommentText('');
    if (!isLoggedIn) setUserName('');
    setCommentErrors({});
    setShowForm(false);
  };

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
        <h2>Product Not Found!</h2>
        <p>The product you are looking for does not exist or may have been removed.</p>
        <Link href="/urunler" style={{ textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
          Back to All Products
        </Link>
      </main>
    );
  }

  const rawProductSizes = Array.isArray(urun.beden)
    ? urun.beden
    : Array.isArray(urun.bedenler)
    ? urun.bedenler
    : [];

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
      showToastNotification("Please select a size!", "error");
      return false;
    }

    if (!isSelectedSizeAvailable) {
      showToastNotification("The selected size is out of stock.", "error");
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

      showToastNotification("Product added to your bag!", "success");
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
      showToastNotification("Please select a size!", "error");
      return;
    }

    if (!isSelectedSizeAvailable) {
      showToastNotification("The selected size is out of stock.", "error");
      return;
    }

    const added = handleAddToCart();
    if (added) {
      router.push("/odeme");
    }
  };

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
    <main style={{ position: 'relative' }}>
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={toast.type === 'error' ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check"}></i>
          <span>{toast.message}</span>
        </div>
      )}

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

          <div 
            className="main-image"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
            style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              cursor: 'crosshair',
              borderRadius: '15px',
              width: 'fit-content'
            }}
          >
            <img id="mainImg" src={currentMainImg} alt={urun.isim} />

            {showZoom && (
              <div
                className="zoom-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  backgroundImage: `url(${currentMainImg})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#fff',
                  borderRadius: '15px'
                }}
              />
            )}
          </div>
        </div>

        <div className="productp-info">

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
            {urun.aciklama || "With its stylish design and quality fabric, a great choice for both everyday wear and special occasions."}
          </p>

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

          <h4 style={{ color: sizeError ? '#d9534f' : 'inherit', transition: 'color 0.2s' }}>
            Size {sizeError && <span style={{ fontSize: '13px', fontWeight: 'normal', marginLeft: '8px' }}>(Please select a size!)</span>}
          </h4>
          <div className="sizes">
            {ALL_SIZES.map((sizeLabel) => {
              const isAvailable = checkSizeAvailable(sizeLabel);

              return (
                <button
                  key={sizeLabel}
                  className={`size-btn ${selectedSize === sizeLabel ? 'active' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                  onClick={() => {
                    setSelectedSize((prevSize) => (prevSize === sizeLabel ? '' : sizeLabel));
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

          <div className="product-buttons">
            {selectedSize && !isSelectedSizeAvailable ? (
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
                Notify Me When Available (Size {selectedSize})
              </button>
            ) : (
              <>
                <button className="cart-btn" onClick={handleAddToCart}>Add to Bag</button>
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
        <h2>Customer Reviews</h2>
        <div className="reviews-box">
          
          {comments.length === 0 ? (
            <p className="comments-empty-text">There are no reviews for this product yet.</p>
          ) : (
            <>
              <div className="comments-grid">
                {displayedComments.map((item) => (
                  <div key={item.id} className="comment-card">
                    <button 
                      className="delete-comment-btn" 
                      onClick={() => setDeletingCommentId(item.id)}
                      title="Delete Review"
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
                    {showAllComments ? 'Show Less ▲' : `See All Reviews (${comments.length}) ▼`}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="review-action-wrapper">
            {!showForm ? (
              <button className="review-btn" onClick={() => setShowForm(true)}>
                Write a Review
              </button>
            ) : (
              /* GÜNCELLENMİŞ YORUM FORMU */
              <form onSubmit={handleCommentSubmit} noValidate className="comment-form-container">
                
                {!isLoggedIn && (
                  <div className="form-group">
                    <label>Your Name:</label>
                    <input
                      type="text"
                      className={`form-input ${commentErrors.name ? 'input-error' : ''}`}
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (commentErrors.name) setCommentErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="Full Name"
                    />
                    {commentErrors.name && (
                      <span className="field-error-text">{commentErrors.name}</span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Your Rating:</label>
                  <div className="rating-stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={star <= rating ? 'star-filled' : 'star-empty'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Review:</label>
                  <textarea
                    rows={4}
                    className={`form-textarea ${commentErrors.text ? 'input-error' : ''}`}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      if (commentErrors.text) setCommentErrors(prev => ({ ...prev, text: '' }));
                    }}
                    placeholder="Your message"
                  />
                  {commentErrors.text && (
                    <span className="field-error-text">{commentErrors.text}</span>
                  )}
                </div>

                <div className="form-buttons">
                  <button type="submit" className="review-btn submit-btn">
                    Submit
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setCommentErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {deletingCommentId !== null && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <p>Are you sure you want to delete this review?</p>
            <div className="custom-modal-buttons">
              <button className="modal-btn-confirm" onClick={confirmDeleteComment}>
                Yes, Delete
              </button>
              <button className="modal-btn-cancel" onClick={() => setDeletingCommentId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifyModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card" style={{ maxWidth: '400px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '10px' }}>Stock Notification</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#555' }}>
              Would you like to be notified by email when size <strong>{selectedSize}</strong> of <strong>{urun.isim}</strong> is back in stock?
            </p>

            {notifySuccess ? (
              <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', textAlign: 'center' }}>
                ✓ Request received! We'll let you know when it's back in stock.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Your Email Address:</label>
                  <input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="example@email.com"
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
                    Cancel
                  </button>
                  <button type="submit" className="modal-btn-confirm" style={{ backgroundColor: '#222' }}>
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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