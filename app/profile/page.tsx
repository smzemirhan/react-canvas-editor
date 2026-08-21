// src/app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setName(currentUser.displayName || "");

                
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists() && userDoc.data().photoUrl) {
                        setPhotoUrl(userDoc.data().photoUrl);
                    } else {
                        setPhotoUrl(currentUser.photoURL || "");
                    }
                } catch (err) {
                    setPhotoUrl(currentUser.photoURL || "");
                }
            } else {
                router.push("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage({ text: "Lütfen sadece geçerli bir görsel dosyası seçin.", type: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const size = 200;

                canvas.width = size;
                canvas.height = size;

                const minSize = Math.min(img.width, img.height);
                const startX = (img.width - minSize) / 2;
                const startY = (img.height - minSize) / 2;

                ctx?.drawImage(img, startX, startY, minSize, minSize, 0, 0, size, size);

                const base64Image = canvas.toDataURL("image/jpeg", 0.8);
                setPhotoUrl(base64Image);
            };
        };

        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage({ text: "", type: "" });

        try {
            // (photoURL dahil edilmiyor)
            await updateProfile(user, {
                displayName: name
            });

            // Uzun Base64 fotoğrafı Firestore veritabanına kaydet
            if (photoUrl) {
                await setDoc(doc(db, "users", user.uid), {
                    photoUrl: photoUrl,
                    updatedAt: Date.now()
                }, { merge: true });
            }

            setMessage({ text: "Profiliniz başarıyla güncellendi! ✅", type: "success" });
        } catch (error) {
            console.error(error);
            setMessage({ text: "Profil güncellenirken bir hata oluştu.", type: "error" });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="animate-pulse text-gray-500 font-medium">Yükleniyor...</span></div>;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden pb-10">
            {/* Dekoratif Arka Plan (Mesh Gradient) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 border border-white/50 mt-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-xs font-bold text-gray-400 hover:text-purple-600 mb-6 transition-colors">
                        &larr; Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Profilim</h1>
                    <p className="text-sm text-gray-500 font-medium">Kişisel bilgilerinizi buradan yönetebilirsiniz.</p>
                </div>

                {message.text && (
                    <div className={`p-3.5 rounded-xl text-sm mb-6 text-center border font-medium animate-in fade-in zoom-in-95 ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">

                    <div className="flex flex-col items-center justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">👤</span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <span className="text-white text-2xl">📷</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
                            Fotoğrafı Değiştir
                        </button>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Ad Soyad</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm font-medium text-gray-800"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">E-posta Adresi (Değiştirilemez)</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
                    >
                        {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </button>
                </form>
            </div>
        </div>
    );
}
