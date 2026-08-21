// src/components/CanvasArea.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Text, Rect, Transformer, Line, Path, TextPath } from "react-konva";
import PropertiesPanel from "./PropertiesPanel";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useCanvasArea } from "./refactored/hooks/useCanvasArea";
import ControlsBar from "./refactored/components/ControlsBar";
import URLImage from "./refactored/components/URLImage";
import TemplateModal from "./refactored/components/TemplateModal";
import IconModal from "./refactored/components/IconModal";
import ShapeNode from "./refactored/components/ShapeNode";
import { ShapeItem } from "./refactored/types";
import ExportModal from "./refactored/components/ExportModal";

export default function CanvasArea() {
    const [isMounted, setIsMounted] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const [canvasConfig, setCanvasConfig] = useState({ width: 1080, height: 1080, name: "Instagram Gönderisi" });
    const [zoomLevel, setZoomLevel] = useState(0.5);

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isIconModalOpen, setIsIconModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [isLoadingProject, setIsLoadingProject] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number }>({ visible: false, x: 0, y: 0 });
    const [clipboard, setClipboard] = useState<any[]>([]);

    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [brushColor, setBrushColor] = useState("#3b82f6");
    const [brushSize, setBrushSize] = useState(5);
    const isDrawingRef = useRef(false);
    const isFirstRender = useRef(true);

    const [isZenMode, setIsZenMode] = useState(false);

    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        (window as any).isDrawingModeActive = isDrawingMode;
    }, [isDrawingMode]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const [guidelines, setGuidelines] = useState<{ type: string; val: number }[]>([]);
    const hasLoadedInitialData = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const dragStartPositions = useRef<{ id: string, x: number, y: number }[]>([]);

    const {
        shapes, setShapes, texts, setTexts, images, setImages,
        freehandLines, setFreehandLines,
        selectedIds, setSelectedIds, handleSelectObject, shapeRef, trRef, fileInputRef,
        selectedObject, handleLoadTemplate, handleImageUpload,
        handleUpdateObject, handleDeleteObject,
        selectionRect, setSelectionRect,
        handleUndo, handleRedo, canUndo, canRedo,
        handleGroup, handleUngroup
    } = useCanvasArea({ width: canvasConfig.width, height: canvasConfig.height }, stageRef);

    const handleAddIcon = (path: string) => {
        const newShape = {
            id: `shape-icon-${Date.now()}`,
            itemCategory: 'shape',
            type: 'icon',
            path: path,
            x: canvasConfig.width / 2 - 48,
            y: canvasConfig.height / 2 - 48,
            fill: '#ff9800',
            scaleX: 4,
            scaleY: 4,
            rotation: 0,
            opacity: 1,
            isLocked: false,
            zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
        };
        setShapes(prev => [...prev, newShape as any]);
        setIsIconModalOpen(false);
        setSelectedIds([newShape.id]);
    };

    const handleAddShape = (type: string) => {
        let w = 120, h = 120;
        let radius = undefined, points = undefined;

        if (type === 'rect' || type === 'stickyNote') { w = 150; h = 150; }
        else if (['circle', 'ellipse', 'triangle', 'pentagon', 'hexagon', 'diamond', 'star', 'ring', 'heart'].includes(type)) { radius = 60; }
        else if (type === 'line' || type === 'dashedLine' || type === 'arrow') { points = [0, 0, 200, 0]; }

        const isLineType = type === 'line' || type === 'dashedLine' || type === 'arrow';

        const newShape = {
            id: `shape-${type}-${Date.now()}`,
            itemCategory: 'shape',
            type: type,
            x: canvasConfig.width / 2 - (w / 2),
            y: canvasConfig.height / 2 - (h / 2),
            width: w,
            height: h,
            radius: radius,
            points: points,
            fill: isLineType ? '#1e293b' : '#e2e8f0',
            stroke: isLineType ? '#1e293b' : 'transparent',
            strokeWidth: isLineType ? 4 : 0,
            dash: type === 'dashedLine' ? [12, 8] : undefined,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1,
            isLocked: false,
            zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
        };

        setShapes(prev => [...prev, newShape as any]);
        setSelectedIds([newShape.id]);
    };

    const handleAddText = () => {
        const newText = {
            id: `text-${Date.now()}`,
            itemCategory: 'text',
            text: "YENİ METİN",
            x: canvasConfig.width / 2 - 150,
            y: canvasConfig.height / 2 - 30,
            width: 300,
            fontSize: 48,
            fontFamily: "Montserrat",
            fill: "#1e293b",
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1,
            isLocked: false,
            zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
        };
        setTexts(prev => [...prev, newText as any]);
        setSelectedIds([newText.id]);
    };

    const handleAddFlowchartShape = (type: 'diamond' | 'database' | 'process' | 'startEnd') => {
        let shapeType = 'rect';
        let path = undefined;
        let w = 120;
        let h = 80;
        let scaleX = 1;
        let scaleY = 1;

        if (type === 'diamond') { shapeType = 'diamond'; w = 120; h = 120; }
        else if (type === 'database') { shapeType = 'icon'; path = "M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3zm0 0v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6"; w = 24; h = 24; scaleX = 5; scaleY = 5; }
        else if (type === 'process') { shapeType = 'rect'; w = 140; h = 80; }
        else if (type === 'startEnd') { shapeType = 'ellipse'; w = 140; h = 60; }

        const newShape = {
            id: `shape-${type}-${Date.now()}`, itemCategory: 'shape', type: shapeType, path: path,
            x: canvasConfig.width / 2 - (w * scaleX) / 2, y: canvasConfig.height / 2 - (h * scaleY) / 2,
            width: w, height: h, fill: '#e2e8f0', stroke: '#475569', scaleX: scaleX, scaleY: scaleY, rotation: 0, opacity: 1, isLocked: false,
            zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
        };
        setShapes(prev => [...prev, newShape as any]);
        setSelectedIds([newShape.id]);
    };

    const handleRandomBackground = () => {
        const pastelColors = ["#fdf4ff", "#f0fdf4", "#f0fdfa", "#fffbeb", "#fefce8", "#fff1f2", "#ffe4e6", "#e0e7ff", "#e0f2fe", "#ede9fe", "#fce7f3", "#ffedd5"];
        const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        setBackgroundColor(randomColor);
    };

    const handlePresentationMode = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) { containerRef.current.requestFullscreen().catch(err => console.log(err)); }
            else { document.exitFullscreen(); }
        }
    };

    const handleGenerateAIImage = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            if (!response.ok) {
                throw new Error("Sunucudan hata döndü.");
            }

            const data = await response.json();

            if (data.error || !data.base64) {
                throw new Error(data.error || "Görsel verisi alınamadı.");
            }

            const newImage = {
                id: `image-ai-${Date.now()}`,
                itemCategory: 'image',
                url: data.base64,
                x: canvasConfig.width / 2 - 256,
                y: canvasConfig.height / 2 - 256,
                width: 512,
                height: 512,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                opacity: 1,
                isLocked: false,
                zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
            };

            setImages(prev => [...prev, newImage as any]);
            setSelectedIds([newImage.id]);
            setIsAiModalOpen(false);
            setAiPrompt("");
            setIsGenerating(false);

        } catch (error) {
            console.error("YZ Üretim Hatası:", error);
            alert("Görsel üretilirken bir sorun oluştu. Sunucu yoğun olabilir.");
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const handleGlobalClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        if (contextMenu.visible) window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [contextMenu.visible]);

    useEffect(() => {
        const handleOpenExportModal = () => setIsExportModalOpen(true);
        window.addEventListener('open-export-modal', handleOpenExportModal);

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.textContent?.trim() === 'İndir' && !target.textContent?.includes('Kaydet')) {
                e.preventDefault();
                setIsExportModalOpen(true);
            }
        };
        document.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('open-export-modal', handleOpenExportModal);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    useEffect(() => {
        setIsMounted(true);
        const preloadCustomFonts = async () => {
            const fontList = ["Great Vibes", "Dancing Script", "Caveat", "Pacifico", "Playfair Display", "Merriweather", "Cinzel", "Inter", "Montserrat", "Poppins", "Roboto", "Lato"];
            try { await Promise.all(fontList.map(font => document.fonts.load(`16px "${font}"`))); } catch (error) { } finally { setFontsLoaded(true); }
        };
        preloadCustomFonts();
    }, []);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setZoomLevel(prev => e.deltaY < 0 ? Math.min(3, prev + 0.1) : Math.max(0.1, prev - 0.1));
            }
        };
        const container = containerRef.current;
        container?.addEventListener('wheel', handleWheel, { passive: false });
        return () => container?.removeEventListener('wheel', handleWheel);
    }, []);

    useEffect(() => {
        if (!isMounted || !fontsLoaded || hasLoadedInitialData.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');
        const templateId = urlParams.get('templateId');

        const customWidth = urlParams.get('width');
        const customHeight = urlParams.get('height');
        const customName = urlParams.get('name');

        if (!projectId && !templateId) {
            hasLoadedInitialData.current = true;

            if (customWidth && customHeight && customName) {
                setCanvasConfig({
                    width: parseInt(customWidth, 10),
                    height: parseInt(customHeight, 10),
                    name: decodeURIComponent(customName)
                });
            }
            return;
        }

        if (projectId) setIsLoadingProject(true);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && projectId && !hasLoadedInitialData.current) {
                hasLoadedInitialData.current = true;
                try {
                    const docSnap = await getDoc(doc(db, "projects", projectId));
                    if (docSnap.exists()) {
                        const project = docSnap.data();
                        if (project.userId === user.uid && project.data) {
                            setShapes(project.data.shapes || []);
                            setTexts(project.data.texts || []);
                            setImages(project.data.images || []);
                            setFreehandLines(project.data.freehandLines || []);
                            setBackgroundColor(project.data.backgroundColor || "#ffffff");
                            if (project.data.canvasConfig) setCanvasConfig(project.data.canvasConfig);
                        }
                    }
                } catch (error) { } finally { setIsLoadingProject(false); }
            }
        });

        if (templateId && !hasLoadedInitialData.current) {
            hasLoadedInitialData.current = true;
            setTimeout(() => {
                const originalConfirm = window.confirm; window.confirm = () => true;
                handleLoadTemplate(templateId);
                window.confirm = originalConfirm;
            }, 100);
        }
        return () => unsubscribe();
    }, [isMounted, fontsLoaded, setShapes, setTexts, setImages, setFreehandLines, handleLoadTemplate]);

    // Kayıt Döngüsünü ve Hatalarını Düzelten Ana Fonksiyon
    const handleSave = useCallback(async (isAutoSave = false) => {
        if (!stageRef.current) return;
        const currentUser = auth.currentUser;

        // GİRİŞ YAPMAYAN KULLANICI UYARISI
        if (!currentUser) {
            if (!isAutoSave) { // Arka planda rahatsız etme, sadece butona basınca uyar
                setSaveMessage("⚠️ Kaydetmek için giriş yapmalısınız!");
                setTimeout(() => setSaveMessage(null), 3500);
            }
            return; // İşlemi kes Yönlendirme (redirect) YAPMA
        }

        if (!isAutoSave) setSelectedIds([]);

        try {
            const thumbnail = stageRef.current.toDataURL({ mimeType: "image/jpeg", quality: 0.5, pixelRatio: 0.3 / zoomLevel });
            const currentProjectId = new URLSearchParams(window.location.search).get('projectId');
            const newId = currentProjectId || Date.now().toString();

            const sanitizeData = (data: any) => JSON.parse(JSON.stringify(data, (key, value) => (value === undefined ? null : value)));
            const cleanData = sanitizeData({ shapes, texts, images, freehandLines, backgroundColor, canvasConfig });

            await setDoc(doc(db, "projects", newId), {
                id: newId, userId: currentUser.uid, name: `Tasarım - ${new Date().toLocaleDateString()}`,
                date: new Date().toLocaleDateString('tr-TR'), timestamp: Date.now(), thumbnail: thumbnail || "", data: cleanData
            });

            if (!currentProjectId) window.history.replaceState(null, '', `?projectId=${newId}`);

            setSaveMessage(isAutoSave ? "Değişiklikler kaydedildi ☁️" : "Tasarım başarıyla kaydedildi! ✅");
            setTimeout(() => setSaveMessage(null), isAutoSave ? 2000 : 3000);
        } catch (error: any) {
            console.error("Kayıt Hatası:", error);
            // (resource-exhausted hatasını engeller)
            if (!isAutoSave) {
                setSaveMessage("❌ Kayıt başarısız! Tasarım verisi çok büyük olabilir.");
                setTimeout(() => setSaveMessage(null), 3500);
            }
        }
    }, [shapes, texts, images, freehandLines, backgroundColor, canvasConfig, zoomLevel, setSelectedIds]);

    useEffect(() => {
        const listener = () => handleSave(false);
        window.addEventListener('save-canvas-project', listener);
        return () => window.removeEventListener('save-canvas-project', listener);
    }, [handleSave]);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (isLoadingProject) return;
        const timer = setTimeout(() => handleSave(true), 5000);
        return () => clearTimeout(timer);
    }, [shapes, texts, images, freehandLines, backgroundColor, canvasConfig, handleSave, isLoadingProject]);

    const handleExport = (format: 'png' | 'jpg' | 'pdf', quality: number) => {
        if (!stageRef.current) return;
        setSelectedIds([]);
        setTimeout(() => {
            const dataURL = stageRef.current.toDataURL({ mimeType: format === 'png' ? 'image/png' : 'image/jpeg', quality: format === 'png' ? 1 : quality, pixelRatio: 2 / zoomLevel });
            if (format === 'pdf') {
                import('jspdf').then(({ jsPDF }) => {
                    const pdf = new jsPDF({ orientation: canvasConfig.width > canvasConfig.height ? 'l' : 'p', unit: 'px', format: [canvasConfig.width, canvasConfig.height] });
                    pdf.addImage(dataURL, 'JPEG', 0, 0, canvasConfig.width, canvasConfig.height);
                    pdf.save(`CanvasEditor-${Date.now()}.pdf`);
                });
            } else {
                const link = document.createElement('a');
                link.download = `CanvasEditor-${Date.now()}.${format}`; link.href = dataURL;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }
        }, 100);
    };

    const allRenderItems = [
        ...images.map(i => ({ ...i, itemCategory: 'image' })),
        ...shapes.map(s => ({ ...s, itemCategory: 'shape' })),
        ...texts.map(t => ({ ...t, itemCategory: 'text' })),
        ...freehandLines.map(f => ({ ...f, itemCategory: 'freehand' }))
    ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const isOnlyTextSelected = selectedIds.length === 1 && texts.some(t => t.id === selectedIds[0]);
    const isMultipleSelected = selectedIds.length > 1;
    const isGrouped = isMultipleSelected && selectedIds.every(id => {
        const item = allRenderItems.find(i => i.id === id);
        return item?.groupId && item.groupId === allRenderItems.find(i => i.id === selectedIds[0])?.groupId;
    });

    const handleReorderLayers = (draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;
        const sortedItems = [...allRenderItems];
        const draggedIndex = sortedItems.findIndex(i => i.id === draggedId);
        const targetIndex = sortedItems.findIndex(i => i.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const [draggedItem] = sortedItems.splice(draggedIndex, 1);
        sortedItems.splice(targetIndex, 0, draggedItem);
        const zIndexMap = new Map<string, number>();
        sortedItems.forEach((item, index) => zIndexMap.set(item.id, index + 1));
        setShapes(prev => prev.map(s => zIndexMap.has(s.id) ? { ...s, zIndex: zIndexMap.get(s.id)! } : s));
        setTexts(prev => prev.map(t => zIndexMap.has(t.id) ? { ...t, zIndex: zIndexMap.get(t.id)! } : t));
        setImages(prev => prev.map(i => zIndexMap.has(i.id) ? { ...i, zIndex: zIndexMap.get(i.id)! } : i));
        setFreehandLines(prev => prev.map(f => zIndexMap.has(f.id) ? { ...f, zIndex: zIndexMap.get(f.id)! } : f));
    };

    const handleCopy = () => {
        if (selectedIds.length === 0) return;
        const itemsToCopy = allRenderItems.filter(item => selectedIds.includes(item.id));
        setClipboard(itemsToCopy);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handlePaste = () => {
        if (clipboard.length === 0) return;
        const newSelectedIds: string[] = [];
        clipboard.forEach(item => {
            const newId = `${item.itemCategory}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            newSelectedIds.push(newId);
            const newItem = { ...item, id: newId, x: (item.x || 0) + 20, y: (item.y || 0) + 20 };
            if (item.itemCategory === 'shape') setShapes(prev => [...prev, newItem as any]);
            else if (item.itemCategory === 'text') setTexts(prev => [...prev, newItem as any]);
            else if (item.itemCategory === 'image') setImages(prev => [...prev, newItem as any]);
            else if (item.itemCategory === 'freehand') setFreehandLines(prev => [...prev, newItem as any]);
        });
        setSelectedIds(newSelectedIds);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleBringToFront = () => {
        if (selectedIds.length === 0) return;
        const sortedItems = [...allRenderItems];
        for (let i = sortedItems.length - 2; i >= 0; i--) {
            if (selectedIds.includes(sortedItems[i].id) && !selectedIds.includes(sortedItems[i + 1].id)) {
                const temp = sortedItems[i];
                sortedItems[i] = sortedItems[i + 1];
                sortedItems[i + 1] = temp;
            }
        }
        const zIndexMap = new Map<string, number>();
        sortedItems.forEach((item, index) => zIndexMap.set(item.id, index + 1));
        setShapes(prev => prev.map(s => zIndexMap.has(s.id) ? { ...s, zIndex: zIndexMap.get(s.id)! } : s));
        setTexts(prev => prev.map(t => zIndexMap.has(t.id) ? { ...t, zIndex: zIndexMap.get(t.id)! } : t));
        setImages(prev => prev.map(i => zIndexMap.has(i.id) ? { ...i, zIndex: zIndexMap.get(i.id)! } : i));
        setFreehandLines(prev => prev.map(f => zIndexMap.has(f.id) ? { ...f, zIndex: zIndexMap.get(f.id)! } : f));
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleSendToBack = () => {
        if (selectedIds.length === 0) return;
        const sortedItems = [...allRenderItems];
        for (let i = 1; i < sortedItems.length; i++) {
            if (selectedIds.includes(sortedItems[i].id) && !selectedIds.includes(sortedItems[i - 1].id)) {
                const temp = sortedItems[i];
                sortedItems[i] = sortedItems[i - 1];
                sortedItems[i - 1] = temp;
            }
        }
        const zIndexMap = new Map<string, number>();
        sortedItems.forEach((item, index) => zIndexMap.set(item.id, index + 1));
        setShapes(prev => prev.map(s => zIndexMap.has(s.id) ? { ...s, zIndex: zIndexMap.get(s.id)! } : s));
        setTexts(prev => prev.map(t => zIndexMap.has(t.id) ? { ...t, zIndex: zIndexMap.get(t.id)! } : t));
        setImages(prev => prev.map(i => zIndexMap.has(i.id) ? { ...i, zIndex: zIndexMap.get(i.id)! } : i));
        setFreehandLines(prev => prev.map(f => zIndexMap.has(f.id) ? { ...f, zIndex: zIndexMap.get(f.id)! } : f));
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleToggleLock = (id: string) => {
        const toggleLocked = (setter: any) => setter((prev: any[]) => prev.map(item => {
            if (item.id === id) return { ...item, isLocked: !item.isLocked };
            return item;
        }));
        toggleLocked(setShapes); toggleLocked(setTexts); toggleLocked(setImages); toggleLocked(setFreehandLines);
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) handleCopy();
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) handlePaste();
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0) {
                    selectedIds.forEach(id => handleDeleteObject(id));
                    setSelectedIds([]);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                }
            }
            else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (selectedIds.length === 0) return;
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                let dx = 0, dy = 0;
                if (e.key === 'ArrowUp') dy = -step;
                if (e.key === 'ArrowDown') dy = step;
                if (e.key === 'ArrowLeft') dx = -step;
                if (e.key === 'ArrowRight') dx = step;

                if (stageRef.current) {
                    selectedIds.forEach(id => {
                        const item = allRenderItems.find(i => i.id === id);
                        if (!item || item.isLocked) return;
                        const node = stageRef.current.findOne(`#${id}`);
                        if (node) { node.x(node.x() + dx); node.y(node.y() + dy); }
                    });
                    trRef.current?.forceUpdate();
                }
                const updateState = (prev: any[]) => prev.map(item =>
                    (selectedIds.includes(item.id) && !item.isLocked) ? { ...item, x: (item.x || 0) + dx, y: (item.y || 0) + dy } : item
                );
                setShapes(updateState); setTexts(updateState); setImages(updateState); setFreehandLines(updateState);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, allRenderItems, clipboard, handleDeleteObject]);

    const handleStageContextMenu = (e: any) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;
        if (e.target !== stage && e.target.getClassName() !== 'Transformer') {
            const id = e.target.id();
            const item = allRenderItems.find(i => i.id === id);
            if (id && (!item || !item.isLocked) && !selectedIds.includes(id)) setSelectedIds([id]);
        } else if (e.target === stage) setSelectedIds([]);
        setContextMenu({ visible: true, x: e.evt.clientX, y: e.evt.clientY });
    };

    const handleStageMouseDown = (e: any) => {
        if (e.evt.button === 2) return;
        if (isDrawingMode) {
            isDrawingRef.current = true;
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = pos.x / zoomLevel;
            const y = pos.y / zoomLevel;
            const newLine = {
                id: `freehand-${Date.now()}`, itemCategory: 'freehand' as const, x, y, points: [0, 0],
                stroke: brushColor, strokeWidth: brushSize, opacity: 1, scaleX: 1, scaleY: 1, rotation: 0,
                zIndex: allRenderItems.length > 0 ? Math.max(...allRenderItems.map(i => i.zIndex || 0)) + 1 : 1
            };
            setFreehandLines(prev => [...prev, newLine]);
            return;
        }
        if (e.target === e.target.getStage()) {
            const pos = e.target.getStage().getPointerPosition();
            if (!pos) return;
            setSelectionRect({ visible: true, x1: pos.x / zoomLevel, y1: pos.y / zoomLevel, x2: pos.x / zoomLevel, y2: pos.y / zoomLevel });
            if (!e.evt.shiftKey) setSelectedIds([]);
        }
    };

    const handleStageMouseMove = (e: any) => {
        if (isDrawingMode) {
            if (!isDrawingRef.current) return;
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = pos.x / zoomLevel;
            const y = pos.y / zoomLevel;
            setFreehandLines(prev => {
                if (prev.length === 0) return prev;
                const lastLine = { ...prev[prev.length - 1] };
                lastLine.points = [...lastLine.points, x - lastLine.x, y - lastLine.y];
                return [...prev.slice(0, prev.length - 1), lastLine];
            });
            return;
        }
        if (!selectionRect.visible) return;
        const pos = e.target.getStage().getPointerPosition();
        if (!pos) return;
        setSelectionRect((prev) => ({ ...prev, x2: pos.x / zoomLevel, y2: pos.y / zoomLevel }));
    };

    const handleStageMouseUp = (e: any) => {
        if (e.evt.button === 2) return;
        if (isDrawingMode) { isDrawingRef.current = false; return; }
        if (!selectionRect.visible) return;
        const xMin = Math.min(selectionRect.x1, selectionRect.x2);
        const xMax = Math.max(selectionRect.x1, selectionRect.x2);
        const yMin = Math.min(selectionRect.y1, selectionRect.y2);
        const yMax = Math.max(selectionRect.y2, selectionRect.y1);
        if (Math.abs(xMax - xMin) > 5 || Math.abs(yMax - yMin) > 5) {
            const stage = stageRef.current;
            if (stage) {
                const idsInside: string[] = [];
                allRenderItems.forEach((item) => {
                    if (item.isLocked) return;
                    const node = stage.findOne(`#${item.id}`);
                    if (node) {
                        const box = node.getClientRect();
                        const nodeX = box.x / zoomLevel; const nodeY = box.y / zoomLevel;
                        const nodeW = box.width / zoomLevel; const nodeH = box.height / zoomLevel;
                        if (nodeX >= xMin && nodeX + nodeW <= xMax && nodeY >= yMin && nodeY + nodeH <= yMax) idsInside.push(item.id);
                    }
                });
                if (idsInside.length > 0) {
                    const expandedIds = new Set<string>();
                    idsInside.forEach(id => {
                        const item = allRenderItems.find(i => i.id === id);
                        if (item?.groupId) allRenderItems.filter(i => i.groupId === item.groupId).forEach(i => expandedIds.add(i.id));
                        else expandedIds.add(id);
                    });
                    setSelectedIds((prev) => Array.from(new Set([...prev, ...Array.from(expandedIds)])));
                }
            }
        }
        setSelectionRect({ visible: false, x1: 0, y1: 0, x2: 0, y2: 0 });
    };

    const handleStageDragStart = (e: any) => {
        if (isDrawingMode) return;
        const node = e.target;
        if (node === stageRef.current || node.getClassName() === 'Transformer') return;

        const draggedId = node.id();

        if (!selectedIds.includes(draggedId)) {
            setSelectedIds([draggedId]);
            dragStartPositions.current = [{ id: draggedId, x: node.x(), y: node.y() }];
        } else {
            const stage = node.getStage();
            dragStartPositions.current = selectedIds.map(id => {
                const n = stage.findOne(`#${id}`);
                return { id, x: n ? n.x() : 0, y: n ? n.y() : 0 };
            });
        }
    };

    const handleStageDragMove = (e: any) => {
        if (isDrawingMode) return;
        const node = e.target;
        if (node === stageRef.current || node.getClassName() === 'Transformer') return;

        const box = node.getClientRect();
        const logicalBox = { x: box.x / zoomLevel, y: box.y / zoomLevel, width: box.width / zoomLevel, height: box.height / zoomLevel };
        const nodeCenterX = logicalBox.x + logicalBox.width / 2;
        const nodeCenterY = logicalBox.y + logicalBox.height / 2;
        const snapThreshold = 10 / zoomLevel;
        const newGuidelines: any[] = [];
        const xTargets = [0, canvasConfig.width / 2, canvasConfig.width];

        for (const target of xTargets) {
            if (Math.abs(nodeCenterX - target) < snapThreshold) { node.x(node.x() + (target - nodeCenterX)); newGuidelines.push({ type: 'vertical', val: target }); break; }
            if (Math.abs(logicalBox.x - target) < snapThreshold) { node.x(node.x() + (target - logicalBox.x)); newGuidelines.push({ type: 'vertical', val: target }); break; }
            if (Math.abs((logicalBox.x + logicalBox.width) - target) < snapThreshold) { node.x(node.x() + (target - (logicalBox.x + logicalBox.width))); newGuidelines.push({ type: 'vertical', val: target }); break; }
        }

        const yTargets = [0, canvasConfig.height / 2, canvasConfig.height];
        for (const target of yTargets) {
            if (Math.abs(nodeCenterY - target) < snapThreshold) { node.y(node.y() + (target - nodeCenterY)); newGuidelines.push({ type: 'horizontal', val: target }); break; }
            if (Math.abs(logicalBox.y - target) < snapThreshold) { node.y(node.y() + (target - logicalBox.y)); newGuidelines.push({ type: 'horizontal', val: target }); break; }
            if (Math.abs((logicalBox.y + logicalBox.height) - target) < snapThreshold) { node.y(node.y() + (target - (logicalBox.y + logicalBox.height))); newGuidelines.push({ type: 'horizontal', val: target }); break; }
        }

        setGuidelines(newGuidelines);

        if (selectedIds.length > 1 && selectedIds.includes(node.id())) {
            const stage = node.getStage();
            const startPos = dragStartPositions.current.find(p => p.id === node.id());
            if (startPos) {
                const dx = node.x() - startPos.x;
                const dy = node.y() - startPos.y;
                dragStartPositions.current.forEach(p => {
                    if (p.id !== node.id()) {
                        const otherNode = stage.findOne(`#${p.id}`);
                        if (otherNode) { otherNode.x(p.x + dx); otherNode.y(p.y + dy); }
                    }
                });
            }
        }
    };

    const handleStageDragEnd = (e: any) => {
        if (isDrawingMode) return;
        setGuidelines([]);
        const node = e.target;
        if (node === stageRef.current || node.getClassName() === 'Transformer') return;

        const stage = node.getStage();
        const draggedId = node.id();

        const updateItem = (setter: any) => setter((prev: any[]) => prev.map(item => {
            if (item.id === draggedId || (selectedIds.includes(draggedId) && selectedIds.includes(item.id))) {
                const n = stage.findOne(`#${item.id}`);
                if (n) return { ...item, x: n.x(), y: n.y() };
            }
            return item;
        }));

        updateItem(setShapes); updateItem(setTexts); updateItem(setImages); updateItem(setFreehandLines);
        dragStartPositions.current = [];
    };

    if (!isMounted || !fontsLoaded) return <div className="w-full h-full bg-gray-100 flex items-center justify-center"><p className="text-gray-400 animate-pulse">Yükleniyor...</p></div>;

    return (
        <div className="w-full h-full flex overflow-hidden relative">
            <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelectTemplate={handleLoadTemplate} />
            <IconModal isOpen={isIconModalOpen} onClose={() => setIsIconModalOpen(false)} onSelectIcon={handleAddIcon} />
            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExport} />

            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span>✨</span> YZ ile Görsel Üret
                            </h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-700">✖</button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Hayalindeki görseli İngilizce olarak detaylıca tarif et.</p>

                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="A futuristic city in sunset, synthwave style, high resolution..."
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none min-h-[100px]"
                        ></textarea>

                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                            <button
                                onClick={handleGenerateAIImage}
                                disabled={isGenerating || !aiPrompt.trim()}
                                className={`px-4 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 ${isGenerating || !aiPrompt.trim() ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {isGenerating ? 'Üretiliyor...' : 'Üret ve Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {saveMessage && (
                <div className="absolute top-20 right-8 z-50 bg-gray-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
                    {saveMessage}
                </div>
            )}

            {isZenMode && (
                <button
                    onClick={() => setIsZenMode(false)}
                    className="absolute top-4 right-4 z-[200] bg-gray-900 text-white px-5 py-2 rounded-full shadow-2xl opacity-40 hover:opacity-100 transition-opacity font-medium text-sm border border-gray-700 flex items-center gap-2"
                >
                    <span className="text-lg">✖</span> Odak Modundan Çık
                </button>
            )}

            {contextMenu.visible && !isZenMode && (
                <div
                    className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-2xl py-1.5 w-48 text-sm text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {selectedIds.length > 0 && (
                        <button onClick={handleCopy} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors">
                            <span className="font-medium text-gray-800">Kopyala</span>
                            <span className="text-xs text-gray-400 font-mono">Ctrl+C</span>
                        </button>
                    )}
                    {clipboard.length > 0 && (
                        <button onClick={handlePaste} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors">
                            <span className="font-medium text-gray-800">Yapıştır</span>
                            <span className="text-xs text-gray-400 font-mono">Ctrl+V</span>
                        </button>
                    )}
                    {selectedIds.length > 0 && (
                        <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={handleBringToFront} className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">Bir Öne Al</button>
                            <button onClick={handleSendToBack} className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">Bir Alta Gönder</button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => {
                                    selectedIds.forEach(id => handleDeleteObject(id));
                                    setSelectedIds([]);
                                    setContextMenu({ ...contextMenu, visible: false });
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium transition-colors"
                            >
                                Sil
                            </button>
                        </>
                    )}
                </div>
            )}

            {isDrawingMode && !isZenMode && (
                <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 px-4 py-2 rounded-full animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">✏️ Çizim Modu</span>
                    </div>
                    <div className="w-px h-5 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Renk:</span>
                        <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0 bg-white" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Kalınlık:</span>
                        <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-20 accent-blue-500" />
                        <span className="text-xs font-mono text-slate-600 w-6">{brushSize}px</span>
                    </div>
                    <div className="w-px h-5 bg-gray-300"></div>
                    <button onClick={() => setIsDrawingMode(false)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md font-bold transition-colors">Kapat</button>
                </div>
            )}

            <div className={`flex-1 overflow-hidden flex flex-col relative ${isZenMode ? 'bg-[#1e1e24]' : 'bg-[#e2e8f0]'}`}>

                {!isZenMode && (
                    <ControlsBar
                        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
                        onOpenIconModal={() => setIsIconModalOpen(true)}
                        handleImageUpload={handleImageUpload}
                        handleDownload={() => setIsExportModalOpen(true)}
                        fileInputRef={fileInputRef}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        isLoading={isLoadingProject}
                        backgroundColor={backgroundColor}
                        onBackgroundColorChange={setBackgroundColor}
                        canvasSize={canvasConfig}
                        onChangeCanvasSize={(w, h, name) => setCanvasConfig({ width: w, height: h, name })}
                        zoomLevel={zoomLevel}
                        onChangeZoom={setZoomLevel}

                        onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
                        isDrawingMode={isDrawingMode}
                        onOpenAiModal={() => setIsAiModalOpen(true)}
                        onRandomBackground={handleRandomBackground}
                        onPresentationMode={handlePresentationMode}
                        onZenMode={() => { setIsZenMode(true); setSelectedIds([]); }}
                        onAddFlowchartShape={handleAddFlowchartShape}
                        onAddShape={handleAddShape}
                        onAddText={handleAddText}

                        onDrawerStateChange={(isOpen) => setIsDrawerOpen(isOpen)}
                    />
                )}

                <div
                    ref={containerRef}
                    className="flex-1 w-full h-full relative flex items-center justify-center overflow-auto transition-all duration-300"
                    style={{
                        backgroundImage: isZenMode ? 'none' : "radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        cursor: isDrawingMode ? 'crosshair' : 'default',
                        paddingLeft: (isZenMode || isFullscreen) ? '0px' : (isDrawerOpen ? '304px' : '64px'),
                        paddingTop: (isZenMode || isFullscreen) ? '0px' : '48px'
                    }}
                >
                    <div className={`${!isZenMode && 'shadow-xl'} transition-all duration-200 ease-out origin-center m-auto`} style={{ width: canvasConfig.width * zoomLevel, height: canvasConfig.height * zoomLevel, backgroundColor: backgroundColor }}>
                        <Stage
                            ref={stageRef}
                            width={canvasConfig.width * zoomLevel}
                            height={canvasConfig.height * zoomLevel}
                            scale={{ x: zoomLevel, y: zoomLevel }}
                            onContextMenu={handleStageContextMenu}
                            onMouseDown={handleStageMouseDown}
                            onMouseMove={handleStageMouseMove}
                            onMouseUp={handleStageMouseUp}
                            onDragStart={handleStageDragStart}
                            onDragMove={handleStageDragMove}
                            onDragEnd={handleStageDragEnd}
                        >
                            <Layer>
                                <Rect x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} fill={backgroundColor} listening={false} />
                                {allRenderItems.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    if (item.itemCategory === 'freehand') {
                                        const pts = (item as any).points || [];
                                        return (
                                            <Line
                                                key={item.id} id={item.id} ref={isSelected ? shapeRef : null} points={pts}
                                                stroke={(item as any).stroke} strokeWidth={(item as any).strokeWidth}
                                                opacity={(item as any).opacity ?? 1} scaleX={(item as any).scaleX || 1} scaleY={(item as any).scaleY || 1}
                                                rotation={(item as any).rotation || 0} x={(item as any).x || 0} y={(item as any).y || 0}
                                                tension={0.5} lineCap="round" lineJoin="round"
                                                draggable={!isDrawingMode && !item.isLocked}
                                                listening={!isDrawingMode}
                                                onClick={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                onTap={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                onDragEnd={(e) => setFreehandLines(prev => prev.map(f => f.id === item.id ? { ...f, x: e.target.x(), y: e.target.y() } : f))}
                                                shadowColor={(item as any).shadowColor || 'transparent'}
                                                shadowBlur={(item as any).shadowBlur || 0}
                                                shadowOffsetX={(item as any).shadowOffsetX || 0}
                                                shadowOffsetY={(item as any).shadowOffsetY || 0}
                                            />
                                        );
                                    }
                                    if (item.itemCategory === 'image') {
                                        return (
                                            <URLImage
                                                key={item.id}
                                                imageItem={item as any}
                                                isSelected={isSelected}
                                                onSelect={(e: any) => {
                                                    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
                                                    if (!item.isLocked) handleSelectObject(item.id, e);
                                                }}
                                                shapeRef={shapeRef}
                                                onChange={(newAttrs: any) => setImages(prev => prev.map(i => i.id === item.id ? newAttrs : i))}
                                                opacity={item.opacity ?? 1}
                                                isDrawingMode={isDrawingMode}
                                            />
                                        );
                                    }
                                    if (item.itemCategory === 'shape') {
                                        if (item.type === 'icon') {
                                            const isGradient = !!item.gradientColor;
                                            return (
                                                <Path
                                                    key={item.id} id={item.id} data={(item as any).path}
                                                    fill={isGradient ? undefined : (item.fill || '#000')}
                                                    fillPriority={isGradient ? "linear" : "color"}
                                                    fillLinearGradientStartPoint={isGradient ? { x: 0, y: 0 } : undefined}
                                                    fillLinearGradientEndPoint={isGradient ? { x: 24, y: 24 } : undefined}
                                                    fillLinearGradientColorStops={isGradient ? [0, item.fill || '#000', 1, item.gradientColor] : undefined}
                                                    opacity={item.opacity ?? 1}
                                                    x={item.x || 0} y={item.y || 0}
                                                    scaleX={item.scaleX || 1} scaleY={item.scaleY || 1}
                                                    rotation={item.rotation || 0}
                                                    draggable={!isDrawingMode && !item.isLocked}
                                                    listening={!isDrawingMode}
                                                    onClick={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                    onTap={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                    onDragEnd={(e) => setShapes(prev => prev.map(s => s.id === item.id ? { ...s, x: e.target.x(), y: e.target.y() } : s))}
                                                    onTransformEnd={(e) => {
                                                        const node = e.target;
                                                        setShapes(prev => prev.map(s => s.id === item.id ? {
                                                            ...s, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation()
                                                        } : s));
                                                    }}
                                                    shadowColor={(item as any).shadowColor || 'transparent'} shadowBlur={(item as any).shadowBlur || 0}
                                                    shadowOffsetX={(item as any).shadowOffsetX || 0} shadowOffsetY={(item as any).shadowOffsetY || 0}
                                                />
                                            );
                                        }

                                        const handleTransformEnd = () => {
                                            const node = stageRef.current?.findOne(`#${item.id}`);
                                            if (node) setShapes(prev => prev.map(s => s.id === item.id ? { ...s, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() } : s));
                                        };
                                        return (
                                            <ShapeNode
                                                key={item.id} shapeItem={item as ShapeItem} isSelected={isSelected} shapeRef={shapeRef}
                                                onSelect={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }} onTransformEnd={handleTransformEnd}
                                                isDrawingMode={isDrawingMode}
                                            />
                                        );
                                    }

                                    if (item.itemCategory === 'text') {
                                        const textItem = item as any;

                                        if (textItem.isCurved && textItem.curveRadius) {
                                            const r = Math.max(20, textItem.curveRadius);
                                            const pathData = `M ${-r},0 A ${r},${r} 0 1,1 ${r},0 A ${r},${r} 0 1,1 ${-r},0`;

                                            return (
                                                <TextPath
                                                    key={item.id}
                                                    id={item.id}
                                                    x={item.x}
                                                    y={item.y}
                                                    fill={item.fill}
                                                    scaleX={1}
                                                    scaleY={1}
                                                    rotation={item.rotation || 0}
                                                    draggable={!isDrawingMode && !item.isLocked}
                                                    listening={!isDrawingMode}

                                                    text={textItem.text}
                                                    fontSize={textItem.fontSize}
                                                    fontFamily={textItem.fontFamily || 'Arial'}
                                                    data={pathData}

                                                    shadowColor={item.shadowColor || 'transparent'}
                                                    shadowBlur={item.shadowBlur || 0}
                                                    shadowOffsetX={item.shadowOffsetX || 0}
                                                    shadowOffsetY={item.shadowOffsetY || 0}

                                                    onClick={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                    onTap={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                    onTransformEnd={(e) => {
                                                        const node = e.target;
                                                        const scaleX = node.scaleX();
                                                        const scaleY = node.scaleY();
                                                        node.scaleX(1);
                                                        node.scaleY(1);

                                                        setTexts(prev => prev.map(t => {
                                                            if (t.id === textItem.id) {
                                                                const newFontSize = Math.max(8, textItem.fontSize * Math.max(scaleX, scaleY));
                                                                return {
                                                                    ...t,
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    fontSize: newFontSize,
                                                                    scaleX: 1,
                                                                    scaleY: 1,
                                                                    rotation: node.rotation()
                                                                };
                                                            }
                                                            return t;
                                                        }));
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Text
                                                key={item.id}
                                                id={item.id}
                                                x={item.x}
                                                y={item.y}
                                                fill={item.fill}
                                                scaleX={1}
                                                scaleY={1}
                                                rotation={item.rotation || 0}
                                                draggable={!isDrawingMode && !item.isLocked}
                                                listening={!isDrawingMode}
                                                text={textItem.text}
                                                fontSize={textItem.fontSize}
                                                fontFamily={textItem.fontFamily || 'Arial'}
                                                width={textItem.width}

                                                shadowColor={item.shadowColor || 'transparent'}
                                                shadowBlur={item.shadowBlur || 0}
                                                shadowOffsetX={item.shadowOffsetX || 0}
                                                shadowOffsetY={item.shadowOffsetY || 0}

                                                onClick={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                onTap={(e: any) => { if (!item.isLocked) handleSelectObject(item.id, e); }}
                                                onTransformEnd={(e) => {
                                                    const node = e.target;
                                                    const scaleX = node.scaleX();
                                                    const scaleY = node.scaleY();
                                                    node.scaleX(1);
                                                    node.scaleY(1);

                                                    setTexts(prev => prev.map(t => {
                                                        if (t.id === textItem.id) {
                                                            const newWidth = Math.max(50, node.width() * scaleX);
                                                            const newFontSize = Math.max(8, textItem.fontSize * scaleY);
                                                            return {
                                                                ...t,
                                                                x: node.x(),
                                                                y: node.y(),
                                                                width: newWidth,
                                                                fontSize: newFontSize,
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                rotation: node.rotation()
                                                            };
                                                        }
                                                        return t;
                                                    }));
                                                }}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                                {selectionRect.visible && !isZenMode && (
                                    <Rect
                                        x={Math.min(selectionRect.x1, selectionRect.x2)} y={Math.min(selectionRect.y1, selectionRect.y2)}
                                        width={Math.abs(selectionRect.x2 - selectionRect.x1)} height={Math.abs(selectionRect.y2 - selectionRect.y1)}
                                        fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth={1 / zoomLevel} dash={[4 / zoomLevel, 4 / zoomLevel]}
                                    />
                                )}
                                {guidelines.map((line, index) => (
                                    <Line
                                        key={`guide-${index}`}
                                        points={line.type === 'vertical' ? [line.val, 0, line.val, canvasConfig.height] : [0, line.val, canvasConfig.width, line.val]}
                                        stroke="#ff00ff" strokeWidth={1.5 / zoomLevel} dash={[5 / zoomLevel, 5 / zoomLevel]} listening={false}
                                    />
                                ))}
                                {selectedIds.length > 0 && !isDrawingMode && (
                                    <Transformer
                                        ref={trRef}
                                        flipEnabled={!isOnlyTextSelected}
                                        enabledAnchors={isOnlyTextSelected ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'] : ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']}
                                    />
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
            </div>

            {!isZenMode && (
                <PropertiesPanel
                    selectedObject={selectedObject} onUpdateObject={handleUpdateObject} onDeleteObject={handleDeleteObject} allRenderItems={allRenderItems}
                    onSelectLayer={(id) => handleSelectObject(id, null)} onReorderLayers={handleReorderLayers}
                    onGroup={handleGroup} onUngroup={handleUngroup} isMultipleSelected={isMultipleSelected} isGrouped={isGrouped}
                    onToggleLock={handleToggleLock}
                    onBringToFront={handleBringToFront}
                    onSendToBack={handleSendToBack}
                />
            )}
        </div>
    );
}
