// src/components/refactored/components/ExportModal.tsx
import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'png' | 'jpg' | 'pdf', quality: number) => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
    const [format, setFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
    const [quality, setQuality] = useState(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-96 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Tasarımı Dışa Aktar</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Format Seçimi */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Format Seçin</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setFormat('png')}
                                className={`py-2 rounded-lg border text-sm font-medium transition-all ${format === 'png' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                PNG
                            </button>
                            <button
                                onClick={() => setFormat('jpg')}
                                className={`py-2 rounded-lg border text-sm font-medium transition-all ${format === 'jpg' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                JPG
                            </button>
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`py-2 rounded-lg border text-sm font-medium transition-all ${format === 'pdf' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Kalite Ayarı (PNG kayıpsız olduğu için sadece JPG ve PDF'te gösterilir) */}
                    {(format === 'jpg' || format === 'pdf') && (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-semibold text-gray-700">Görüntü Kalitesi</label>
                                <span className="text-sm font-bold text-purple-600">% {Math.round(quality * 100)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                            <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                                {format === 'pdf'
                                    ? "Daha yüksek kalite PDF dosya boyutunu artırır ancak görsellerin çok daha net görünmesini sağlar."
                                    : "Daha yüksek kalite dosya boyutunu artırır. Web kullanımı için %80 (0.8) idealdir."}
                            </p>
                        </div>
                    )}

                    {format === 'png' && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-700 leading-relaxed">
                                <strong>Bilgi:</strong> PNG formatı kayıpsız bir formattır ve her zaman en yüksek kalitede kaydedilir.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        İptal
                    </button>
                    <button
                        onClick={() => { onExport(format, quality); onClose(); }}
                        className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                    >
                        İndir
                    </button>
                </div>
            </div>
        </div>
    );
}
