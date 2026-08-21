// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            setError("Giriş başarısız. E-posta veya şifre hatalı olabilir.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Dekoratif Arka Plan (Mesh Gradient) */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '4s' }}></div>

            {/* Ortadaki Form Kutusu */}
            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 border border-white/50">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-2xl text-white">🎨</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Tekrar Hoş Geldiniz</h1>
                    <p className="text-sm text-gray-500 font-medium">Tasarım serüveninize kaldığınız yerden devam edin.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3.5 rounded-xl text-sm mb-6 text-center border border-red-100 font-medium">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">E-posta Adresi</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm"
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
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all bg-gray-50 hover:bg-white text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-4 flex items-center justify-center"
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
                            Hemen Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
