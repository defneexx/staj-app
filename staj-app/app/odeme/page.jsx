'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  // Kupon Durumu (State)
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Detay Modalı Durumu (State)
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    telefon: '',
    adres: '',
    sehir: '',
    kartAd: '',
    kartNo: '',
    sonKullanma: '',
    cvv: ''
  });

  // Hata durumlarını ve dokunulma (touched) durumunu takip eden state'ler
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      setCartItems(savedCart);

      const savedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (savedUser.name || savedUser.email) {
        setFormData((prev) => ({
          ...prev,
          adSoyad: savedUser.name || '',
          email: savedUser.email || ''
        }));
      }
    }
  }, []);

  const updateCartState = (newCart) => {
    setCartItems(newCart);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleIncreaseQuantity = (index) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = (updatedCart[index].quantity || 1) + 1;
    updateCartState(updatedCart);
  };

  const handleDecreaseQuantity = (index) => {
    const updatedCart = [...cartItems];
    const currentQty = updatedCart[index].quantity || 1;
    if (currentQty > 1) {
      updatedCart[index].quantity = currentQty - 1;
      updateCartState(updatedCart);
    } else {
      handleRemoveItem(index);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, idx) => idx !== index);
    updateCartState(updatedCart);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Lütfen bir kupon kodu giriniz.');
      return;
    }

    if (cleanCode === 'INDIRIM10') {
      setAppliedDiscount(10);
      setCouponSuccess('Kupon uygulandı (%10 İndirim)');
    } else if (cleanCode === 'INDIRIM20') {
      setAppliedDiscount(20);
      setCouponSuccess('Kupon uygulandı (%20 İndirim)');
    } else {
      setCouponError('Geçersiz veya süresi dolmuş kupon kodu.');
      setAppliedDiscount(0);
    }
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;

    const cleanStr = priceStr
      .toString()
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, '')
      .trim();

    return parseFloat(cleanStr) || 0;
  };

  const araToplam = cartItems.reduce((acc, item) => {
    return acc + parsePrice(item.fiyat) * (item.quantity || 1);
  }, 0);

  const indirimTutari = (araToplam * appliedDiscount) / 100;
  const indirimliAraToplam = araToplam - indirimTutari;

  const kargoUcreti = indirimliAraToplam > 1000 || indirimliAraToplam === 0 ? 0 : 49.90;
  const genelToplam = indirimliAraToplam + kargoUcreti;

  // E-posta formatının geçerli olup olmadığını kontrol eden fonksiyon
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === 'kartNo') {
      const rawValue = value.replace(/\D/g, '');
      value = rawValue.replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }

    if (name === 'sonKullanma') {
      const rawValue = value.replace(/\D/g, '');
      if (rawValue.length >= 3) {
        value = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`;
      } else {
        value = rawValue;
      }
      value = value.slice(0, 5);
    }

    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Anlık hata tespiti
    let errorMsg = '';
    if (!value.trim()) {
      errorMsg = 'Bu alan doldurulmalıdır.';
    } else if (name === 'email' && !validateEmail(value)) {
      errorMsg = 'Lütfen geçerli bir e-posta adresi giriniz (örn: test@gmail.com).';
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = 'Bu alan doldurulmalıdır.';
      } else if (key === 'email' && !validateEmail(formData[key])) {
        newErrors[key] = 'Lütfen geçerli bir e-posta adresi giriniz.';
      }
    });

    setErrors(newErrors);
    setTouched({
      adSoyad: true,
      email: true,
      telefon: true,
      adres: true,
      sehir: true,
      kartAd: true,
      kartNo: true,
      sonKullanma: true,
      cvv: true
    });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsOrderComplete(true);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const renderPriceView = (item) => {
    const rawEskiFiyat = item.eskiFiyat || item.oldPrice;
    const hasDiscount = 
      rawEskiFiyat !== null && 
      rawEskiFiyat !== undefined && 
      rawEskiFiyat !== '' && 
      rawEskiFiyat !== 'null';

    if (hasDiscount) {
      return (
        <div className="price-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="old-price" style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '13px' }}>
            {rawEskiFiyat}
          </span>
          <span className="discounted-price" style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>
            {item.fiyat}
          </span>
        </div>
      );
    }

    return <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.fiyat}</span>;
  };

  if (isOrderComplete) {
    return (
      <main className="checkout-container">
        <div className="order-success-card">
          <div className="success-icon">✓</div>
          <h2>Siparişiniz Alındı!</h2>
          <p>
            Teşekkür ederiz! Sipariş özetiniz ve kargo takip bilgileriniz <strong>{formData.email}</strong> adresine iletilmiştir.
          </p>
          <button className="submit-order-btn" onClick={() => router.push('/')}>
            Alışverişe Devam Et
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-container">
      <h1 className="checkout-title">Ödeme Ve Teslimat</h1>

      {cartItems.length === 0 ? (
        <div className="checkout-empty">
          <h3>Sepetinizde Ürün Bulunmuyor.</h3>
          <Link href="/urunler">Ürünleri İncelemek İçin Tıklayın</Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <form onSubmit={handleSubmit} noValidate>
            {/* TESLİMAT BİLGİLERİ */}
            <section className="checkout-section">
              <h3>1. Teslimat Adresi</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input
                    type="text"
                    name="adSoyad"
                    value={formData.adSoyad}
                    onChange={handleInputChange}
                    style={{ border: touched.adSoyad && errors.adSoyad ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.adSoyad && errors.adSoyad && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.adSoyad}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>E-Posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ border: touched.email && errors.email ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.email && errors.email && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    name="telefon"
                    placeholder="05XX XXX XX XX"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    style={{ border: touched.telefon && errors.telefon ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.telefon && errors.telefon && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.telefon}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>Şehir</label>
                  <input
                    type="text"
                    name="sehir"
                    value={formData.sehir}
                    onChange={handleInputChange}
                    style={{ border: touched.sehir && errors.sehir ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.sehir && errors.sehir && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.sehir}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Adres</label>
                <textarea
                  name="adres"
                  rows="3"
                  value={formData.adres}
                  onChange={handleInputChange}
                  placeholder="Mahalle, Cadde, Sokak, Bina ve Daire no..."
                  style={{ border: touched.adres && errors.adres ? '1px solid #dc2626' : undefined }}
                />
                {touched.adres && errors.adres && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.adres}
                  </span>
                )}
              </div>
            </section>

            {/* ÖDEME BİLGİLERİ */}
            <section className="checkout-section">
              <h3>2. Kart İle Ödeme</h3>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  name="kartAd"
                  value={formData.kartAd}
                  onChange={handleInputChange}
                  style={{ border: touched.kartAd && errors.kartAd ? '1px solid #dc2626' : undefined }}
                />
                {touched.kartAd && errors.kartAd && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.kartAd}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Kart Numarası</label>
                <input
                  type="text"
                  name="kartNo"
                  maxLength="19"
                  placeholder="0000 0000 0000 0000"
                  value={formData.kartNo}
                  onChange={handleInputChange}
                  style={{ border: touched.kartNo && errors.kartNo ? '1px solid #dc2626' : undefined }}
                />
                {touched.kartNo && errors.kartNo && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.kartNo}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Son Kullanma T. (AA/YY)</label>
                  <input
                    type="text"
                    name="sonKullanma"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={formData.sonKullanma}
                    onChange={handleInputChange}
                    style={{ border: touched.sonKullanma && errors.sonKullanma ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.sonKullanma && errors.sonKullanma && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.sonKullanma}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    maxLength="4"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    style={{ border: touched.cvv && errors.cvv ? '1px solid #dc2626' : undefined }}
                  />
                  {touched.cvv && errors.cvv && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.cvv}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <button type="submit" className="submit-order-btn">
              Siparişi Onayla ve Öde ({genelToplam.toFixed(2)} TL)
            </button>
          </form>

          {/* SİPARİŞ ÖZETİ & KUPON ALANI */}
          <section className="order-summary-box">
            <h3>Sipariş Özeti</h3>

            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="summary-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div 
                    onClick={() => setSelectedProduct(item)}
                    className="summary-item-clickable"
                    title="Ürün detayını görüntüle"
                    style={{ cursor: 'pointer', display: 'flex', gap: '10px', flex: 1 }}
                  >
                    <img 
                      src={item.resim} 
                      alt={item.isim} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} 
                    />
                    <div className="summary-item-details">
                      <h4 className="summary-item-title">{item.isim}</h4>
                      <span className="summary-item-meta" style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                        Beden: {item.selectedSize} | Renk: {item.selectedColor}
                      </span>
                      <span className="summary-item-price">
                        {renderPriceView(item)}
                      </span>
                    </div>
                  </div>

                  <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleDecreaseQuantity(idx)}
                      style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncreaseQuantity(idx)}
                      style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      title="Ürünü Sil"
                      style={{ padding: '4px 6px', borderRadius: '4px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', marginLeft: '4px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* KUPON KODU GİRİŞ ALANI */}
            <div className="coupon-section" style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>İndirim Kuponu</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Kupon Kodu (Örn: INDIRIM10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Uygula
                </button>
              </div>
              {couponError && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{couponError}</p>}
              {couponSuccess && <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '4px' }}>{couponSuccess}</p>}
            </div>

            {/* HESAPLAMA DETAYLARI */}
            <div className="pricing-breakdown" style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <div className="pricing-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Ara Toplam</span>
                <span>{araToplam.toFixed(2)} TL</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="pricing-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a', fontWeight: '500' }}>
                  <span>Kupon İndirimi (%{appliedDiscount})</span>
                  <span>-{indirimTutari.toFixed(2)} TL</span>
                </div>
              )}

              <div className="pricing-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Kargo Ücreti</span>
                <span>{kargoUcreti === 0 ? 'Ücretsiz' : `${kargoUcreti.toFixed(2)} TL`}</span>
              </div>

              <div className="pricing-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <span>Toplam</span>
                <span>{genelToplam.toFixed(2)} TL</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ÜRÜN DETAY MODALI (POPUP) */}
      {selectedProduct && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)} 
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <img 
              src={selectedProduct.resimAna || selectedProduct.resim} 
              alt={selectedProduct.isim} 
              className="modal-image"
            />

            <h2 className="modal-title">{selectedProduct.isim}</h2>
            
            <div className="modal-details">
              <p><strong>Beden:</strong> {selectedProduct.selectedSize || 'Belirtilmedi'}</p>
              <p><strong>Renk:</strong> {selectedProduct.selectedColor || 'Belirtilmedi'}</p>
              <p><strong>Adet:</strong> {selectedProduct.quantity || 1}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <strong>Birim Fiyat:</strong> 
                {renderPriceView(selectedProduct)}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}