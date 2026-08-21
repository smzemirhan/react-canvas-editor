// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Şifre Güvenlik Kuralları Kontrolü
    const validatePassword = (pass: string) => {
        if (!/(?=.*?[A-Z])/.test(pass)) return "Şifreniz en az bir BÜYÜK harf içermelidir.";
        if (!/(?=.*?[a-z])/.test(pass)) return "Şifreniz en az bir küçük harf içermelidir.";
        if (!/(?=.*?[0-9])/.test(pass)) return "Şifreniz en az bir rakam (sayı) içermelidir.";
        if (!/(?=.*?[#?!@$%^&*-.,_])/.test(pass)) return "Şifreniz en az bir özel karakter (örn: ! @ # $ % & *) içermelidir.";
        if (pass.length < 6) return "Şifreniz en az 6 karakter uzunluğunda olmalıdır.";
        return "";
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Firebase'e istek atmadan önce şifre kurallarını denetle
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            router.push("/");
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError("Bu e-posta adresi zaten kullanımda.");
            } else {
                setError("Kayıt başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Dekoratif Arka Plan (Mesh Gradient) */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '4s' }}></div>

            {/* Ortadaki Form Kutusu */}
            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 border border-white/50">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <span className="text-2xl text-white">✨</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Aramıza Katılın</h1>
                    <p className="text-sm text-gray-500 font-medium">Ücretsiz hesabınızı oluşturun ve tasarlamaya başlayın.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3.5 rounded-xl text-sm mb-6 text-center border border-red-100 font-medium">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Ad Soyad</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm"
                            placeholder="Örn. Can Yılmaz"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">E-posta Adresi</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm"
                            placeholder="ornek@mail.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm"
                            placeholder="En az 6 karakter"
                            required
                            minLength={6}
                        />
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-relaxed">
                            * En az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-6 flex items-center justify-center"
                    >
                        {loading ? "Kayıt olunuyor..." : "Ücretsiz Kayıt Ol"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        Zaten bir hesabınız var mı?{" "}
                        <Link href="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
                            Giriş Yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
