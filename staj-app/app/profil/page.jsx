"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function ProfilPage() {
    const router = useRouter();
    const [userData, setUserData] = useState({ name: "MİSAFİR KULLANICI", email: "misafir@gmail.com" });

    useEffect(() => {
        // Oturumu hem sessionStorage hem de localStorage üzerinden kontrol et
        const savedSession = sessionStorage.getItem("user");
        const savedLocal = localStorage.getItem("user");
        const activeUser = savedSession || savedLocal;

        if (activeUser) {
            setUserData(JSON.parse(activeUser));
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();

        // 1. Aktif oturum verilerini (hem Session hem LocalStorage) temizle
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");

        // 2. Favori ve sepet verilerini temizle
        sessionStorage.removeItem("favorites");
        localStorage.removeItem("favorites");
        sessionStorage.removeItem("cart");
        localStorage.removeItem("cart");

        // 3. Header bileşeninin state'lerini anlık güncellemesi için event fırlat
        window.dispatchEvent(new Event("favoritesUpdated"));
        window.dispatchEvent(new Event("cartUpdated"));

        // NOT: "rememberedUser" key'ine dokunmuyoruz. 
        // Böylece login modalı açıldığında "Beni Hatırla" ismi orada hazır bekleyecek.

        // 4. Ana sayfaya yönlendir
        router.push("/");
    };

    return (
        <section className="profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <i className="fa-solid fa-user" />
                    </div>
                    <h2>{userData.name ? userData.name.toUpperCase() : "MİSAFİR KULLANICI"}</h2>
                    <p>{userData.email}</p>
                </div>
                <div className="profile-menu">
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-box" /> Siparişlerim
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-heart" /> Favorilerim
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-location-dot" /> Adreslerim
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-credit-card" /> Ödeme Yöntemlerim
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-ticket" /> Kuponlarım
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#">
                        <span>
                            <i className="fa-solid fa-gear" /> Hesap Ayarları
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                    <a href="#" className="logout" onClick={handleLogout}>
                        <span>
                            <i className="fa-solid fa-right-from-bracket" /> Çıkış Yap
                        </span>
                        <i className="fa-solid fa-chevron-right" />
                    </a>
                </div>
            </div>
        </section>
    );
}

export default ProfilPage;