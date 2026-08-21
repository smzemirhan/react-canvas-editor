// @ts-nocheck
// src/components/refactored/components/ControlsBar.tsx
import React, { useState, useEffect } from "react";
import { CanvasConfig } from "../types";

interface ControlsBarProps {
    onOpenTemplateModal: () => void;
    onOpenIconModal: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownload: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isLoading: boolean;
    backgroundColor: string;
    onBackgroundColorChange: (color: string) => void;
    canvasSize: CanvasConfig;
    onChangeCanvasSize: (w: number, h: number, name: string) => void;
    zoomLevel: number;
    onChangeZoom: (level: number | ((prev: number) => number)) => void;
    onToggleDrawingMode?: () => void;
    isDrawingMode?: boolean;
    onOpenAiModal?: () => void;
    onRandomBackground?: () => void;
    onPresentationMode?: () => void;
    onZenMode?: () => void;
    onAddFlowchartShape?: (type: 'diamond' | 'database' | 'process' | 'startEnd') => void;
    onAddShape?: (type: string) => void;
    onAddText?: () => void;
    onDrawerStateChange?: (isOpen: boolean) => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
    onOpenTemplateModal,
    onOpenIconModal,
    handleImageUpload,
    handleDownload,
    fileInputRef,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    isLoading,
    backgroundColor,
    onBackgroundColorChange,
    canvasSize,
    onChangeCanvasSize,
    zoomLevel,
    onChangeZoom,
    onToggleDrawingMode,
    isDrawingMode,
    onOpenAiModal,
    onRandomBackground,
    onPresentationMode,
    onZenMode,
    onAddFlowchartShape,
    onAddShape,
    onAddText,
    onDrawerStateChange
}) => {
    const [activeTab, setActiveTab] = useState<string | null>('shapes');

    useEffect(() => {
        if (onDrawerStateChange) {
            onDrawerStateChange(activeTab !== null);
        }
    }, [activeTab, onDrawerStateChange]);

    const toggleTab = (tab: string) => {
        if (activeTab === tab) {
            setActiveTab(null);
        } else {
            setActiveTab(tab);
        }
    };

    const handleShapeClick = (type: string) => {
        if (onAddShape) onAddShape(type);
    };

    return (
        <>
            {/* İkinci üst bar yüksekliği h-14 -> h-12 yapıldı */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3 z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-3 h-full">
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        <button onClick={onUndo} disabled={!canUndo} className={`p-1 rounded flex items-center justify-center transition-colors ${canUndo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="Geri Al (Ctrl+Z)"><span className="text-xs font-bold">↩</span></button>
                        <button onClick={onRedo} disabled={!canRedo} className={`p-1 rounded flex items-center justify-center transition-colors ${canRedo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="İleri Al (Ctrl+Y)"><span className="text-xs font-bold">↪</span></button>
                    </div>

                    <div className="h-5 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gray-500">Arka Plan:</span>
                        <input type="color" value={backgroundColor} onChange={(e) => onBackgroundColorChange(e.target.value)} className="w-5 h-5 rounded border border-gray-300 cursor-pointer p-0 bg-white shadow-sm" title="Arka Plan Rengini Değiştir" />
                    </div>

                    <div className="h-5 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-2 group">
                        <span className="text-xs font-medium text-gray-800 border border-transparent group-hover:border-gray-200 px-2 py-1 rounded cursor-pointer transition-colors">{canvasSize.name}</span>
                        <select
                            value={`${canvasSize.width}x${canvasSize.height}`}
                            onChange={(e) => {
                                const [w, h] = e.target.value.split('x').map(Number);
                                const name = e.target.options[e.target.selectedIndex].text;
                                onChangeCanvasSize(w, h, name);
                            }}
                            className="text-[9px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 outline-none hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <option value="1080x1080">Instagram Gönderisi (1080x1080)</option>
                            <option value="1080x1920">Instagram Hikaye (1080x1920)</option>
                            <option value="1920x1080">Sunum / Video (1920x1080)</option>
                            <option value="820x312">Facebook Kapak (820x312)</option>
                            <option value="1200x630">LinkedIn Gönderisi (1200x630)</option>
                            <option value="500x500">Logo (500x500)</option>
                            <option value="794x1123">A4 Belge (794x1123)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 h-full">
                    {isLoading && <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Yükleniyor...</span>}

                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100 mr-1">
                        <button onClick={() => onChangeZoom(z => Math.max(0.1, z - 0.1))} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded font-medium text-xs transition-all">−</button>
                        <span className="text-[10px] font-bold text-gray-600 w-8 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => onChangeZoom(z => Math.min(3, z + 0.1))} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded font-medium text-xs transition-all">+</button>
                    </div>

                    <button onClick={onPresentationMode} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors" title="Tam Ekran Sunum">🖥️</button>
                    <button onClick={onZenMode} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Zen Modu (Odaklan)">🧘</button>
                </div>
            </div>

            {/*  Sol ikon menüsünün yüksekliği top-12 olarak güncellendi */}
            <div className="absolute left-0 top-12 bottom-0 w-16 bg-white border-r border-gray-200 z-30 flex flex-col py-3 items-center gap-3 shadow-sm shrink-0">
                <button onClick={onOpenTemplateModal} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <span className="text-lg">🗂️</span>
                    <span className="text-[8px] font-medium">Şablonlar</span>
                </button>

                <button onClick={() => toggleTab('shapes')} className={`flex flex-col items-center gap-1 p-1.5 w-full transition-colors ${activeTab === 'shapes' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <span className="text-lg">⭐</span>
                    <span className="text-[8px] font-medium">Bileşenler</span>
                </button>

                <button onClick={() => { if (onAddText) onAddText(); }} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <span className="text-lg font-serif font-bold">T</span>
                    <span className="text-[8px] font-medium">Metin</span>
                </button>

                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                    <span className="text-lg">☁️</span>
                    <span className="text-[8px] font-medium">Görsel Yükle</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                <button onClick={onOpenIconModal} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                    <span className="text-lg">🧸</span>
                    <span className="text-[8px] font-medium">İkonlar</span>
                </button>

                <button onClick={onToggleDrawingMode} className={`flex flex-col items-center gap-1 p-1.5 w-full transition-colors ${isDrawingMode ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'}`}>
                    <span className="text-lg">✏️</span>
                    <span className="text-[8px] font-medium">Çizim</span>
                </button>

                <button onClick={onOpenAiModal} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                    <span className="text-lg">✨</span>
                    <span className="text-[8px] font-medium">YZ Görsel</span>
                </button>

                <button onClick={onRandomBackground} className="flex flex-col items-center gap-1 p-1.5 w-full text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors mt-auto">
                    <span className="text-lg">🎲</span>
                    <span className="text-[8px] font-medium">İlham</span>
                </button>
            </div>

            {/* Açılır menü genişliği w-[240px] yapıldı ve top-12 yapıldı */}
            {activeTab === 'shapes' && (
                <div className="absolute left-16 top-12 bottom-0 w-[240px] bg-gray-50 border-r border-gray-200 z-20 overflow-y-auto shadow-lg animate-in slide-in-from-left-4 custom-scrollbar">
                    <div className="p-3">
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2.5">Temel Şekiller</h3>
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <button onClick={() => handleShapeClick('rect')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-5 h-5 bg-gray-800 rounded-sm"></div></button>
                            <button onClick={() => handleShapeClick('circle')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-5 h-5 bg-gray-800 rounded-full"></div></button>
                            <button onClick={() => handleShapeClick('ellipse')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-7 h-4 bg-gray-800 rounded-full"></div></button>
                            <button onClick={() => handleShapeClick('stickyNote')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-5 h-5 bg-yellow-300 border border-yellow-400 rounded-sm shadow-sm relative"><div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-yellow-400 rounded-tl-sm shadow-[-1px_-1px_1px_rgba(0,0,0,0.1)]"></div></div></button>
                        </div>

                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2.5">Çokgenler</h3>
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <button onClick={() => handleShapeClick('triangle')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-gray-800"></div></button>
                            <button onClick={() => handleShapeClick('diamond')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-5 h-5 bg-gray-800 rotate-45 transform origin-center scale-75"></div></button>
                            <button onClick={() => handleShapeClick('star')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all text-gray-800 text-lg leading-none">★</button>
                            <button onClick={() => handleShapeClick('hexagon')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all text-gray-800 text-lg leading-none">⬡</button>
                            <button onClick={() => handleShapeClick('pentagon')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all text-gray-800 text-lg leading-none">⬠</button>
                        </div>

                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2.5">Çizgi ve Ok</h3>
                        <div className="flex flex-col gap-1.5 mb-5">
                            <button onClick={() => handleShapeClick('line')} className="w-full bg-white border border-gray-200 rounded py-1.5 px-3 hover:border-blue-500 hover:shadow-sm flex items-center gap-3 transition-all">
                                <div className="w-8 h-px bg-gray-800"></div><span className="text-[9px] font-medium text-gray-600">Düz Çizgi</span>
                            </button>
                            <button onClick={() => handleShapeClick('dashedLine')} className="w-full bg-white border border-gray-200 rounded py-1.5 px-3 hover:border-blue-500 hover:shadow-sm flex items-center gap-3 transition-all">
                                <div className="w-8 h-px border-t border-dashed border-gray-800"></div><span className="text-[9px] font-medium text-gray-600">Kesik Çizgi</span>
                            </button>
                            <button onClick={() => handleShapeClick('arrow')} className="w-full bg-white border border-gray-200 rounded py-1.5 px-3 hover:border-blue-500 hover:shadow-sm flex items-center gap-3 transition-all">
                                <div className="text-gray-800 font-bold text-xs leading-none">➔</div><span className="text-[9px] font-medium text-gray-600">Yön Oku</span>
                            </button>
                        </div>

                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2.5">Akış Şeması</h3>
                        <div className="grid grid-cols-2 gap-1.5 mb-5">
                            <button onClick={() => { if (onAddFlowchartShape) onAddFlowchartShape('startEnd') }} className="bg-white border border-gray-200 rounded py-1.5 text-[9px] font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all">Başla/Bitir</button>
                            <button onClick={() => { if (onAddFlowchartShape) onAddFlowchartShape('process') }} className="bg-white border border-gray-200 rounded py-1.5 text-[9px] font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all">İşlem</button>
                            <button onClick={() => { if (onAddFlowchartShape) onAddFlowchartShape('diamond') }} className="bg-white border border-gray-200 rounded py-1.5 text-[9px] font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all">Karar</button>
                            <button onClick={() => { if (onAddFlowchartShape) onAddFlowchartShape('database') }} className="bg-white border border-gray-200 rounded py-1.5 text-[9px] font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all">Veritabanı</button>
                        </div>

                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2.5">Dekoratif</h3>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => handleShapeClick('ring')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all"><div className="w-5 h-5 border-[3px] border-gray-800 rounded-full"></div></button>
                            <button onClick={() => handleShapeClick('heart')} className="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm flex items-center justify-center transition-all text-red-500 text-lg leading-none">♥</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollbar'ı ince göstermek için global stil eklentisi */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </>
    );
};

export default ControlsBar;
