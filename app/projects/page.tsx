// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";

interface Project {
    id: string;
    name: string;
    date: string;
    thumbnail: string;
    timestamp: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchProjects(user.uid);
            } else {
                setLoading(false);
                router.push("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchProjects = async (userId: string) => {
        try {
            const q = query(
                collection(db, "projects"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const fetchedProjects: Project[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedProjects.push({
                    id: doc.id,
                    name: data.name || "İsimsiz Tasarım",
                    date: data.date || "Bilinmeyen Tarih",
                    thumbnail: data.thumbnail || "",
                    timestamp: data.timestamp || 0
                });
            });

            fetchedProjects.sort((a, b) => b.timestamp - a.timestamp);
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Projeler çekilirken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setDeletingId(id);
        try {
            await deleteDoc(doc(db, "projects", id));
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Proje silinirken hata:", error);
            alert("Proje silinemedi.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenProject = (id: string) => {
        router.push(`/editor?projectId=${id}`);
    };

    return (
        <div className="flex-1 h-screen overflow-y-auto relative bg-gray-50/50">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto p-8 relative z-10">
                <header className="mb-10 mt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Projelerim</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Tüm harika tasarımların burada güvende.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Projelerin getiriliyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        <Link href="/editor" className="group cursor-pointer">
                            <div className="h-64 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-500 transition-all duration-300">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600 group-hover:scale-110 group-hover:shadow-md transition-transform duration-300 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-700">Yeni Tasarım</h3>
                                <p className="text-xs text-gray-500 mt-1">Boş bir tuval ile başla</p>
                            </div>
                        </Link>

                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project.id)}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col"
                            >
                                <div className="h-44 w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                    {project.thumbnail ? (
                                        <img
                                            src={project.thumbnail}
                                            alt={project.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs font-medium">Önizleme Yok</span>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-purple-50 transition-colors">
                                            Düzenle
                                        </button>
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(e, project.id)}
                                        disabled={deletingId === project.id}
                                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                                        title="Projeyi Sil"
                                    >
                                        {deletingId === project.id ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between bg-white z-10">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm truncate" title={project.name}>{project.name}</h3>
                                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {project.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
