"use client";
import Link from "next/link";

const FooterClientPage = () => {
    return (
        <>
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-column">
                        <h3>SHOP</h3>
                        <ul>
                            <li>
                                <Link href="/urunler?gender=Women">Women</Link>
                            </li>
                            <li>
                                <Link href="/urunler?gender=Men">Men</Link>
                            </li>
                            <li>
                                <Link href="/urunler?category=Accessories">Accessories</Link>
                            </li>
                            <li>
                                <Link href="/urunler">New Arrivals</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>HELP</h3>
                        <ul>
                            <li>
                                <Link href="/contact">Contact</Link>
                            </li>
                            <li>
                                <a href="#">Shipping</a>
                            </li>
                            <li>
                                <a href="#">Returns</a>
                            </li>
                            <li>
                                <a href="#">FAQ</a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>COMPANY</h3>
                        <ul>
                            <li>
                                <Link href="/about">About Us</Link>
                            </li>
                            <li>
                                <a href="#">Careers</a>
                            </li>
                            <li>
                                <a href="#">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#">Terms &amp; Conditions</a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-column newsletter">
                        <h3>NEWSLETTER</h3>
                        <p>Be the first to hear about new arrivals and exclusive offers.</p>
                        <div className="newsletter-box">
                            <input type="email" placeholder="Enter your email address" />
                            <button>Subscribe</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 LUXE. All Rights Reserved.</p>
                    <div className="social-icons">
                        <a href="#"><i className="fa-brands fa-instagram" /></a>
                        <a href="#"><i className="fa-brands fa-facebook-f" /></a>
                        <a href="#"><i className="fa-brands fa-x-twitter" /></a>
                        <a href="#"><i className="fa-brands fa-pinterest-p" /></a>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default FooterClientPage;