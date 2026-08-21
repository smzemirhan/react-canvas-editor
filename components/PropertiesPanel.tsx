// @ts-nocheck
// src/components/PropertiesPanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { extractColorsFromImage } from "./refactored/utils/colorExtractor";

interface PropertiesPanelProps {
    selectedObject: any;
    onUpdateObject: (updatedProps: any) => void;
    onDeleteObject: () => void;
    allRenderItems: any[];
    onSelectLayer: (id: string) => void;
    onReorderLayers: (draggedId: string, targetId: string) => void;

    onGroup?: () => void;
    onUngroup?: () => void;
    isMultipleSelected?: boolean;
    isGrouped?: boolean;
    onToggleLock?: (id: string) => void;

    onBringToFront?: () => void;
    onSendToBack?: () => void;
}

export default function PropertiesPanel({
    selectedObject,
    onUpdateObject,
    onDeleteObject,
    allRenderItems,
    onSelectLayer,
    onReorderLayers,
    onGroup,
    onUngroup,
    isMultipleSelected = false,
    isGrouped = false,
    onToggleLock,
    onBringToFront,
    onSendToBack
}: PropertiesPanelProps) {
    const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

    const [localWidth, setLocalWidth] = useState<string>("");
    const [localHeight, setLocalHeight] = useState<string>("");

    const [extractedColors, setExtractedColors] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    const [projectPalette, setProjectPalette] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isText = selectedObject?.text !== undefined;
    const isImage = selectedObject?.url !== undefined;
    const isShape = selectedObject && !isText && !isImage && !selectedObject?.isGroupItem;
    const isFillableShape = isShape && !["line", "dashedLine", "arrow", "freehand"].includes(selectedObject.type) && selectedObject.itemCategory !== 'freehand';

    useEffect(() => {
        if (selectedObject) {
            const currentW = selectedObject.width ? Math.round(selectedObject.width * (selectedObject.scaleX || 1)) : "";
            const currentH = selectedObject.height ? Math.round(selectedObject.height * (selectedObject.scaleY || 1)) : "";
            setLocalWidth(currentW.toString());
            setLocalHeight(currentH.toString());
        }
    }, [selectedObject?.id, selectedObject?.width, selectedObject?.height, selectedObject?.scaleX, selectedObject?.scaleY]);

    useEffect(() => {
        if (isImage && selectedObject?.url) {
            setIsExtracting(true);
            extractColorsFromImage(selectedObject.url)
                .then(colors => {
                    setExtractedColors(colors);

                    setProjectPalette(prev => {
                        const newPalette = new Set([...prev, ...colors]);
                        return Array.from(newPalette).slice(-15);
                    });

                    setIsExtracting(false);
                })
                .catch(() => {
                    setExtractedColors([]);
                    setIsExtracting(false);
                });
        } else {
            setExtractedColors([]);
        }
    }, [isImage, selectedObject?.url]);

    // Görsel Yükleme ve Sıkıştırma (Firebase sınırını aşmamak için)
    const handlePatternImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedObject) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imgStr = event.target?.result as string;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 600; // Çözünürlüğü 600px'e düşürerek Firebase 1MB sınırını aşmıyoruz.

                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // JPEG formatında %70 kalite ile Base64'e çevir (Hafif ve hızlı kayıt için)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                onUpdateObject({
                    fillPatternImage: compressedBase64,
                    gradientColor: null
                });
            };
            img.src = imgStr;

            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsDataURL(file);
    };

    const renderLayerThumbnail = (item: any) => {
        if (item.itemCategory === 'image' && item.url) {
            return (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded bg-white border border-gray-200">
                    <img src={item.url} alt="Layer" className="w-full h-full object-cover relative z-10" />
                </div>
            );
        }

        if (item.itemCategory === 'text') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200 overflow-hidden">
                    <span
                        className="text-[10px] font-bold leading-none select-none"
                        style={{ color: item.fill || '#374151', fontFamily: item.fontFamily }}
                    >
                        T
                    </span>
                </div>
            );
        }

        if (item.itemCategory === 'freehand') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={item.stroke || '#374151'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12c2-4 6-4 8 0s6 4 8 0" />
                    </svg>
                </div>
            );
        }

        if (item.itemCategory === 'shape') {
            if (item.type === 'icon' && item.path) {
                const hasGradient = !!item.gradientColor;
                const fillId = `grad-${item.id}`;
                return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200 overflow-hidden shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 relative z-10">
                            {hasGradient && (
                                <defs>
                                    <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={item.fill || '#374151'} />
                                        <stop offset="100%" stopColor={item.gradientColor} />
                                    </linearGradient>
                                </defs>
                            )}
                            <path d={item.path} fill={hasGradient ? `url(#${fillId})` : (item.fill || '#374151')} />
                        </svg>
                    </div>
                );
            }

            let bg = item.fill || item.stroke || '#e5e7eb';
            if (item.gradientColor && item.type !== 'line' && item.type !== 'dashedLine' && item.type !== 'arrow' && item.type !== 'icon') {
                bg = `linear-gradient(to bottom right, ${item.fill || '#ffffff'}, ${item.gradientColor})`;
            }
            if (item.fillPatternImage) {
                bg = `url(${item.fillPatternImage}) center/cover`;
            }

            let shapeStyle: any = { background: bg, border: `1px solid ${item.stroke || 'transparent'}` };

            if (item.type === 'circle' || item.type === 'ellipse') {
                shapeStyle.borderRadius = '50%';
            } else if (item.type === 'rect' || item.type === 'stickyNote') {
                shapeStyle.borderRadius = `${Math.min(item.cornerRadius || 0, 4)}px`;
            } else if (item.type === 'triangle') {
                shapeStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                shapeStyle.border = 'none';
            } else if (item.type === 'star') {
                shapeStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                shapeStyle.border = 'none';
            } else if (item.type === 'pentagon') {
                shapeStyle.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
                shapeStyle.border = 'none';
            } else if (item.type === 'hexagon') {
                shapeStyle.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                shapeStyle.border = 'none';
            } else if (item.type === 'diamond') {
                shapeStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                shapeStyle.border = 'none';
            } else if (item.type === 'heart') {
                return <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200"><span className="text-[8px]" style={{ color: bg }}>❤️</span></div>;
            }

            return (
                <div className="w-full h-full flex items-center justify-center bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="w-3.5 h-3.5 relative z-10" style={shapeStyle} />
                </div>
            );
        }

        return <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-[9px] font-bold text-gray-400">?</div>;
    };

    const renderColorPalette = (onSelectColor: (color: string) => void) => {
        if (projectPalette.length === 0) return null;

        return (
            <div className="flex gap-1.5 flex-wrap mt-1.5">
                {projectPalette.map((color, idx) => (
                    <button
                        key={idx}
                        className="w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelectColor(color);
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <aside className="w-[210px] bg-[#f8fafc] border-l border-slate-200 flex flex-col shadow-[inset_1px_0_0_rgba(255,255,255,1)] z-10 overflow-hidden shrink-0">

            <div className="flex border-b border-slate-200 shrink-0 bg-white">
                <button onClick={() => setActiveTab('properties')} className={`flex-1 py-2 text-[10px] font-semibold transition-colors ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:bg-slate-50'}`}>Özellikler</button>
                <button onClick={() => setActiveTab('layers')} className={`flex-1 py-2 text-[10px] font-semibold transition-colors ${activeTab === 'layers' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:bg-slate-50'}`}>Katmanlar</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">

                {activeTab === 'layers' && (
                    <div className="flex flex-col gap-1.5">
                        {allRenderItems.length === 0 ? (
                            <p className="text-slate-400 text-[10px] text-center py-4">Tuvalde hiç nesne yok.</p>
                        ) : (
                            [...allRenderItems].reverse().map((item, index) => {
                                const isSelected = selectedObject?.id === item.id;
                                let name = "Şekil";

                                if (item.itemCategory === 'text') {
                                    name = `Metin: ${item.text?.substring(0, 6) || 'Boş'}...`;
                                } else if (item.itemCategory === 'image') {
                                    name = "Görsel";
                                } else if (item.itemCategory === 'shape') {
                                    if (item.type === 'icon') {
                                        name = 'İkon';
                                    } else {
                                        const typeMap: Record<string, string> = {
                                            rect: 'Dikdörtgen', circle: 'Daire', ellipse: 'Elips',
                                            triangle: 'Üçgen', pentagon: 'Beşgen', hexagon: 'Altıgen',
                                            diamond: 'Elmas', star: 'Yıldız', ring: 'Halka', heart: 'Kalp'
                                        };
                                        name = typeMap[item.type] || 'Şekil';
                                    }
                                } else if (item.itemCategory === 'freehand') {
                                    name = "Çizim";
                                }

                                const isItemInGroup = !!item.groupId;

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between w-full p-1.5 rounded-md border transition-all shadow-sm
                                            ${dragOverLayerId === item.id ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-md' :
                                                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
                                            ${draggedLayerId === item.id ? 'opacity-40' : 'opacity-100'}
                                            ${isItemInGroup ? 'ml-2 border-l-2 border-l-purple-400' : ''} 
                                        `}
                                    >
                                        <div
                                            draggable={!item.isLocked}
                                            onDragStart={(e) => {
                                                if (item.isLocked) return e.preventDefault();
                                                setDraggedLayerId(item.id);
                                                e.dataTransfer.effectAllowed = "move";
                                                e.dataTransfer.setData("text/plain", item.id);
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = "move";
                                                if (dragOverLayerId !== item.id) {
                                                    setDragOverLayerId(item.id);
                                                }
                                            }}
                                            onDragLeave={() => setDragOverLayerId(null)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                if (draggedLayerId && draggedLayerId !== item.id) {
                                                    onReorderLayers(draggedLayerId, item.id);
                                                }
                                                setDraggedLayerId(null);
                                                setDragOverLayerId(null);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedLayerId(null);
                                                setDragOverLayerId(null);
                                            }}
                                            onClick={() => {
                                                if (!item.isLocked) {
                                                    onSelectLayer(item.id);
                                                    setActiveTab('properties');
                                                }
                                            }}
                                            className={`flex-1 flex items-center gap-1.5 overflow-hidden ${item.isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
                                        >
                                            <div className={`w-6 h-6 flex items-center justify-center rounded shrink-0 ${isSelected ? 'ring-1 ring-blue-400 ring-offset-1' : ''}`}>
                                                {renderLayerThumbnail(item)}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`text-[10px] font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {name}
                                                </span>
                                                <span className="text-[8px] text-slate-400">
                                                    Katman {allRenderItems.length - index}
                                                </span>
                                            </div>
                                        </div>

                                        {onToggleLock && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleLock(item.id); }}
                                                className={`ml-1 p-0.5 rounded transition-colors ${item.isLocked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                                title={item.isLocked ? "Kilidi Aç" : "Kilitle"}
                                            >
                                                {item.isLocked ? "🔒" : "🔓"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'properties' && (
                    <>
                        {(!selectedObject && !isMultipleSelected) ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-center h-full pt-10">
                                <span className="text-3xl mb-2 opacity-20">🎯</span>
                                <p className="text-slate-400 text-[10px]">Düzenlemek için nesne seçin.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                                    <span className="text-[9px] text-blue-600 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                        {isMultipleSelected ? "Çoklu Seçim" : isGrouped ? "Grup" : isText ? "Metin" : isImage ? "Görsel" : selectedObject.type === 'icon' ? "İkon" : selectedObject.itemCategory === 'freehand' ? "Çizim" : "Şekil"}
                                    </span>
                                    {isMultipleSelected && !isGrouped && onGroup && <button onClick={onGroup} className="text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-0.5 px-2 rounded shadow-sm transition-colors">Grupla</button>}
                                    {isGrouped && onUngroup && <button onClick={onUngroup} className="text-[9px] bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-0.5 px-2 rounded shadow-sm transition-colors">Grubu Çöz</button>}
                                </div>

                                {isMultipleSelected && !isGrouped ? (
                                    <div className="flex flex-col gap-1.5 p-2 bg-white border border-slate-200 shadow-sm rounded-lg text-center">
                                        <span className="text-xl">📦</span>
                                        <p className="text-[10px] text-slate-600 font-medium">Birden fazla nesne seçili.</p>
                                    </div>
                                ) : (
                                    <>
                                        {isImage && selectedObject && (
                                            <div className="flex flex-col gap-1 bg-white p-2 shadow-sm rounded-lg border border-slate-200">
                                                <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                                                    <span>🎨</span> Görsel Renkleri
                                                </label>

                                                {isExtracting ? (
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[9px] text-slate-400">Analiz ediliyor...</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <div key={i} className="w-4 h-4 rounded-full bg-slate-200 animate-pulse"></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : extractedColors.length > 0 ? (
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {extractedColors.map((color, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    className="w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 active:scale-95"
                                                                    style={{ backgroundColor: color }}
                                                                    title={color}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[8px] text-slate-400 leading-tight">Bu renkler palete eklendi.</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-[9px] text-slate-400 mt-1">Renk bulunamadı.</p>
                                                )}
                                            </div>
                                        )}

                                        {isText && selectedObject && (
                                            <>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-semibold text-slate-600">Yazı İçeriği</label>
                                                    <textarea value={selectedObject.text || ""} onChange={(e) => onUpdateObject({ text: e.target.value })} className="bg-white border border-slate-300 shadow-sm rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 min-h-[40px] resize-y transition-all" />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-semibold text-slate-600">Yazı Tipi</label>
                                                    <select
                                                        value={selectedObject.fontFamily || "Arial"}
                                                        onChange={(e) => onUpdateObject({ fontFamily: e.target.value })}
                                                        className="bg-white border border-slate-300 shadow-sm rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer"
                                                        style={{ fontFamily: selectedObject.fontFamily || "Arial" }}
                                                    >
                                                        {[
                                                            "Arial", "Great Vibes", "Dancing Script", "Caveat", "Pacifico",
                                                            "Playfair Display", "Merriweather", "Cinzel", "Inter",
                                                            "Montserrat", "Poppins", "Roboto", "Lato"
                                                        ].map(font => (
                                                            <option key={font} value={font} style={{ fontFamily: font, fontSize: '12px' }}>
                                                                {font}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between"><label className="text-[10px] font-semibold text-slate-600">Yazı Boyutu</label><span className="text-[9px] font-medium text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-sm">{Math.round(selectedObject.fontSize || 32)}px</span></div>
                                                    <input type="range" min="8" max="150" value={Math.round(selectedObject.fontSize || 32)} onChange={(e) => onUpdateObject({ fontSize: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-0.5" />
                                                </div>

                                                <div className="flex flex-col gap-1 mt-0.5 bg-white p-2 shadow-sm rounded-lg border border-slate-200">
                                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => onUpdateObject({ isCurved: !selectedObject.isCurved, curveRadius: selectedObject.curveRadius || 100 })}>
                                                        <label className="text-[10px] font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                                                            <span>↩️</span> Bük
                                                        </label>
                                                        <input type="checkbox" checked={!!selectedObject.isCurved} readOnly className="accent-blue-500 w-3 h-3 cursor-pointer" />
                                                    </div>
                                                    {selectedObject.isCurved && (
                                                        <div className="flex flex-col gap-1 mt-1.5 pt-1.5 border-t border-slate-100">
                                                            <div className="flex justify-between">
                                                                <label className="text-[9px] font-semibold text-slate-500">Yarıçap</label>
                                                                <span className="text-[9px] font-medium text-slate-500">{selectedObject.curveRadius || 100}</span>
                                                            </div>
                                                            <input type="range" min="20" max="300" value={selectedObject.curveRadius || 100} onChange={(e) => onUpdateObject({ curveRadius: Number(e.target.value) })} className="w-full accent-purple-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {selectedObject && (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex justify-between"><label className="text-[10px] font-semibold text-slate-600">Opaklık</label><span className="text-[9px] font-medium text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-sm">{Math.round((selectedObject.opacity ?? 1) * 100)}%</span></div>
                                                <input type="range" min="0" max="1" step="0.05" value={selectedObject.opacity ?? 1} onChange={(e) => onUpdateObject({ opacity: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-0.5" />
                                            </div>
                                        )}

                                        {selectedObject && (isImage || isGrouped || (isShape && (selectedObject.type === "rect" || selectedObject.type === "stickyNote"))) && (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-semibold text-slate-600">Boyut</label>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={localWidth}
                                                                onChange={(e) => setLocalWidth(e.target.value)}
                                                                onBlur={() => {
                                                                    const val = Number(localWidth);
                                                                    if (val > 0 && selectedObject.width) {
                                                                        const newScaleX = val / selectedObject.width;
                                                                        onUpdateObject({ scaleX: newScaleX });
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                                                }}
                                                                className="w-full bg-white border border-slate-300 shadow-sm rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 transition-all pr-4"
                                                            />
                                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-300">W</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={localHeight}
                                                                onChange={(e) => setLocalHeight(e.target.value)}
                                                                onBlur={() => {
                                                                    const val = Number(localHeight);
                                                                    if (val > 0 && selectedObject.height) {
                                                                        const newScaleY = val / selectedObject.height;
                                                                        onUpdateObject({ scaleY: newScaleY });
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                                                }}
                                                                className="w-full bg-white border border-slate-300 shadow-sm rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-blue-500 transition-all pr-4"
                                                            />
                                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-300">H</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedObject && (!isImage || isGrouped) && selectedObject.itemCategory !== 'freehand' && (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex justify-between"><label className="text-[10px] font-semibold text-slate-600">Dönme</label><span className="text-[9px] font-medium text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-sm">{Math.round(selectedObject.rotation || 0)}°</span></div>
                                                <input type="range" min="0" max="360" value={selectedObject.rotation || 0} onChange={(e) => onUpdateObject({ rotation: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-0.5" />
                                            </div>
                                        )}

                                        {isFillableShape && (
                                            <div className="flex flex-col gap-1 mt-0.5 bg-indigo-50/50 p-2 shadow-sm rounded-lg border border-indigo-100">
                                                <label className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                                                    <span>🖼️</span> Görselle Kapla
                                                </label>
                                                <p className="text-[8px] text-indigo-500/80 mb-1 leading-tight">Şeklin içini bilgisayarınızdan seçeceğiniz bir görsel ile doldurun.</p>

                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        onChange={handlePatternImageUpload}
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold py-1.5 rounded-md text-[9px] transition-colors shadow-sm"
                                                    >
                                                        {selectedObject.fillPatternImage ? "Görseli Değiştir" : "Görsel Seç"}
                                                    </button>

                                                    {selectedObject.fillPatternImage && (
                                                        <button
                                                            onClick={() => onUpdateObject({ fillPatternImage: null })}
                                                            className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-md text-[9px] font-bold transition-colors"
                                                            title="Görseli Kaldır"
                                                        >
                                                            Kaldır
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedObject && !isImage && !isGrouped && (
                                            <div className="flex flex-col gap-1 mt-0.5 bg-white p-2 shadow-sm rounded-lg border border-slate-200">
                                                <label className="text-[10px] font-bold text-slate-700">
                                                    {isShape && selectedObject.itemCategory !== 'freehand' && !["line", "dashedLine", "arrow"].includes(selectedObject.type) ? "Renk & Degrade" : "Ana Renk"}
                                                </label>

                                                <div className={`flex items-center gap-2 mt-0.5 ${selectedObject.fillPatternImage ? 'opacity-30 pointer-events-none' : ''}`}>
                                                    <input
                                                        type="color"
                                                        value={selectedObject.stroke || selectedObject.fill || "#000000"}
                                                        onChange={(e) => {
                                                            const color = e.target.value;
                                                            if (selectedObject.itemCategory === 'freehand' || (isShape && ["line", "dashedLine", "arrow"].includes(selectedObject.type))) {
                                                                onUpdateObject({ stroke: color, fill: color });
                                                            } else {
                                                                onUpdateObject({ fill: color });
                                                            }
                                                        }}
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(203,213,225,1)] cursor-pointer p-0 shrink-0 transition-transform hover:scale-110"
                                                    />

                                                    {isShape && selectedObject.itemCategory !== 'freehand' && !["line", "dashedLine", "arrow"].includes(selectedObject.type) && (
                                                        <>
                                                            <span className="text-slate-300 text-[9px]">➔</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input type="color" value={selectedObject.gradientColor || "#ffffff"} onChange={(e) => onUpdateObject({ gradientColor: e.target.value })} className="w-6 h-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(203,213,225,1)] cursor-pointer p-0 shrink-0 transition-transform hover:scale-110" />
                                                                <button onClick={() => onUpdateObject({ gradientColor: null })} className="text-[8px] bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 px-1.5 py-0.5 rounded transition-colors font-medium">Temizle</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {selectedObject.fillPatternImage && (
                                                    <p className="text-[8px] text-amber-600 font-medium leading-tight mt-1">Renk uygulamak için önce kaplama görselini kaldırın.</p>
                                                )}

                                                {projectPalette.length > 0 && (
                                                    <div className={`mt-1.5 pt-1.5 border-t border-slate-100 ${selectedObject.fillPatternImage ? 'opacity-30 pointer-events-none' : ''}`}>
                                                        <span className="text-[8px] text-slate-400 mb-0.5 block">Proje Renkleri:</span>
                                                        {renderColorPalette((color) => {
                                                            if (selectedObject.itemCategory === 'freehand' || (isShape && ["line", "dashedLine", "arrow"].includes(selectedObject.type))) {
                                                                onUpdateObject({ stroke: color, fill: color });
                                                            } else {
                                                                onUpdateObject({ fill: color });
                                                            }
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedObject && !isGrouped && (
                                            <div className="flex flex-col gap-1 bg-white p-2 shadow-sm rounded-lg border border-slate-200">
                                                <label className="text-[10px] font-bold text-slate-700">Gölge</label>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <input type="color" value={selectedObject.shadowColor || "#000000"} onChange={(e) => onUpdateObject({ shadowColor: e.target.value })} className="w-5 h-5 rounded border border-slate-300 shadow-sm cursor-pointer p-0 shrink-0" />
                                                    <span className="text-[9px] font-medium text-slate-500">Renk</span>
                                                </div>
                                                {projectPalette.length > 0 && (
                                                    <div className="mt-1 pt-1 border-t border-slate-100">
                                                        {renderColorPalette((color) => onUpdateObject({ shadowColor: color }))}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-slate-100">
                                                    <div className="flex justify-between">
                                                        <label className="text-[9px] font-semibold text-slate-500">Bulanıklık</label>
                                                        <span className="text-[9px] font-medium text-slate-500">{selectedObject.shadowBlur || 0}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="50"
                                                        value={selectedObject.shadowBlur || 0}
                                                        onChange={(e) => onUpdateObject({
                                                            shadowBlur: Number(e.target.value),
                                                            shadowOffsetX: Number(e.target.value) > 0 ? 5 : 0,
                                                            shadowOffsetY: Number(e.target.value) > 0 ? 5 : 0
                                                        })}
                                                        className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-1">
                                            {onBringToFront && (
                                                <button
                                                    onClick={onBringToFront}
                                                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 rounded-md text-[10px] transition-all shadow-sm flex items-center justify-center gap-1"
                                                >
                                                    <span className="text-xs">⬆</span> Öne Al
                                                </button>
                                            )}
                                            {onSendToBack && (
                                                <button
                                                    onClick={onSendToBack}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-md text-[10px] transition-all shadow-sm flex items-center justify-center gap-1"
                                                >
                                                    <span className="text-xs">⬇</span> Alta Gönder
                                                </button>
                                            )}
                                        </div>

                                        <button onClick={onDeleteObject} className="w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold tracking-wide py-1.5 rounded-md text-[10px] transition-all shadow-sm mt-0.5">NESNEYİ SİL</button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
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
        </aside>
    );
}
