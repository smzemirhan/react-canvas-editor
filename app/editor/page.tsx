// src/app/editor/page.tsx
'use client';

import Link from 'next/link';
import CanvasArea from '../../components/CanvasArea';
import { useState, useEffect } from 'react';

export default function EditorPage() {
    const [isCanvasLoading, setIsCanvasLoading] = useState(false);

    useEffect(() => {
        const handleLoadingStart = () => setIsCanvasLoading(true);
        const handleLoadingEnd = () => setIsCanvasLoading(false);

        window.addEventListener("canvas-loading-start", handleLoadingStart);
        window.addEventListener("canvas-loading-end", handleLoadingEnd);

        return () => {
            window.removeEventListener("canvas-loading-start", handleLoadingStart);
            window.removeEventListener("canvas-loading-end", handleLoadingEnd);
        };
    }, []);

    const handleSaveProject = () => {
        if (isCanvasLoading) return;
        window.dispatchEvent(new Event('save-canvas-project'));
    };

    const handleExportProject = () => {
        if (isCanvasLoading) return;
        window.dispatchEvent(new Event('open-export-modal'));
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#e2e8f0] overflow-hidden">
            {/* Yükseklik h-14'ten h-12'ye düşürüldü */}
            <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="text-xs font-medium text-gray-600 hover:text-purple-600 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-purple-50"
                    >
                        <span>&larr;</span> Ana Sayfa
                    </Link>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="text-xs font-semibold text-gray-700">Tasarım</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSaveProject}
                        disabled={isCanvasLoading}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors border ${isCanvasLoading
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            : 'text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer'
                            }`}
                    >
                        Kaydet
                    </button>
                    <button
                        onClick={handleExportProject}
                        disabled={isCanvasLoading}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm text-white ${isCanvasLoading ? 'bg-purple-400 cursor-not-allowed opacity-60' : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                            }`}
                    >
                        İndir
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-row overflow-hidden relative">
                <div className="flex-1 w-full h-full relative bg-[#e2e8f0]">
                    <CanvasArea />
                </div>
            </main>
        </div>
    );
}
