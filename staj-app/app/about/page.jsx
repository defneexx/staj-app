function aboutPage() {


    return (<>

        <main className="about-page">
            <section className="about-hero">
                <div className="about-overlay">
                    <h1>About Us</h1>
                </div>
            </section>
            <section className="about-container">
                <div className="about-text">
                    <span className="small-title">WHO ARE WE?</span>
                    <h2>Every Piece That Reflects Your Style Is Here.</h2>
                    <p>
                        Our brand was founded to bring quality products together with modern
                        designs. With collections that suit every style, from everyday wear to
                        special occasions, we make fashion accessible to everyone.
                    </p>
                    <p>
                        Customer satisfaction always comes first. We offer quality fabrics,
                        careful craftsmanship and a secure shopping experience.
                    </p>
                </div>
                <div className="about-image">
                    <img src="image/resim5.jpg" alt="About Us" />
                </div>
            </section>
            <section className="values">
                <h2>Why Choose Us?</h2>
                <div className="value-grid">
                    <div className="value-card">
                        <i className="fa-solid fa-shirt" />
                        <h3>Quality Products</h3>
                        <p>Products made from durable, high-quality fabrics.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-truck-fast" />
                        <h3>Fast Delivery</h3>
                        <p>Your orders reach your door safely and as quickly as possible.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-rotate-left" />
                        <h3>Easy Returns</h3>
                        <p>A secure shopping experience with a quick and easy return process.</p>
                    </div>
                    <div className="value-card">
                        <i className="fa-solid fa-headset" />
                        <h3>24/7 Support</h3>
                        <p>Our customer support team is always here for you.</p>
                    </div>
                </div>
            </section>
            <section className="about-banner">
                <div className="banner-content">
                    <h2>Discover Your Style</h2>
                    <p>Give your wardrobe a fresh touch with our new season collection.</p>
                    <a href="/urunler" className="about-btn">
                        Start Shopping
                    </a>
                </div>
            </section>
        </main>

   
    </>);
}

export default aboutPage;