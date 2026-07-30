function aboutPage() {


    return (<>

        <main className="about-page">
            <section className="about-hero">
                <div className="about-overlay">
                    <h1>Hakkımızda</h1>
                </div>
            </section>
            <section className="about-container">
                <div className="about-text">
                    <span className="small-title">BİZ KİMİZ?</span>
                    <h2>Tarzını Yansıtan Her Parça Burada.</h2>
                    <p>
                        Markamız, kaliteli ürünleri modern tasarımlarla buluşturmak amacıyla
                        kurulmuştur. Günlük yaşamdan özel davetlere kadar her stile hitap eden
                        koleksiyonlarımızla modayı herkes için ulaşılabilir hale getiriyoruz.
                    </p>
                    <p>
                        Müşteri memnuniyetini her zaman ön planda tutuyor, kaliteli kumaş,
                        özenli üretim ve güvenli alışveriş deneyimi sunuyoruz.
                    </p>
                </div>
                <div className="about-image">
                    <img src="image/resim5.jpg" alt="Hakkımızda" />
                </div>
            </section>
            <section className="values">
                <h2>Neden Bizi Tercih Etmelisiniz?</h2>
                <div className="value-grid">
                    <div className="value-card">
                        <i className="fa-solid fa-shirt" />
                        <h3>Kaliteli Ürünler</h3>
                        <p>Uzun ömürlü ve kaliteli kumaşlardan üretilen ürünler.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-truck-fast" />
                        <h3>Hızlı Teslimat</h3>
                        <p>Siparişleriniz en kısa sürede güvenle adresinize ulaşır.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-rotate-left" />
                        <h3>Kolay İade</h3>
                        <p>Kolay ve hızlı iade süreci ile güvenli alışveriş deneyimi.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-headset" />
                        <h3>7/24 Destek</h3>
                        <p>Her zaman yanınızda olan müşteri destek ekibimiz.</p>
                    </div>
                </div>
            </section>
            <section className="about-banner">
                <div className="banner-content">
                    <h2>Tarzını Keşfet</h2>
                    <p>Yeni sezon ürünleriyle gardırobuna yepyeni bir dokunuş kat.</p>
                    <a href="/urunler" className="about-btn">
                        Alışverişe Başla
                    </a>
                </div>
            </section>
        </main>

   
    </>);
}

export default aboutPage;