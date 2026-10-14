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

    // FORM HATA STATE'LERİ
    const [loginErrors, setLoginErrors] = useState({});
    const [signupErrors, setSignupErrors] = useState({});
    const [forgotErrors, setForgotErrors] = useState({});

    // Toaster State
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'info' });
        }, 5000);
    };

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

        const handleCustomFavEvent = (e) => {
            updateFavs();
            setIsFavBumped(true);
            setTimeout(() => setIsFavBumped(false), 300);

            if (e?.detail?.message) {
                showToast(e.detail.message, e.detail.type || 'info');
            }
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
            window.dispatchEvent(new CustomEvent("favoritesUpdated", { 
                detail: { message: "Product removed from favorites.", type: "error" } 
            }));
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
        setLoginErrors({});
        setSignupErrors({});
        setForgotErrors({});
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
            setLoginErrors({});
        }
    };

    const openSignup = (e) => {
        if (e) e.preventDefault();
        setIsSignupVisible(true);
        setIsLoginVisible(false);
        setIsForgotPasswordVisible(false);
        setIsResetSent(false);
        setSignupErrors({});
    };

    const openForgotPassword = (e) => {
        if (e) e.preventDefault();
        setIsForgotPasswordVisible(true);
        setIsLoginVisible(false);
        setIsSignupVisible(false);
        setIsResetSent(false);
        setForgotErrors({});
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
        const errors = {};

        if (!isimSoy.trim()) {
            errors.isimSoy = "Please enter your full name.";
        }
        if (!sifre.trim()) {
            errors.sifre = "Please enter your password.";
        }

        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors);
            return;
        }

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
    };

const handleForgotPassword = (e) => {
    e.preventDefault();
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!resetEmail.trim()) {
        errors.resetEmail = "Please enter your email address.";
    } else if (!emailRegex.test(resetEmail)) {
        errors.resetEmail = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
        setForgotErrors(errors);
        return;
    }

    setIsResetSent(true);
};

    const handleGuestContinue = (e) => {
        e.preventDefault();
        sessionStorage.setItem("user", JSON.stringify({ name: "Guest User", isGuest: true }));
        closeAll();
        resetFormState();
    };

