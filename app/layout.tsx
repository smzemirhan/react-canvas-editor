// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SideBar from "@/components/SideBar";

// Font yapılandırması
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: '--font-poppins'
});

export const metadata: Metadata = {
    title: "React Canvas Editor",
    description: "React ve Konva ile geliştirilmiş tasarım aracı",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cinzel:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;600;700&family=Lato:wght@400;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
            </head>
            <body className={`${poppins.className} antialiased text-gray-900 bg-white flex h-screen overflow-hidden`}>

                {/* Sol Menü */}
                <SideBar />

                <main className="flex-1 overflow-y-auto relative bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
}
