"use client"
import Link from "next/link";
import "../public/style.css";
import ClientScripts from "./components/ClientScripts"; // Birazdan oluşturacağız
import HeaderClientPage from "./components/layout/header/page";
import FooterClientPage from "./components/layout/footer/page";

// export const metadata = {
//   title: "LUXE",
//   description: "Luxe E-Commerce",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Tüm DOM olayları ve JS etkileşimleri burada güvenle çalışacak */}
        <ClientScripts />
        <HeaderClientPage />

        {children}
        <FooterClientPage />

      </body>
    </html>
  );
}