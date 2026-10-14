"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ProfilPage() {
    const router = useRouter();
    const [userData, setUserData] = useState({ name: "GUEST USER", email: "guest@gmail.com" });
    const [activeTab, setActiveTab] = useState(null);

    // Adres State & Error Yönetimi
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ title: "", detail: "" });
    const [addressErrors, setAddressErrors] = useState({});

    // Kart State & Error Yönetimi
    const [cards, setCards] = useState([]);
    const [showCardForm, setShowCardForm] = useState(false);
    const [newCard, setNewCard] = useState({ name: "", number: "" });
    const [cardErrors, setCardErrors] = useState({});

    // Hesap Ayarları Error Yönetimi
    const [settingsErrors, setSettingsErrors] = useState({});

    // Kullanıcı verilerini ve ona ait adres/kartları yükleyen ana fonksiyon
    const loadUserData = useCallback(() => {
        const savedSession = sessionStorage.getItem("user");
        const savedLocal = localStorage.getItem("user");
        const activeUserRaw = savedSession || savedLocal;

        if (activeUserRaw) {
            try {
                const parsedUser = JSON.parse(activeUserRaw);
                setUserData(parsedUser);

                const userKey = parsedUser.email || "guest";

                // O kullanıcıya ait adres ve kartları çek (Yoksa boş dizi atanır)
                const savedAddresses = localStorage.getItem(`addresses_${userKey}`);
                setAddresses(savedAddresses ? JSON.parse(savedAddresses) : []);

                const savedCards = localStorage.getItem(`cards_${userKey}`);
                setCards(savedCards ? JSON.parse(savedCards) : []);
            } catch (error) {
                console.error("Kullanıcı verisi ayrıştırılamadı:", error);
            }
        } else {
            // Oturum yoksa varsayılana dön
            setUserData({ name: "GUEST USER", email: "guest@gmail.com" });
            setAddresses([]);
            setCards([]);
        }
    }, []);

    useEffect(() => {
        // İlk yüklemede çalıştır
        loadUserData();

        // Giriş modalı veya başka yerden kullanıcı değişirse anında yakala
        window.addEventListener("userUpdated", loadUserData);
        window.addEventListener("storage", loadUserData);

        return () => {
            window.removeEventListener("userUpdated", loadUserData);
            window.removeEventListener("storage", loadUserData);
        };
    }, [loadUserData]);

    // Aktif kullanıcının storage anahtarı
    const getUserKey = () => userData.email || "guest";

    // 1. ADRES EKLEME
    const handleAddAddress = (e) => {
        e.preventDefault();
        let errors = {};

        if (!newAddress.title.trim()) errors.title = "Please enter an address title.";
        if (!newAddress.detail.trim()) errors.detail = "Please enter the full address.";

        if (Object.keys(errors).length > 0) {
            setAddressErrors(errors);
            return;
        }

        setAddressErrors({});
        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);

        localStorage.setItem(`addresses_${getUserKey()}`, JSON.stringify(updatedAddresses));

        setNewAddress({ title: "", detail: "" });
        setShowAddressForm(false);
    };

    // ADRES SİLME
    const handleDeleteAddress = (indexToDelete) => {
        if (confirm("Are you sure you want to delete this address?")) {
            const updatedAddresses = addresses.filter((_, idx) => idx !== indexToDelete);
            setAddresses(updatedAddresses);
            localStorage.setItem(`addresses_${getUserKey()}`, JSON.stringify(updatedAddresses));
        }
    };

    // 2. KART NUMARASI FORMATLAMA (XXXX XXXX XXXX XXXX)
    const handleCardNumberChange = (e) => {
        let rawValue = e.target.value.replace(/\D/g, "");
        if (rawValue.length > 16) rawValue = rawValue.slice(0, 16);
        const formattedValue = rawValue.replace(/(\d{4})(?=\d)/g, "$1 ");
        setNewCard({ ...newCard, number: formattedValue });
    };

    // 3. KART EKLEME
    const handleAddCard = (e) => {
        e.preventDefault();
        let errors = {};
        const cleanNumber = newCard.number.replace(/\s/g, "");

        if (!newCard.name.trim()) errors.name = "Please enter the name on the card.";
        if (cleanNumber.length !== 16) errors.number = "Please enter your 16-digit card number.";

        if (Object.keys(errors).length > 0) {
            setCardErrors(errors);
            return;
        }

        setCardErrors({});
        const lastDigits = cleanNumber.slice(-4);
        const cardData = { name: newCard.name, last4: lastDigits };

        const updatedCards = [...cards, cardData];
        setCards(updatedCards);

        localStorage.setItem(`cards_${getUserKey()}`, JSON.stringify(updatedCards));

        setNewCard({ name: "", number: "" });
        setShowCardForm(false);
    };

    // KART SİLME
    const handleDeleteCard = (indexToDelete) => {
        if (confirm("Are you sure you want to delete this payment method?")) {
            const updatedCards = cards.filter((_, idx) => idx !== indexToDelete);
            setCards(updatedCards);
            localStorage.setItem(`cards_${getUserKey()}`, JSON.stringify(updatedCards));
        }
    };

    // 4. PROFİL GÜNCELLEME
    const handleUpdateProfile = (e) => {
        e.preventDefault();
        let errors = {};

        if (!userData.name || !userData.name.trim()) errors.name = "Please enter your full name.";
        if (!userData.email || !userData.email.trim()) errors.email = "Please enter your email address.";

        if (Object.keys(errors).length > 0) {
            setSettingsErrors(errors);
            return;
        }

        setSettingsErrors({});
        const updatedUser = { ...userData };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Diğer bileşenlere haber ver
        window.dispatchEvent(new Event("userUpdated"));
        alert("Your profile has been updated successfully!");
    };

    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        sessionStorage.removeItem("favorites");
        localStorage.removeItem("favorites");
        sessionStorage.removeItem("cart");
        localStorage.removeItem("cart");

        window.dispatchEvent(new Event("userUpdated"));
        window.dispatchEvent(new Event("favoritesUpdated"));
        window.dispatchEvent(new Event("cartUpdated"));

        router.push("/");
    };

    const handleTabClick = (e, tabName) => {
        e.preventDefault();
        setActiveTab(activeTab === tabName ? null : tabName);
    };

    return (
        <section className="profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <i className="fa-solid fa-user" />
                    </div>
                    <h2>{userData.name ? userData.name.toUpperCase() : "GUEST USER"}</h2>
                    <p>{userData.email}</p>
                </div>

                <div className="profile-menu">
                    {/* 1. SİPARİŞLERİM */}
                    <a href="#" className={activeTab === "orders" ? "active" : ""} onClick={(e) => handleTabClick(e, "orders")}>
                        <span><i className="fa-solid fa-box" /> My Orders</span>
                        <i className={`fa-solid ${activeTab === "orders" ? "fa-chevron-down" : "fa-chevron-right"}`} />
                    </a>
                    {activeTab === "orders" && (
                        <div className="tab-content">
                            <p>You haven't placed any orders yet.</p>
                            <Link href="/" className="tab-btn">Start Shopping</Link>
                        </div>
                    )}

                    {/* 2. FAVORİLERİM */}
                    <Link href="/favoriler">
                        <span><i className="fa-solid fa-heart" /> My Favorites</span>
                        <i className="fa-solid fa-chevron-right" />
                    </Link>

                    {/* 3. ADRESLERİM */}
                    <a href="#" className={activeTab === "addresses" ? "active" : ""} onClick={(e) => handleTabClick(e, "addresses")}>
                        <span><i className="fa-solid fa-location-dot" /> My Addresses</span>
                        <i className={`fa-solid ${activeTab === "addresses" ? "fa-chevron-down" : "fa-chevron-right"}`} />
                    </a>
                    {activeTab === "addresses" && (
                        <div className="tab-content">
                            {addresses.length === 0 ? (
                                <p>You don't have any saved addresses yet.</p>
                            ) : (
                                addresses.map((item, idx) => (
                                    <div className="address-box item-row" key={idx}>
                                        <div>
                                            <strong>{item.title}</strong>
                                            <p>{item.detail}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="delete-btn" 
                                            title="Delete Address"
                                            onClick={() => handleDeleteAddress(idx)}
                                        >
                                            <i className="fa-solid fa-trash-can" />
                                        </button>
                                    </div>
                                ))
                            )}

                            {!showAddressForm ? (
                                <button className="tab-btn" onClick={() => setShowAddressForm(true)}>+ Add New Address</button>
                            ) : (
                                <form className="tab-form" onSubmit={handleAddAddress} noValidate>
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Address Title (e.g. Home, Work)" 
                                            className={addressErrors.title ? "error-input" : ""}
                                            value={newAddress.title} 
                                            onChange={(e) => {
                                                setNewAddress({ ...newAddress, title: e.target.value });
                                                if (addressErrors.title) setAddressErrors({ ...addressErrors, title: null });
                                            }}
                                        />
                                        {addressErrors.title && <span className="error-msg">{addressErrors.title}</span>}
                                    </div>

                                    <div>
                                        <textarea 
                                            placeholder="Full Address" 
                                            className={addressErrors.detail ? "error-input" : ""}
                                            value={newAddress.detail} 
                                            onChange={(e) => {
                                                setNewAddress({ ...newAddress, detail: e.target.value });
                                                if (addressErrors.detail) setAddressErrors({ ...addressErrors, detail: null });
                                            }}
                                        />
                                        {addressErrors.detail && <span className="error-msg">{addressErrors.detail}</span>}
                                    </div>

                                    <div className="form-buttons">
                                        <button type="submit" className="tab-btn">Save</button>
                                        <button type="button" className="tab-btn cancel" onClick={() => {
                                            setShowAddressForm(false);
                                            setAddressErrors({});
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* 4. ÖDEME YÖNTEMLERİM */}
                    <a href="#" className={activeTab === "payments" ? "active" : ""} onClick={(e) => handleTabClick(e, "payments")}>
                        <span><i className="fa-solid fa-credit-card" /> My Payment Methods</span>
                        <i className={`fa-solid ${activeTab === "payments" ? "fa-chevron-down" : "fa-chevron-right"}`} />
                    </a>
                    {activeTab === "payments" && (
                        <div className="tab-content">
                            {cards.length === 0 ? (
                                <p>You don't have any saved cards yet.</p>
                            ) : (
                                cards.map((item, idx) => (
                                    <div className="card-box item-row" key={idx}>
                                        <div className="card-info">
                                            <i className="fa-brands fa-cc-visa" /> 
                                            <span>**** **** **** {item.last4} ({item.name})</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="delete-btn" 
                                            title="Delete Card"
                                            onClick={() => handleDeleteCard(idx)}
                                        >
                                            <i className="fa-solid fa-trash-can" />
                                        </button>
                                    </div>
                                ))
                            )}

                            {!showCardForm ? (
                                <button className="tab-btn" onClick={() => setShowCardForm(true)}>+ Add New Card</button>
                            ) : (
                                <form className="tab-form" onSubmit={handleAddCard} noValidate>
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Name on Card" 
                                            className={cardErrors.name ? "error-input" : ""}
                                            value={newCard.name} 
                                            onChange={(e) => {
                                                setNewCard({ ...newCard, name: e.target.value });
                                                if (cardErrors.name) setCardErrors({ ...cardErrors, name: null });
                                            }}
                                        />
                                        {cardErrors.name && <span className="error-msg">{cardErrors.name}</span>}
                                    </div>

                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="**** **** **** ****" 
                                            maxLength="19"
                                            className={cardErrors.number ? "error-input" : ""}
                                            value={newCard.number} 
                                            onChange={(e) => {
                                                handleCardNumberChange(e);
                                                if (cardErrors.number) setCardErrors({ ...cardErrors, number: null });
                                            }}
                                        />
                                        {cardErrors.number && <span className="error-msg">{cardErrors.number}</span>}
                                    </div>

                                    <div className="form-buttons">
                                        <button type="submit" className="tab-btn">Save</button>
                                        <button type="button" className="tab-btn cancel" onClick={() => {
                                            setShowCardForm(false);
                                            setCardErrors({});
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* 5. KUPONLARIM */}
                    <a href="#" className={activeTab === "coupons" ? "active" : ""} onClick={(e) => handleTabClick(e, "coupons")}>
                        <span><i className="fa-solid fa-ticket" /> My Coupons</span>
                        <i className={`fa-solid ${activeTab === "coupons" ? "fa-chevron-down" : "fa-chevron-right"}`} />
                    </a>
                    {activeTab === "coupons" && (
                        <div className="tab-content">
                            <div className="coupon-box">
                                <span>Coupon Code: <strong>WELCOME10</strong></span>
                                <small style={{ display: 'block' }}>10% Welcome Discount</small>
                            </div>
                        </div>
                    )}

                    {/* 6. HESAP AYARLARI */}
                    <a href="#" className={activeTab === "settings" ? "active" : ""} onClick={(e) => handleTabClick(e, "settings")}>
                        <span><i className="fa-solid fa-gear" /> Account Settings</span>
                        <i className={`fa-solid ${activeTab === "settings" ? "fa-chevron-down" : "fa-chevron-right"}`} />
                    </a>
                    {activeTab === "settings" && (
                        <div className="tab-content">
                            <form className="tab-form" onSubmit={handleUpdateProfile} noValidate>
                                <div>
                                    <input 
                                        type="text" 
                                        value={userData.name || ""} 
                                        className={settingsErrors.name ? "error-input" : ""}
                                        onChange={(e) => {
                                            setUserData({ ...userData, name: e.target.value });
                                            if (settingsErrors.name) setSettingsErrors({ ...settingsErrors, name: null });
                                        }} 
                                        placeholder="Full Name" 
                                    />
                                    {settingsErrors.name && <span className="error-msg">{settingsErrors.name}</span>}
                                </div>

                                <div>
                                    <input 
                                        type="email" 
                                        value={userData.email || ""} 
                                        className={settingsErrors.email ? "error-input" : ""}
                                        onChange={(e) => {
                                            setUserData({ ...userData, email: e.target.value });
                                            if (settingsErrors.email) setSettingsErrors({ ...settingsErrors, email: null });
                                        }} 
                                        placeholder="Email" 
                                    />
                                    {settingsErrors.email && <span className="error-msg">{settingsErrors.email}</span>}
                                </div>

                                <button type="submit" className="tab-btn">Update Details</button>
                            </form>
                        </div>
                    )}

                    {/* 7. ÇIKIŞ YAP */}
                    <a href="#" className="logout" onClick={handleLogout}>
                        <span><i className="fa-solid fa-right-from-bracket" /> Log Out</span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                </div>
            </div>
        </section>
    );
}

export default ProfilPage;