"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { urunlerData } from "@/app/data";

const HeaderClientPage = () => {
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    const activeClass = (path) => {
        if (!mounted) return "";
        return pathname === path ? "active" : "";
    };

    // Modal, Favori & Sepet State'leri
    const [isLoginVisible, setIsLoginVisible] = useState(false);
    const [isSignupVisible, setIsSignupVisible] = useState(false);
    const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
    const [isResetSent, setIsResetSent] = useState(false);

    // ARAMA STATE'LERİ
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Şifre Göster/Gizle State'leri
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    // Favori State'leri
    const [favProducts, setFavProducts] = useState([]);
    const [isFavOpen, setIsFavOpen] = useState(false);
    const [isFavBumped, setIsFavBumped] = useState(false);

    // Sepet State'leri
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartBumped, setIsCartBumped] = useState(false);

    // Form State'leri
    const [isimSoy, setisimSoy] = useState("");
    const [sifre, setsifre] = useState("");
    const [soyisim, setSoyisim] = useState("");
    const [mail, setmail] = useState("");
    const [isim, setisim] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // Favorileri Güncelleyen Fonksiyon
    const updateFavs = () => {
        const isLoggedIn = typeof window !== "undefined" && (sessionStorage.getItem("user") || localStorage.getItem("user"));

        if (isLoggedIn) {
            const savedIds = JSON.parse(sessionStorage.getItem("favorites") || localStorage.getItem("favorites") || "[]");
            const filtered = urunlerData.filter((item) => 
                savedIds.map(Number).includes(Number(item.id))
            );
            setFavProducts(filtered);
        } else {
            setFavProducts([]);
        }
    };

    // Sepeti Güncelleyen Fonksiyon
    const updateCart = () => {
        if (typeof window !== "undefined") {
            const savedCart = JSON.parse(sessionStorage.getItem("cart") || localStorage.getItem("cart") || "[]");
            setCartItems(savedCart);
        }
    };

    useEffect(() => {
        setMounted(true);
        updateFavs();
        updateCart();

        if (typeof window !== "undefined") {
            const remembered = localStorage.getItem("rememberedUser");
            if (remembered) {
                setisimSoy(remembered);
                setRememberMe(true);
            }
        }

        const handleCustomFavEvent = () => {
            updateFavs();
            setIsFavBumped(true);
            setTimeout(() => setIsFavBumped(false), 300);
        };

        const handleCustomCartEvent = () => {
            updateCart();
            setIsCartBumped(true);
            setTimeout(() => setIsCartBumped(false), 300);
        };

        const handleOpenLoginEvent = () => {
            setIsLoginVisible(true);
            setIsSignupVisible(false);
            setIsForgotPasswordVisible(false);
            setIsResetSent(false);
        };

        window.addEventListener("favoritesUpdated", handleCustomFavEvent);
        window.addEventListener("cartUpdated", handleCustomCartEvent);
        window.addEventListener("openLoginModal", handleOpenLoginEvent);

        return () => {
            window.removeEventListener("favoritesUpdated", handleCustomFavEvent);
            window.removeEventListener("cartUpdated", handleCustomCartEvent);
            window.removeEventListener("openLoginModal", handleOpenLoginEvent);
        };
    }, []);

    // Favoriden Çıkarma
    const removeFav = (id) => {
        const savedIds = JSON.parse(sessionStorage.getItem("favorites") || localStorage.getItem("favorites") || "[]");
        const updated = savedIds.filter((item) => Number(item) !== Number(id));
        
        sessionStorage.setItem("favorites", JSON.stringify(updated));
        localStorage.setItem("favorites", JSON.stringify(updated));

        setTimeout(() => {
            window.dispatchEvent(new Event("favoritesUpdated"));
        }, 0);
    };

    // Sepetten Çıkarma
    const removeCartItem = (index) => {
        const savedCart = JSON.parse(sessionStorage.getItem("cart") || localStorage.getItem("cart") || "[]");
        savedCart.splice(index, 1);
        
        sessionStorage.setItem("cart", JSON.stringify(savedCart));
        localStorage.setItem("cart", JSON.stringify(savedCart));

        setTimeout(() => {
            window.dispatchEvent(new Event("cartUpdated"));
        }, 0);
    };

    const resetFormState = () => {
        if (!rememberMe) {
            setisimSoy("");
        }
        setsifre("");
        setSoyisim("");
        setmail("");
        setisim("");
        setResetEmail("");
        setIsResetSent(false);
        setShowLoginPassword(false);
        setShowSignupPassword(false);
    };

    const openLogin = (e) => {
        if (e) e.preventDefault();
        
        const activeUser = typeof window !== "undefined" ? (sessionStorage.getItem("user") || localStorage.getItem("user")) : null;

        if (activeUser) {
            router.push("/profil");
        } else {
            const remembered = localStorage.getItem("rememberedUser");
            if (remembered) {
                setisimSoy(remembered);
                setRememberMe(true);
            }
            setIsLoginVisible(true);
            setIsSignupVisible(false);
            setIsForgotPasswordVisible(false);
            setIsResetSent(false);
        }
    };

    const openSignup = (e) => {
        if (e) e.preventDefault();
        setIsSignupVisible(true);
        setIsLoginVisible(false);
        setIsForgotPasswordVisible(false);
        setIsResetSent(false);
    };

    const openForgotPassword = (e) => {
        if (e) e.preventDefault();
        setIsForgotPasswordVisible(true);
        setIsLoginVisible(false);
        setIsSignupVisible(false);
        setIsResetSent(false);
    };

    const closeAll = () => {
        setIsLoginVisible(false);
        setIsSignupVisible(false);
        setIsForgotPasswordVisible(false);
        setIsResetSent(false);
        resetFormState();
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const isValid = isimSoy.trim() !== "" && sifre.trim() !== "";

        if (isValid) {
            const userData = {
                name: isimSoy,
                email: `${isimSoy.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
            };

            sessionStorage.setItem("user", JSON.stringify(userData));

            if (rememberMe) {
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("rememberedUser", isimSoy);
            } else {
                localStorage.removeItem("user");
                localStorage.removeItem("rememberedUser");
            }

            closeAll();
            resetFormState();
            
            setTimeout(() => {
                window.dispatchEvent(new Event("favoritesUpdated"));
            }, 0);
        } else {
            alert("Lütfen tüm kutuları doldurun!");
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        if (resetEmail.trim() !== "") {
            setIsResetSent(true);
        } else {
            alert("Lütfen e-posta adresinizi girin!");
        }
    };

    const handleGuestContinue = (e) => {
        e.preventDefault();
        sessionStorage.setItem("user", JSON.stringify({ name: "Misafir Kullanıcı", isGuest: true }));
        closeAll();
        resetFormState();
    };

    const handleSignup = (e) => {
        e.preventDefault();
        const isValid = isim.trim() !== "" && soyisim.trim() !== "" && mail.trim() !== "" && sifre.trim() !== "";

        if (isValid) {
            const userData = {
                name: `${isim} ${soyisim}`,
                email: mail,
            };

            sessionStorage.setItem("user", JSON.stringify(userData));

            closeAll();
            resetFormState();
            setTimeout(() => {
                window.dispatchEvent(new Event("favoritesUpdated"));
            }, 0);
        } else {
            alert("Lütfen tüm kutuları doldurun!");
        }
    };

    const formatSrc = (src) => (src && !src.startsWith('/') ? `/${src}` : src);

    // Canlı Arama Filtreleme
    const searchResults = searchQuery.trim() === "" 
        ? [] 
        : urunlerData.filter((u) => 
            u.isim.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.aciklama && u.aciklama.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    return (
        <>
            <header>
                <input type="checkbox" id="menu-toggle" className="menu-toggle-checkbox" />
                <div className="logo-container">
                    <a href="/">
                        <img className="logo" src="/image/log.png" alt="Logo" />
                    </a>
                    <label htmlFor="menu-toggle" className="hamburger-menu">
                        <i className="fa-solid fa-bars" />
                    </label>
                </div>

                <div className="nav-links">
                    <Link className={activeClass("/")} href={"/"} suppressHydrationWarning>Home</Link>
                    <Link className={activeClass("/urunler")} href={"/urunler"} suppressHydrationWarning>Shop</Link>

                    {/* MEGA MENÜ & KATEGORİ LİNKLERİ */}
                    <div className="dropdown">
                        <Link href="/urunler">CATEGORIES</Link>
                        <div className="mega-menu">
                            <div className="menu-column">
                                <h4>NEW IN</h4>
                                <Link href={"/urunler"}>Latest</Link>
                                <Link href={"/urunler"}>Trending</Link>
                                <Link href={"/urunler"}>Best Sellers</Link>
                            </div>
                            <div className="menu-column">
                                <h4>CLOTHING</h4>
                                <Link href={"/urunler?category=Dresses"}>Dresses</Link>
                                <Link href={"/urunler?category=Tops"}>Tops</Link>
                                <Link href={"/urunler?category=Pants"}>Jeans</Link>
                                <Link href={"/urunler?category=Jackets"}>Jackets</Link>
                            </div>
                            <div className="menu-column">
                                <h4>SHOES</h4>
                                <Link href={"/urunler?category=Shoes"}>Sneakers</Link>
                                <Link href={"/urunler?category=Shoes"}>Boots</Link>
                                <Link href={"/urunler?category=Shoes"}>Heels</Link>
                            </div>
                            <div className="menu-column">
                                <h4>ACCESSORIES</h4>
                                <Link href={"/urunler?category=Bags"}>Bags</Link>
                                <Link href={"/urunler?category=Jewelry"}>Jewelry</Link>
                                <Link href={"/urunler?category=Belts"}>Belts</Link>
                            </div>
                        </div>
                    </div>

                    <Link className={activeClass("/about")} href={"/about"} suppressHydrationWarning>About Us</Link>
                    <Link className={activeClass("/contact")} href={"/contact"} suppressHydrationWarning>Contact</Link>
                </div>

                <div className="nav-icons-container">
                    {/* INLINE MINIMAL ARAMA ALANI */}
                    <div className="inline-search-container">
                        {isSearchOpen && (
                            <div className="header-search-box">
                                <div className="header-search-input-wrapper">
                                    <input 
                                        type="text"
                                        className="header-search-input"
                                        placeholder="Type to search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <button 
                                        type="button" 
                                        className="header-search-close"
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            setSearchQuery("");
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                {searchQuery.trim() !== "" && (
                                    <div className="header-search-results">
                                        {searchResults.length === 0 ? (
                                            <div className="header-search-empty">Sonuç bulunamadı.</div>
                                        ) : (
                                            searchResults.map((item) => (
                                                <Link 
                                                    key={item.id}
                                                    href={`/urunler/${item.id}`}
                                                    className="header-search-item"
                                                    onClick={() => {
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                >
                                                    <img src={formatSrc(item.resimAna)} alt={item.isim} />
                                                    <div className="header-search-info">
                                                        <span>{item.isim}</span>
                                                        <strong>{item.fiyat}</strong>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <a 
                            href="#" 
                            className="nav-icon-link" 
                            title="Ara"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsSearchOpen(!isSearchOpen);
                            }}
                        >
                            <i className="fa-solid fa-magnifying-glass" />
                        </a>
                    </div>

                    {/* FAVORİ KALBİ */}
                    <div 
                        className="fav-dropdown-container"
                        onMouseEnter={() => setIsFavOpen(true)}
                        onMouseLeave={() => setIsFavOpen(false)}
                    >
                        <Link 
                            href="/favoriler" 
                            className={`nav-icon-link fav-header-badge ${mounted && pathname === "/favoriler" ? "active" : ""} ${isFavBumped ? "bump" : ""}`} 
                            title="Favorilerim"
                        >
                            <i className={mounted && pathname === "/favoriler" ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                            {favProducts.length > 0 ? <span className="fav-badge">{favProducts.length}</span> : null}
                        </Link>

                        {isFavOpen ? (
                            <div className="fav-dropdown-menu">
                                <div className="fav-dropdown-header">
                                    <span>FAVORİLERİM ({favProducts.length})</span>
                                </div>
                                <div className="fav-dropdown-body">
                                    {favProducts.length === 0 ? (
                                        <p className="fav-empty-text">Henüz favori ürününüz yok.</p>
                                    ) : (
                                        favProducts.map((item) => (
                                            <div key={item.id} className="fav-item">
                                                <img src={formatSrc(item.resimAna)} alt={item.isim} />
                                                <div className="fav-item-info">
                                                    <h4>{item.isim}</h4>
                                                    <span>{item.fiyat}</span>
                                                </div>
                                                <button 
                                                    onClick={() => removeFav(item.id)} 
                                                    className="fav-remove-btn"
                                                    title="Favorilerden Çıkar"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="fav-go-page-btn-wrapper">
                                    <button 
                                        onClick={() => {
                                            setIsFavOpen(false);
                                            router.push('/favoriler');
                                        }}
                                    >
                                        Tüm Favorilerime Git
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* SEPET */}
                    <div 
                        className="fav-dropdown-container"
                        onMouseEnter={() => setIsCartOpen(true)}
                        onMouseLeave={() => setIsCartOpen(false)}
                    >
                        <Link 
                            href="/odeme" 
                            className={`nav-icon-link fav-header-badge ${mounted && (pathname === "/odeme" || pathname === "/sepet") ? "active" : ""} ${isCartBumped ? "bump" : ""}`} 
                            title="Sepetim / Ödeme"
                        >
                            <i className="fa-solid fa-shopping-bag" />
                            {cartItems.length > 0 ? <span className="fav-badge">{cartItems.length}</span> : null}
                        </Link>

                        {isCartOpen ? (
                            <div className="fav-dropdown-menu">
                                <div className="fav-dropdown-header">
                                    <span>SEPETİM ({cartItems.length})</span>
                                </div>
                                <div className="fav-dropdown-body">
                                    {cartItems.length === 0 ? (
                                        <p className="fav-empty-text">Sepetinizde ürün bulunmuyor.</p>
                                    ) : (
                                        cartItems.map((item, index) => {
                                            const hasDiscount = item.eskiFiyat && item.eskiFiyat !== "null" && item.eskiFiyat !== "";
                                            
                                            return (
                                                <div key={index} className="fav-item">
                                                    <img src={formatSrc(item.resim)} alt={item.isim} />
                                                    <div className="fav-item-info">
                                                        <h4>{item.isim}</h4>
                                                        <span className="cart-item-meta">
                                                            {[
                                                                item.selectedSize,
                                                                item.selectedColor,
                                                                `Adet: ${item.quantity || 1}`
                                                            ].filter(Boolean).join(' | ')}
                                                        </span>

                                                        <div className="cart-item-price-row">
                                                            {hasDiscount && (
                                                                <span className="cart-item-old-price">
                                                                    {item.eskiFiyat}
                                                                </span>
                                                            )}
                                                            <span className="cart-item-current-price">
                                                                {item.fiyat}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeCartItem(index)} 
                                                        className="fav-remove-btn"
                                                        title="Sepetten Çıkar"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {cartItems.length > 0 && (
                                    <div className="fav-go-page-btn-wrapper">
                                        <button 
                                            onClick={() => {
                                                setIsCartOpen(false);
                                                router.push('/odeme');
                                            }}
                                        >
                                            Satın Al
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    <a href="#" onClick={openLogin} className={`nav-icon-link ${mounted && pathname === "/profil" ? "active" : ""}`} title="Profil" id="profileIcon">
                        <i className="fa-regular fa-user" />
                    </a>

                    <div className="lang-dropdown">
                        <a href="#" className="nav-icon-link" title="Dil Seçin">
                            <i className="fa-solid fa-globe" />
                            <i className="fa-solid fa-chevron-down lang-arrow" />
                        </a>
                        <div className="dropdown-content">
                            <a href="#">TR</a>
                            <a href="#">EN</a>
                        </div>
                    </div>
                    <a href="#" className="nav-icon-link" title="Ayarlar">
                        <i className="fa-solid fa-gear" />
                    </a>
                </div>
            </header>

            {/* LOGIN MODAL */}
            {isLoginVisible ? (
                <div className="auth-container active" id="authOverlay">
                    <div className="auth-box">
                        <span className="auth-close" onClick={closeAll}>×</span>
                        <h2 className="auth-title">WELCOME</h2>
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    required
                                    onChange={(e) => setisimSoy(e.target.value)}
                                    value={isimSoy}
                                />
                            </div>

                            <div className="auth-input-group auth-password-group">
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    onChange={(e) => setsifre(e.target.value)}
                                    value={sifre}
                                />
                                <i
                                    className={`fa-regular ${showLoginPassword ? "fa-eye-slash" : "fa-eye"} auth-password-eye`}
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                />
                            </div>

                            <div className="auth-options-row">
                                <div className="auth-remember-me">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label htmlFor="rememberMe">Remember Me</label>
                                </div>
                                <a href="#" onClick={openForgotPassword} className="forgot-password-link">
                                    Forgot Password?
                                </a>
                            </div>

                            <button type="submit" className="auth-submit-btn">
                                Login
                            </button>
                        </form>

                        <div className="auth-guest-option">
                            <a href="#" onClick={handleGuestContinue} className="auth-guest-link">
                                Continue as Guest
                            </a>
                        </div>

                        <div className="auth-switch">
                            Don't have an account?{" "}
                            <a href="#" id="openSignup" onClick={openSignup}>
                                Sign Up
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* FORGOT PASSWORD MODAL */}
            {isForgotPasswordVisible ? (
                <div className="auth-container active" id="forgotPasswordOverlay">
                    <div className="auth-box">
                        <span className="auth-close" onClick={closeAll}>×</span>
                        <h2 className="auth-title">RESET PASSWORD</h2>
                        
                        {!isResetSent ? (
                            <form className="auth-form" onSubmit={handleForgotPassword}>
                                <div className="auth-input-group">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        value={resetEmail}
                                    />
                                </div>
                                <button type="submit" className="auth-submit-btn">
                                    Send Reset Link
                                </button>
                                <div className="auth-switch-margin">
                                    Remember your password?{" "}
                                    <a href="#" onClick={openLogin}>
                                        Login
                                    </a>
                                </div>
                            </form>
                        ) : (
                            <div className="auth-reset-sent">
                                <div className="reset-sent-icon">
                                    <i className="fa-regular fa-paper-plane" />
                                </div>
                                <p className="reset-sent-text">
                                    A password reset link has been sent to <strong>{resetEmail}</strong>. Please check your inbox.
                                </p>
                                <button 
                                    onClick={openLogin} 
                                    className="auth-submit-btn"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {/* SIGNUP MODAL */}
            {isSignupVisible ? (
                <div className="signup-container active" id="signup">
                    <div className="auth-box">
                        <span className="auth-close" onClick={closeAll}>×</span>
                        <h2 className="auth-title">WELCOME BACK</h2>
                        <form className="auth-form" onSubmit={handleSignup}>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    required
                                    onChange={(e) => setisim(e.target.value)}
                                    value={isim}
                                />
                            </div>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="Surname"
                                    required
                                    onChange={(e) => setSoyisim(e.target.value)}
                                    value={soyisim}
                                />
                            </div>
                            <div className="auth-input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    onChange={(e) => setmail(e.target.value)}
                                    value={mail}
                                />
                            </div>

                            <div className="auth-input-group auth-password-group">
                                <input
                                    type={showSignupPassword ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    onChange={(e) => setsifre(e.target.value)}
                                    value={sifre}
                                />
                                <i
                                    className={`fa-regular ${showSignupPassword ? "fa-eye-slash" : "fa-eye"} auth-password-eye`}
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                />
                            </div>

                            <button type="submit" className="auth-submit-btn">
                                Sign Up
                            </button>
                        </form>
                        <div className="auth-switch">
                            Already have an account?{" "}
                            <a href="#" id="openLogin" onClick={openLogin}>
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default HeaderClientPage;