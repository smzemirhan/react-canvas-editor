// @ts-nocheck
// src/components/SideBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type SidebarItem = {
    label: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    windowFn: string;
};

type SidebarSection = {
    title: string;
    items: SidebarItem[];
};

const SECTIONS: SidebarSection[] = [
    {
        title: "Temel",
        items: [
            { label: "Dikdörtgen", icon: "■", iconBg: "#dbeafe", iconColor: "#1d4ed8", windowFn: "addNewRectangle" },
            { label: "Daire", icon: "●", iconBg: "#ede9fe", iconColor: "#7c3aed", windowFn: "addNewCircle" },
            { label: "Elips", icon: "⬭", iconBg: "#cffafe", iconColor: "#0891b2", windowFn: "addNewEllipse" },
            { label: "Yapışkan Not", icon: "📝", iconBg: "#fef9c3", iconColor: "#ca8a04", windowFn: "addNewStickyNote" },
        ],
    },
    {
        title: "Çokgenler",
        items: [
            { label: "Üçgen", icon: "▲", iconBg: "#fef3c7", iconColor: "#d97706", windowFn: "addNewTriangle" },
            { label: "Beşgen", icon: "⬠", iconBg: "#ccfbf1", iconColor: "#0d9488", windowFn: "addNewPentagon" },
            { label: "Altıgen", icon: "⬡", iconBg: "#e0e7ff", iconColor: "#4f46e5", windowFn: "addNewHexagon" },
            { label: "Elmas", icon: "◆", iconBg: "#f3e8ff", iconColor: "#9333ea", windowFn: "addNewDiamond" },
            { label: "Yıldız", icon: "★", iconBg: "#fce7f3", iconColor: "#db2777", windowFn: "addNewStar" },
        ],
    },
    {
        title: "Çizgi & Ok",
        items: [
            { label: "Çizgi", icon: "╱", iconBg: "#f3f4f6", iconColor: "#4b5563", windowFn: "addNewLine" },
            { label: "Kesik Çizgi", icon: "┄", iconBg: "#f1f5f9", iconColor: "#64748b", windowFn: "addNewDashedLine" },
            { label: "Ok", icon: "→", iconBg: "#dbeafe", iconColor: "#2563eb", windowFn: "addNewArrow" },
        ],
    },
    {
        title: "Dekoratif",
        items: [
            { label: "Halka", icon: "◎", iconBg: "#ffedd5", iconColor: "#ea580c", windowFn: "addNewRing" },
            { label: "Kalp", icon: "♥", iconBg: "#fee2e2", iconColor: "#dc2626", windowFn: "addNewHeart" },
        ],
    },
    {
        title: "Metin",
        items: [
            { label: "Metin Kutusu", icon: "T", iconBg: "#e0f2fe", iconColor: "#0284c7", windowFn: "addNewText" },
        ],
    },
];

const MENU_ITEMS = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Projeler', href: '/projects' },
    { name: 'Şablonlar', href: '/templates' },
];

export default function SideBar() {
    const pathname = usePathname();
    const router = useRouter();

    const isEditor = pathname === '/editor';

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isCanvasLoading, setIsCanvasLoading] = useState(false);

    const fetchUserPhoto = async (currentUser: User) => {
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().photoUrl) {
                setProfileImage(userDoc.data().photoUrl);
            } else {
                setProfileImage(currentUser.photoURL || null);
            }
        } catch (error) {
            console.error("Fotoğraf çekilirken hata:", error);
            setProfileImage(currentUser.photoURL || null);
        }
    };

    const updateUserData = (currentUser: User | null) => {
        setUser(currentUser);
        if (currentUser) {
            fetchUserPhoto(currentUser);
        } else {
            setProfileImage(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            updateUserData(currentUser);
        });

        const handleProfileUpdate = () => {
            if (auth.currentUser) {
                updateUserData(auth.currentUser);
            }
        };

        const handleLoadingStart = () => setIsCanvasLoading(true);
        const handleLoadingEnd = () => setIsCanvasLoading(false);

        window.addEventListener("profileUpdated", handleProfileUpdate);
        window.addEventListener("profile-updated", handleProfileUpdate);
        window.addEventListener("canvas-loading-start", handleLoadingStart);
        window.addEventListener("canvas-loading-end", handleLoadingEnd);

        return () => {
            unsubscribe();
            window.removeEventListener("profileUpdated", handleProfileUpdate);
            window.removeEventListener("profile-updated", handleProfileUpdate);
            window.removeEventListener("canvas-loading-start", handleLoadingStart);
            window.removeEventListener("canvas-loading-end", handleLoadingEnd);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setProfileImage(null);
            router.push("/login");
        } catch (error) {
            console.error("Çıkış yapılırken hata:", error);
        }
    };

    const invoke = (fn: string) => {
        if (isCanvasLoading) return;
        const w = window as Window & Record<string, (() => void) | undefined>;
        w[fn]?.();
    };

    //  Erken dönüş (Early Return) işlemi BÜTÜN hook'lardan SONRA yapılmalı
    if (pathname && pathname.startsWith('/editor')) {
        return null;
    }

    return (
        <aside className="w-56 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 overflow-hidden">
            {/* Üst Kısım: Logo ve PRO Rozeti */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/" className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    Canvas Editor
                </Link>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                    PRO
                </span>
            </div>

            {/* İÇERİK ALANI */}
            <div className="p-4 flex-1 overflow-y-auto flex flex-col">
                {isEditor ? (
                    <div className={`flex flex-col pb-4 transition-opacity ${isCanvasLoading ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'opacity-100'}`}>
                        {SECTIONS.map((section, idx) => (
                            <div key={section.title} className={idx !== 0 ? "mt-4" : ""}>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wide">
                                    {section.title}
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {section.items.map((item) => (
                                        <button
                                            key={item.windowFn}
                                            type="button"
                                            disabled={isCanvasLoading}
                                            onClick={() => invoke(item.windowFn)}
                                            className={`flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 text-left transition-colors ${isCanvasLoading ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                                        >
                                            <span
                                                className="w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0"
                                                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                                            >
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="mb-6">
                            <Link
                                href="/editor"
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm text-sm"
                            >
                                + Oluştur
                            </Link>
                        </div>

                        <nav className="flex flex-col gap-1 flex-1">
                            {MENU_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {!loading && user && (
                                <Link
                                    href="/profile"
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${pathname === '/profile'
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Profilim
                                </Link>
                            )}
                        </nav>

                        {/* Giriş / Çıkış Kontrolleri */}
                        <div className="mt-8 border-t border-gray-100 pt-4 flex flex-col gap-2">
                            {!loading && !user ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="w-full text-center py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Giriş Yap
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="w-full text-center py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        Kayıt Ol
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                                    <Link href="/profile" className="flex items-center gap-2 overflow-hidden group">
                                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden border border-purple-200">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Profil" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-700 truncate max-w-[80px] group-hover:text-purple-600 transition">
                                            {user?.displayName || user?.email?.split('@')[0]}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-[11px] text-red-500 hover:text-red-700 font-medium transition px-2 py-1 shrink-0"
                                    >
                                        Çıkış
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