const handleSignup = (e) => {
    e.preventDefault();
    const errors = {};

    // E-posta doğrulama için Regex (Örn: isim@domain.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isim.trim()) errors.isim = "Please enter your first name.";
    if (!soyisim.trim()) errors.soyisim = "Please enter your last name.";
    
    // E-posta Boşluk & Format Kontrolü
    if (!mail.trim()) {
        errors.mail = "Please enter your email address.";
    } else if (!emailRegex.test(mail)) {
        errors.mail = "Please enter a valid email address (e.g. name@gmail.com).";
    }

    if (!sifre.trim()) errors.sifre = "Please enter your password.";

    if (Object.keys(errors).length > 0) {
        setSignupErrors(errors);
        return;
         
    }

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
            {/* GLOBAL TOASTER BİLDİRİMİ */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <i className={toast.type === 'success' ? "fa-solid fa-heart" : "fa-solid fa-heart-crack"}></i>
                    <span>{toast.message}</span>
                </div>
            )}

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
                    <Link className={activeClass("/")} href={"/"} suppressHydrationWarning>HOME</Link>
                    <Link className={activeClass("/urunler")} href={"/urunler"} suppressHydrationWarning>SHOP</Link>

                    {/* MEGA MENÜ & KATEGORİ LİNKLERİ */}
                    <div className="dropdown">
                        <Link href="/urunler">CATEGORIES</Link>
                        <div className="mega-menu">
                            <div className="menu-column">
                                <h4>NEW IN</h4>
                                <Link href={"/urunler"}>Latest</Link>
                                <Link href={"/urunler"}>Featured</Link>
                                <Link href={"/urunler"}>Best Sellers</Link>
                            </div>
                            <div className="menu-column">
                                <h4>CLOTHING</h4>
                                <Link href={"/urunler?category=Elbiseler"}>Dresses</Link>
                                <Link href={"/urunler?category=Tops"}>Tops</Link>
                                <Link href={"/urunler?category=Pantolonlar"}>Trousers</Link>
                                <Link href={"/urunler?category=Ceketler"}>Jackets</Link>
                            </div>
                            <div className="menu-column">
                                <h4>SHOES</h4>
                                <Link href={"/urunler?category=Aksesuarlar"}>Sneakers</Link>
                                <Link href={"/urunler?category=Aksesuarlar"}>Boots</Link>
                                <Link href={"/urunler?category=Aksesuarlar"}>Heels</Link>
                            </div>
                            <div className="menu-column">
                                <h4>ACCESSORIES</h4>
                                <Link href={"/urunler?category=Çantalar"}>Bags</Link>
                                <Link href={"/urunler?category=Mücevherat"}>Jewelry</Link>
                                <Link href={"/urunler?category=Aksesuarlar"}>Belts</Link>
                            </div>
                        </div>
                    </div>

                    <Link className={activeClass("/about")} href={"/about"} suppressHydrationWarning>ABOUT US</Link>
                    <Link className={activeClass("/contact")} href={"/contact"} suppressHydrationWarning>CONTACT</Link>
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
                                        placeholder="Search..."
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
                                            <div className="header-search-empty">No results found.</div>
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
                            title="Search"
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
                            title="My Favorites"
                        >
                            <i className={mounted && pathname === "/favoriler" ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                            {favProducts.length > 0 ? <span className="fav-badge">{favProducts.length}</span> : null}
                        </Link>

                        {isFavOpen ? (
                            <div className="fav-dropdown-menu">
                                <div className="fav-dropdown-header">
                                    <span>MY FAVORITES ({favProducts.length})</span>
                                </div>
                                <div className="fav-dropdown-body">
                                    {favProducts.length === 0 ? (
                                        <p className="fav-empty-text">You have no favorites yet.</p>
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
                                                    title="Remove from Favorites"
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
                                        View All Favorites
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
                            title="My Bag / Checkout"
                        >
                            <i className="fa-solid fa-shopping-bag" />
                            {cartItems.length > 0 ? <span className="fav-badge">{cartItems.length}</span> : null}
                        </Link>

                        {isCartOpen ? (
                            <div className="fav-dropdown-menu">
                                <div className="fav-dropdown-header">
                                    <span>MY BAG ({cartItems.length})</span>
                                </div>
                                <div className="fav-dropdown-body">
                                    {cartItems.length === 0 ? (
                                        <p className="fav-empty-text">Your bag is empty.</p>
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
                                                                `Qty: ${item.quantity || 1}`
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
                                                        title="Remove from Bag"
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
                                            Checkout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    <a href="#" onClick={openLogin} className={`nav-icon-link ${mounted && pathname === "/profil" ? "active" : ""}`} title="Profile" id="profileIcon">
                        <i className="fa-regular fa-user" />
                    </a>

                    <div className="lang-dropdown">
                        <a href="#" className="nav-icon-link" title="Select Language">
                            <i className="fa-solid fa-globe" />
                            <i className="fa-solid fa-chevron-down lang-arrow" />
                        </a>
                        <div className="dropdown-content">
                            <a href="#">TR</a>
                            <a href="#">EN</a>
                        </div>
                    </div>
                </div>
            </header>

            {/* LOGIN MODAL */}
            {isLoginVisible ? (
                <div className="auth-container active" id="authOverlay">
                    <div className="auth-box">
                        <span className="auth-close" onClick={closeAll}>×</span>
                        <h2 className="auth-title">WELCOME</h2>
                        <form className="auth-form" onSubmit={handleLogin} noValidate>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className={loginErrors.isimSoy ? "input-error" : ""}
                                    onChange={(e) => {
                                        setisimSoy(e.target.value);
                                        if (loginErrors.isimSoy) setLoginErrors(prev => ({ ...prev, isimSoy: null }));
                                    }}
                                    value={isimSoy}
                                />
                                {loginErrors.isimSoy && <span className="error-message">{loginErrors.isimSoy}</span>}
                            </div>

                            <div className="auth-input-group auth-password-group">
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={loginErrors.sifre ? "input-error" : ""}
                                    onChange={(e) => {
                                        setsifre(e.target.value);
                                        if (loginErrors.sifre) setLoginErrors(prev => ({ ...prev, sifre: null }));
                                    }}
                                    value={sifre}
                                />
                                <i
                                    className={`fa-regular ${showLoginPassword ? "fa-eye-slash" : "fa-eye"} auth-password-eye`}
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                />
                                {loginErrors.sifre && <span className="error-message">{loginErrors.sifre}</span>}
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
                                Log In
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
                            <form className="auth-form" onSubmit={handleForgotPassword} noValidate>
                                <div className="auth-input-group">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className={forgotErrors.resetEmail ? "input-error" : ""}
                                        onChange={(e) => {
                                            setResetEmail(e.target.value);
                                            if (forgotErrors.resetEmail) setForgotErrors({});
                                        }}
                                        value={resetEmail}
                                    />
                                    {forgotErrors.resetEmail && <span className="error-message">{forgotErrors.resetEmail}</span>}
                                </div>
                                <button type="submit" className="auth-submit-btn">
                                    Send Reset Link
                                </button>
                                <div className="auth-switch-margin">
                                    Remember your password?{" "}
                                    <a href="#" onClick={openLogin}>
                                        Log In
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
                                    Back to Log In
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
                        <h2 className="auth-title">SIGN UP</h2>
                        <form className="auth-form" onSubmit={handleSignup} noValidate>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className={signupErrors.isim ? "input-error" : ""}
                                    onChange={(e) => {
                                        setisim(e.target.value);
                                        if (signupErrors.isim) setSignupErrors(prev => ({ ...prev, isim: null }));
                                    }}
                                    value={isim}
                                />
                                {signupErrors.isim && <span className="error-message">{signupErrors.isim}</span>}
                            </div>
                            <div className="auth-input-group">
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className={signupErrors.soyisim ? "input-error" : ""}
                                    onChange={(e) => {
                                        setSoyisim(e.target.value);
                                        if (signupErrors.soyisim) setSignupErrors(prev => ({ ...prev, soyisim: null }));
                                    }}
                                    value={soyisim}
                                />
                                {signupErrors.soyisim && <span className="error-message">{signupErrors.soyisim}</span>}
                            </div>
                            <div className="auth-input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={signupErrors.mail ? "input-error" : ""}
                                    onChange={(e) => {
                                        setmail(e.target.value);
                                        if (signupErrors.mail) setSignupErrors(prev => ({ ...prev, mail: null }));
                                    }}
                                    value={mail}
                                />
                                {signupErrors.mail && <span className="error-message">{signupErrors.mail}</span>}
                            </div>

                            <div className="auth-input-group auth-password-group">
                                <input
                                    type={showSignupPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={signupErrors.sifre ? "input-error" : ""}
                                    onChange={(e) => {
                                        setsifre(e.target.value);
                                        if (signupErrors.sifre) setSignupErrors(prev => ({ ...prev, sifre: null }));
                                    }}
                                    value={sifre}
                                />
                                <i
                                    className={`fa-regular ${showSignupPassword ? "fa-eye-slash" : "fa-eye"} auth-password-eye`}
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                />
                                {signupErrors.sifre && <span className="error-message">{signupErrors.sifre}</span>}
                            </div>

                            <button type="submit" className="auth-submit-btn">
                                Sign Up
                            </button>
                        </form>
                        <div className="auth-switch">
                            Already have an account?{" "}
                            <a href="#" id="openLogin" onClick={openLogin}>
                                Log In
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default HeaderClientPage;
