// src/components/refactored/hooks/useCanvasArea.ts

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { ShapeItem, TextItem, ImageItem, FreehandLineItem } from "../types";
import { TEMPLATES } from "../data/templates";

export const useCanvasArea = (dimensions: { width: number; height: number }, stageRef: React.RefObject<any>) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const shapeRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    const clipboardRef = useRef<any[]>([]);

    const [shapes, setShapes] = useState<ShapeItem[]>([]);
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [freehandLines, setFreehandLines] = useState<FreehandLineItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [selectionRect, setSelectionRect] = useState({ visible: false, x1: 0, y1: 0, x2: 0, y2: 0 });

    const [historyState, setHistoryState] = useState({
        history: [{ shapes: [], texts: [], images: [], freehandLines: [] }],
        step: 0
    });
    const isHistoryAction = useRef(false);

    useEffect(() => {
        if (isHistoryAction.current) {
            isHistoryAction.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const currentState = {
                shapes: JSON.parse(JSON.stringify(shapes)),
                texts: JSON.parse(JSON.stringify(texts)),
                images: JSON.parse(JSON.stringify(images)),
                freehandLines: JSON.parse(JSON.stringify(freehandLines))
            };

            setHistoryState(prev => {
                const lastSavedState = prev.history[prev.step];
                if (JSON.stringify(lastSavedState) === JSON.stringify(currentState)) return prev;

                const newHistory = prev.history.slice(0, prev.step + 1);
                newHistory.push(currentState);
                if (newHistory.length > 30) newHistory.shift();

                return { history: newHistory, step: newHistory.length - 1 };
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [shapes, texts, images, freehandLines]);

    const handleUndo = () => {
        if (historyState.step > 0) {
            isHistoryAction.current = true;
            const newStep = historyState.step - 1;
            const prevState = historyState.history[newStep];
            setShapes(prevState.shapes);
            setTexts(prevState.texts);
            setImages(prevState.images);
            setFreehandLines(prevState.freehandLines || []);
            setSelectedIds([]);
            setHistoryState(prev => ({ ...prev, step: newStep }));
        }
    };

    const handleRedo = () => {
        if (historyState.step < historyState.history.length - 1) {
            isHistoryAction.current = true;
            const newStep = historyState.step + 1;
            const nextState = historyState.history[newStep];
            setShapes(nextState.shapes);
            setTexts(nextState.texts);
            setImages(nextState.images);
            setFreehandLines(nextState.freehandLines || []);
            setSelectedIds([]);
            setHistoryState(prev => ({ ...prev, step: newStep }));
        }
    };

    const canUndo = historyState.step > 0;
    const canRedo = historyState.step < historyState.history.length - 1;

    useEffect(() => {
        if (!transformerRef.current) return;
        const stage = transformerRef.current.getStage();
        if (!stage) return;

        const selectedNodes = selectedIds.map((id) => stage.findOne(`#${id}`)).filter(Boolean);

        if (selectedNodes.length > 0) {
            transformerRef.current.nodes(selectedNodes);
            transformerRef.current.getLayer()?.batchDraw();
        } else {
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedIds, shapes, texts, images, freehandLines]);

    const getNextZIndex = () => {
        const allItems = [...shapes, ...texts, ...images, ...freehandLines];
        if (allItems.length === 0) return 1;
        return Math.max(...allItems.map(i => i.zIndex || 0)) + 1;
    };

    const addRectangle = () => setShapes((prev) => [...prev, { id: `rect-${Date.now()}`, type: "rect", x: dimensions.width / 2 - 60, y: dimensions.height / 2 - 40, width: 120, height: 80, fill: "#10b981", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addCircle = () => setShapes((prev) => [...prev, { id: `circle-${Date.now()}`, type: "circle", x: dimensions.width / 2, y: dimensions.height / 2, radius: 50, fill: "#8b5cf6", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addTriangle = () => setShapes((prev) => [...prev, { id: `triangle-${Date.now()}`, type: "triangle", x: dimensions.width / 2, y: dimensions.height / 2, radius: 60, fill: "#f59e0b", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addStar = () => setShapes((prev) => [...prev, { id: `star-${Date.now()}`, type: "star", x: dimensions.width / 2, y: dimensions.height / 2, innerRadius: 25, outerRadius: 50, fill: "#ec4899", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addLine = () => setShapes((prev) => [...prev, { id: `line-${Date.now()}`, type: "line", x: dimensions.width / 2 - 50, y: dimensions.height / 2, points: [0, 0, 100, 0], stroke: "#374151", strokeWidth: 4, scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addDashedLine = () => setShapes((prev) => [...prev, { id: `dashed-${Date.now()}`, type: "dashedLine", x: dimensions.width / 2 - 60, y: dimensions.height / 2, points: [0, 0, 120, 0], stroke: "#64748b", strokeWidth: 4, dash: [12, 8], scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addArrow = () => setShapes((prev) => [...prev, { id: `arrow-${Date.now()}`, type: "arrow", x: dimensions.width / 2 - 60, y: dimensions.height / 2, points: [0, 0, 120, 0], stroke: "#2563eb", fill: "#2563eb", strokeWidth: 4, pointerLength: 18, pointerWidth: 18, scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addEllipse = () => setShapes((prev) => [...prev, { id: `ellipse-${Date.now()}`, type: "ellipse", x: dimensions.width / 2, y: dimensions.height / 2, radiusX: 70, radiusY: 45, fill: "#06b6d4", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addPentagon = () => setShapes((prev) => [...prev, { id: `pentagon-${Date.now()}`, type: "pentagon", x: dimensions.width / 2, y: dimensions.height / 2, radius: 55, fill: "#14b8a6", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addHexagon = () => setShapes((prev) => [...prev, { id: `hexagon-${Date.now()}`, type: "hexagon", x: dimensions.width / 2, y: dimensions.height / 2, radius: 55, fill: "#6366f1", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addDiamond = () => setShapes((prev) => [...prev, { id: `diamond-${Date.now()}`, type: "diamond", x: dimensions.width / 2 - 50, y: dimensions.height / 2 - 50, width: 100, height: 100, fill: "#a855f7", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addRing = () => setShapes((prev) => [...prev, { id: `ring-${Date.now()}`, type: "ring", x: dimensions.width / 2, y: dimensions.height / 2, innerRadius: 35, outerRadius: 55, fill: "#f97316", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addHeart = () => setShapes((prev) => [...prev, { id: `heart-${Date.now()}`, type: "heart", x: dimensions.width / 2, y: dimensions.height / 2, fill: "#ef4444", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addStickyNote = () => setShapes((prev) => [...prev, { id: `sticky-${Date.now()}`, type: "stickyNote", x: dimensions.width / 2 - 70, y: dimensions.height / 2 - 50, width: 140, height: 100, fill: "#fef08a", cornerRadius: 6, scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);
    const addText = () => setTexts((prev) => [...prev, { id: `text-${Date.now()}`, text: "Yeni Metin", x: dimensions.width / 2 - 125, y: dimensions.height / 2 - 20, width: 250, fontSize: 32, fill: "#1f2937", scaleX: 1, scaleY: 1, rotation: 0, zIndex: getNextZIndex() }]);

    useEffect(() => {
        (window as any).addNewRectangle = addRectangle;
        (window as any).addNewCircle = addCircle;
        (window as any).addNewTriangle = addTriangle;
        (window as any).addNewStar = addStar;
        (window as any).addNewLine = addLine;
        (window as any).addNewDashedLine = addDashedLine;
        (window as any).addNewArrow = addArrow;
        (window as any).addNewEllipse = addEllipse;
        (window as any).addNewPentagon = addPentagon;
        (window as any).addNewHexagon = addHexagon;
        (window as any).addNewDiamond = addDiamond;
        (window as any).addNewRing = addRing;
        (window as any).addNewHeart = addHeart;
        (window as any).addNewStickyNote = addStickyNote;
        (window as any).addNewText = addText;
    }, [dimensions, shapes, texts, images, freehandLines]);

    const handleGroup = () => {
        if (selectedIds.length < 2) return;
        const newGroupId = `group-${Date.now()}`;
        setShapes(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, groupId: newGroupId } : s));
        setTexts(prev => prev.map(t => selectedIds.includes(t.id) ? { ...t, groupId: newGroupId } : t));
        setImages(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, groupId: newGroupId } : i));
        setFreehandLines(prev => prev.map(f => selectedIds.includes(f.id) ? { ...f, groupId: newGroupId } : f));
    };

    const handleUngroup = () => {
        if (selectedIds.length === 0) return;
        setShapes(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, groupId: undefined } : s));
        setTexts(prev => prev.map(t => selectedIds.includes(t.id) ? { ...t, groupId: undefined } : t));
        setImages(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, groupId: undefined } : i));
        setFreehandLines(prev => prev.map(f => selectedIds.includes(f.id) ? { ...f, groupId: undefined } : f));
    };

    const handleSelectObject = (id: string, e?: any) => {
        const isShiftPressed = e && e.evt && e.evt.shiftKey;
        const allItems = [...shapes, ...texts, ...images, ...freehandLines];
        const clickedItem = allItems.find(i => i.id === id);

        if (clickedItem?.groupId) {
            const groupMembers = allItems.filter(i => i.groupId === clickedItem.groupId).map(i => i.id);
            if (isShiftPressed) {
                const isGroupSelected = groupMembers.every(mId => selectedIds.includes(mId));
                if (isGroupSelected) {
                    setSelectedIds(prev => prev.filter(pId => !groupMembers.includes(pId)));
                } else {
                    setSelectedIds(prev => Array.from(new Set([...prev, ...groupMembers])));
                }
            } else {
                setSelectedIds(groupMembers);
            }
        } else {
            if (isShiftPressed) {
                setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
            } else {
                setSelectedIds([id]);
            }
        }
    };

    const handleLoadTemplate = (templateKey: string) => {
        if (!templateKey || !TEMPLATES[templateKey]) return;
        if (shapes.length > 0 || texts.length > 0 || images.length > 0 || freehandLines.length > 0) {
            const confirmLoad = window.confirm("Yeni şablon yüklendiğinde mevcut tasarımınız silinecek. Onaylıyor musunuz?");
            if (!confirmLoad) return;
        }
        const template = TEMPLATES[templateKey];
        isHistoryAction.current = true;
        setShapes(JSON.parse(JSON.stringify(template.shapes)));
        setTexts(JSON.parse(JSON.stringify(template.texts)));
        setImages([]);
        setFreehandLines([]);
        setSelectedIds([]);
        setHistoryState({
            history: [{ shapes: template.shapes, texts: template.texts, images: [], freehandLines: [] }],
            step: 0
        });
    };

    // Görseller artık geçici Blob URL yerine kalıcı Base64 (sıkıştırılmış JPEG) olarak kaydediliyor.
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Hata: Lütfen sadece geçerli bir görsel dosyası (JPG, PNG vb.) yükleyin.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // Firebase 1MB sınırını aşmamak için geçici bir canvas ile resmi sıkıştırıyoruz
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let { width, height } = img;
                const maxDim = 800; // Maksimum çözünürlüğü kısıtlıyoruz (kalite/boyut dengesi)

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = (height / width) * maxDim;
                        width = maxDim;
                    } else {
                        width = (width / height) * maxDim;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                // Resmi %70 kaliteyle JPEG Base64 formatına çeviriyoruz (Kalıcı veri)
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

                const maxWidth = dimensions.width * 0.5;
                const maxHeight = dimensions.height * 0.5;
                let scale = 1;
                if (width > maxWidth || height > maxHeight) {
                    const scaleX = maxWidth / width;
                    const scaleY = maxHeight / height;
                    scale = Math.min(scaleX, scaleY);
                }

                const newImage: ImageItem = {
                    id: `image-${Date.now()}`,
                    url: compressedBase64, 
                    width: width,
                    height: height,
                    x: dimensions.width / 2 - (width * scale) / 2,
                    y: dimensions.height / 2 - (height * scale) / 2,
                    scaleX: scale,
                    scaleY: scale,
                    rotation: 0,
                    zIndex: getNextZIndex(),
                    opacity: 1,
                };

                setImages((prev) => [...prev, newImage]);
                setSelectedIds([newImage.id]);
            };
        };

        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDownload = () => {
        if (!stageRef.current) return;
        setSelectedIds([]);
        setTimeout(() => {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
            const link = document.createElement("a");
            link.download = "mini-canva-tasarim.png";
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 50);
    };

    const primarySelectedId = selectedIds.length === 1 ? selectedIds[0] : null;
    const selectedShape = shapes.find((s) => s.id === primarySelectedId);
    const selectedText = texts.find((t) => t.id === primarySelectedId);
    const selectedImage = images.find((i) => i.id === primarySelectedId);
    const selectedFreehand = freehandLines.find((f) => f.id === primarySelectedId);
    const selectedObject = selectedShape || selectedText || selectedImage || selectedFreehand || null;

    const handleUpdateObject = (updatedProps: any) => {
        if (selectedIds.length === 0) return;

        if (updatedProps.action && selectedIds.length === 1) {
            const selectedId = selectedIds[0];
            const allItems = [...shapes, ...texts, ...images, ...freehandLines];
            const sorted = [...allItems].sort((a, b) => {
                const dz = (a.zIndex || 0) - (b.zIndex || 0);
                if (dz !== 0) return dz;
                return a.id.localeCompare(b.id);
            });

            const idx = sorted.findIndex((i) => i.id === selectedId);
            if (idx === -1) return;

            const current = sorted[idx];
            let neighbor: (typeof sorted)[number] | undefined;

            if (updatedProps.action === "bringForward" && idx < sorted.length - 1) {
                neighbor = sorted[idx + 1];
            } else if (updatedProps.action === "sendBackward" && idx > 0) {
                neighbor = sorted[idx - 1];
            }

            if (!neighbor) return;

            const currentZ = current.zIndex ?? 0;
            const neighborZ = neighbor.zIndex ?? 0;

            const setZForId = (id: string, zIndex: number) => {
                setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, zIndex } : s)));
                setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, zIndex } : t)));
                setImages((prev) => prev.map((i) => (i.id === id ? { ...i, zIndex } : i)));
                setFreehandLines((prev) => prev.map((f) => (f.id === id ? { ...f, zIndex } : f)));
            };

            if (currentZ === neighborZ) {
                setZForId(current.id, updatedProps.action === "bringForward" ? neighborZ + 1 : neighborZ - 1);
            } else {
                setZForId(current.id, neighborZ);
                setZForId(neighbor.id, currentZ);
            }
            return;
        }

        if ('rotation' in updatedProps && selectedIds.length === 1) {
            const id = selectedIds[0];
            const item = shapes.find(s => s.id === id) || texts.find(t => t.id === id) || images.find(i => i.id === id) || freehandLines.find(f => f.id === id);

            if (item) {
                const isImage = 'url' in item;
                const isText = 'text' in item;
                const isTopLeftShape = 'type' in item && ['rect', 'stickyNote', 'diamond'].includes((item as any).type);
                const isFreehand = 'itemCategory' in item && item.itemCategory === 'freehand';

                if (isImage || isText || isTopLeftShape || isFreehand) {
                    const node = stageRef.current?.findOne(`#${id}`);
                    if (node) {
                        const localCenterX = node.width ? node.width() / 2 : 0;
                        const localCenterY = node.height ? node.height() / 2 : 0;
                        const absCenter = node.getTransform().point({ x: localCenterX, y: localCenterY });

                        const oldRotation = node.rotation();
                        node.rotation(updatedProps.rotation);
                        const newAbsCenter = node.getTransform().point({ x: localCenterX, y: localCenterY });

                        updatedProps.x = node.x() + (absCenter.x - newAbsCenter.x);
                        updatedProps.y = node.y() + (absCenter.y - newAbsCenter.y);
                        node.rotation(oldRotation);
                    }
                }
            }
        }

        setShapes(shapes.map((s) => (selectedIds.includes(s.id) ? { ...s, ...updatedProps } : s)));
        setTexts(texts.map((t) => (selectedIds.includes(t.id) ? { ...t, ...updatedProps } : t)));
        setImages(images.map((i) => (selectedIds.includes(i.id) ? { ...i, ...updatedProps } : i)));
        setFreehandLines(freehandLines.map((f) => (selectedIds.includes(f.id) ? { ...f, ...updatedProps } : f)));
    };

    const handleDeleteObject = () => {
        if (selectedIds.length === 0) return;
        setShapes(shapes.filter((s) => !selectedIds.includes(s.id)));
        setTexts(texts.filter((t) => !selectedIds.includes(t.id)));
        setImages(images.filter((i) => !selectedIds.includes(i.id)));
        setFreehandLines(freehandLines.filter((f) => !selectedIds.includes(f.id)));
        setSelectedIds([]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedIds.length > 0) handleDeleteObject();
            }

            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();

                if (key === "z") {
                    e.preventDefault();
                    handleUndo();
                }

                if (key === "g") {
                    e.preventDefault();
                    if (e.shiftKey) {
                        handleUngroup();
                    } else {
                        handleGroup();
                    }
                }

                if (key === "c") {
                    if (selectedIds.length > 0) {
                        e.preventDefault();
                        const copiedItems = selectedIds.map(id => {
                            const stage = stageRef.current;
                            const node = stage ? stage.findOne(`#${id}`) : null;

                            const stageX = node ? node.x() : undefined;
                            const stageY = node ? node.y() : undefined;

                            const shape = shapes.find(s => s.id === id);
                            if (shape) {
                                return {
                                    ...shape,
                                    x: stageX ?? shape.x ?? (dimensions.width / 2 - 50),
                                    y: stageY ?? shape.y ?? (dimensions.height / 2 - 50),
                                    __itemType: 'shape'
                                };
                            }

                            const text = texts.find(t => t.id === id);
                            if (text) {
                                return {
                                    ...text,
                                    x: stageX ?? text.x ?? (dimensions.width / 2 - 50),
                                    y: stageY ?? text.y ?? (dimensions.height / 2 - 50),
                                    __itemType: 'text'
                                };
                            }

                            const image = images.find(i => i.id === id);
                            if (image) {
                                return {
                                    ...image,
                                    x: stageX ?? image.x ?? (dimensions.width / 2 - 50),
                                    y: stageY ?? image.y ?? (dimensions.height / 2 - 50),
                                    __itemType: 'image'
                                };
                            }

                            const line = freehandLines.find(f => f.id === id);
                            if (line) {
                                return {
                                    ...line,
                                    x: stageX ?? line.x ?? (dimensions.width / 2 - 50),
                                    y: stageY ?? line.y ?? (dimensions.height / 2 - 50),
                                    __itemType: 'freehand'
                                };
                            }

                            return null;
                        }).filter(Boolean);
                        clipboardRef.current = copiedItems;
                    }
                }

                if (key === "v") {
                    if (clipboardRef.current.length > 0) {
                        e.preventDefault();
                        const newShapes = [...shapes];
                        const newTexts = [...texts];
                        const newImages = [...images];
                        const newFreehandLines = [...freehandLines];
                        const newSelectedIds: string[] = [];
                        let currentZIndex = getNextZIndex();

                        const groupMap = new Map<string, string>();

                        clipboardRef.current.forEach((item, index) => {
                            const newId = `${item.__itemType}-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;

                            let newGroupId = undefined;
                            if (item.groupId) {
                                if (!groupMap.has(item.groupId)) {
                                    groupMap.set(item.groupId, `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
                                }
                                newGroupId = groupMap.get(item.groupId);
                            }

                            const pastedItem = {
                                ...item,
                                id: newId,
                                groupId: newGroupId,
                                x: (item.x ?? 0) + 40,
                                y: (item.y ?? 0) + 40,
                                zIndex: currentZIndex++
                            };
                            delete pastedItem.__itemType;

                            if (item.__itemType === 'shape') newShapes.push(pastedItem);
                            if (item.__itemType === 'text') newTexts.push(pastedItem);
                            if (item.__itemType === 'image') newImages.push(pastedItem);
                            if (item.__itemType === 'freehand') newFreehandLines.push(pastedItem);

                            newSelectedIds.push(newId);
                        });

                        setShapes(newShapes);
                        setTexts(newTexts);
                        setImages(newImages);
                        setFreehandLines(newFreehandLines);

                        setTimeout(() => setSelectedIds(newSelectedIds), 10);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIds, shapes, texts, images, freehandLines, historyState]);

    return {
        shapes, setShapes, texts, setTexts, images, setImages,
        freehandLines, setFreehandLines,
        selectedIds, setSelectedIds, handleSelectObject, shapeRef, trRef: transformerRef, fileInputRef,
        selectedObject, handleLoadTemplate, handleImageUpload,
        handleDownload, handleUpdateObject, handleDeleteObject,
        selectionRect, setSelectionRect,
        handleUndo, handleRedo, canUndo, canRedo,
        handleGroup, handleUngroup
    };
};
