// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchProjects = async () => {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, "projects"),
                    where("userId", "==", user.uid),
                    orderBy("timestamp", "desc"),
                    limit(4)
                );

                const querySnapshot = await getDocs(q);
                const projects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecentProjects(projects);
            } catch (error) {
                console.error("Projeler çekilirken hata oluştu:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchProjects();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const allTemplates = [
        { name: "Instagram Gönderisi", icon: "📱", desc: "1080 x 1080", color: "bg-gradient-to-br from-fuchsia-500 to-pink-500", width: 1080, height: 1080, isPopular: true },
        { name: "Sunum / Video", icon: "📊", desc: "1920 x 1080", color: "bg-gradient-to-br from-blue-500 to-cyan-500", width: 1920, height: 1080, isPopular: true },
        { name: "Afiş / A4 Belge", icon: "📄", desc: "42 x 59.4 cm", color: "bg-gradient-to-br from-emerald-400 to-teal-500", width: 794, height: 1123, isPopular: true },
        { name: "Logo", icon: "🎯", desc: "500 x 500 px", color: "bg-gradient-to-br from-violet-500 to-purple-600", width: 500, height: 500, isPopular: true },
        { name: "Instagram Hikaye", icon: "📸", desc: "1080 x 1920", color: "bg-gradient-to-br from-orange-400 to-rose-500", width: 1080, height: 1920, isPopular: false },
        { name: "Facebook Kapak", icon: "📘", desc: "820 x 312", color: "bg-gradient-to-br from-blue-600 to-indigo-700", width: 820, height: 312, isPopular: false },
        { name: "LinkedIn Gönderisi", icon: "💼", desc: "1200 x 630", color: "bg-gradient-to-br from-sky-500 to-blue-700", width: 1200, height: 630, isPopular: false },
    ];

    // Arama mantığı: Eğer arama boşsa sadece popülerleri göster, doluysa TÜM listede ara
    const displayedTemplates = searchQuery.trim() === ""
        ? allTemplates.filter(t => t.isPopular)
        : allTemplates.filter(template =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (displayedTemplates.length > 0) {
            const firstTpl = displayedTemplates[0];
            router.push(`/editor?width=${firstTpl.width}&height=${firstTpl.height}&name=${encodeURIComponent(firstTpl.name)}`);
        }
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-20">

            <div className="w-full bg-gradient-to-r from-[#6b21a8] via-[#7c3aed] to-[#3b82f6] pt-16 pb-24 px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.8) 0%, transparent 40%)" }}></div>

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-md">
                        Bugün ne tasarlayacaksınız?
                    </h1>

                    <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative shadow-2xl rounded-full group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <span className="text-xl">🔍</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-14 pr-24 py-4 rounded-full border-0 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-purple-300 text-lg transition-all"
                            placeholder="Dilediğinizi arayın (örn. Facebook, LinkedIn, Hikaye)..."
                        />
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-full transition-colors">
                                <span className="text-sm px-2">Ara</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-6 -mt-12 relative z-20">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {displayedTemplates.length > 0 ? (
                        displayedTemplates.map((template, idx) => (
                            <Link
                                key={idx}
                                href={`/editor?width=${template.width}&height=${template.height}&name=${encodeURIComponent(template.name)}`}
                                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white mb-3 shadow-inner ${template.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {template.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{template.name}</h3>
                                <p className="text-xs text-gray-400">{template.desc}</p>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center">
                            <span className="text-4xl mb-3">🧐</span>
                            <h3 className="font-bold text-gray-800 text-lg">Sonuç Bulunamadı</h3>
                            <p className="text-sm text-gray-500">"{searchQuery}" için uygun bir şablon yok. İstersen doğrudan boş bir tasarımla başlayabilirsin.</p>
                            <Link href="/editor" className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors">
                                Boş Tasarım Aç
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span>🕒</span> Son Tasarımlar
                        </h2>
                        {recentProjects.length > 0 && (
                            <Link href="/projects" className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline">
                                Tümünü Gör &rarr;
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 h-48 animate-pulse p-4 flex flex-col justify-end">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentProjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {recentProjects.map((project) => (
                                <Link
                                    href={`/editor?projectId=${project.id}`}
                                    key={project.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden flex flex-col group"
                                >
                                    <div className="h-36 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                        {project.thumbnail ? (
                                            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-4xl opacity-20">🎨</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                    </div>
                                    <div className="p-4 flex flex-col bg-white z-10">
                                        <h3 className="font-bold text-gray-800 text-sm truncate">{project.name || "İsimsiz Tasarım"}</h3>
                                        <span className="text-xs text-gray-400 mt-1">{project.date || "Tarih Yok"}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-4xl mb-4">
                                🎨
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz bir tasarımın yok</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                                Sol menüdeki "+ Oluştur" butonuna tıklayarak veya yukarıdaki şablonlardan birini seçerek ilk tasarımına hemen başla!
                            </p>
                            <Link
                                href="/editor"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md"
                            >
                                İlk Tasarımını Oluştur
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
